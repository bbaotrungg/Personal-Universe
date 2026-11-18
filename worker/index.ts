import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Types
import type { UniverseContent } from '../src/types';
import { personalData } from '../src/data/personal';
import { interestsData } from '../src/data/interests';
import { favoritesData } from '../src/data/favorites';
import { personalityData } from '../src/data/personality';
import { memoriesData } from '../src/data/memories';
import { socialLinksData } from '../src/data/social';

export interface Env {
  DB: D1Database;
  ASSETS?: Fetcher;
  OWNER_ACCESS_CODE?: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
}

const defaultContent: UniverseContent = {
  personal: personalData,
  interests: interestsData,
  favorites: favoritesData,
  personality: personalityData,
  memories: memoriesData,
  socialLinks: socialLinksData,
  publicSlug: 'bao-trung',
  lastPublishedAt: new Date().toISOString(),
};

/* ==========================================================================
   CRYPTOGRAPHIC & CLOUDINARY SIGNING HELPERS
   ========================================================================== */

async function timingSafeEqualString(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const aBuf = encoder.encode(a.trim());
  const bBuf = encoder.encode(b.trim());
  if (aBuf.byteLength !== bBuf.byteLength) return false;

  const key = await crypto.subtle.generateKey(
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const [sigA, sigB] = await Promise.all([
    crypto.subtle.sign('HMAC', key, aBuf),
    crypto.subtle.sign('HMAC', key, bBuf),
  ]);
  const u8A = new Uint8Array(sigA);
  const u8B = new Uint8Array(sigB);
  let diff = 0;
  for (let i = 0; i < u8A.length; i++) {
    diff |= u8A[i] ^ u8B[i];
  }
  return diff === 0;
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function generateRandomHex(length = 8): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Tạo chữ ký Cloudinary SHA-1 theo chuẩn API:
 * Sắp xếp các tham số theo thứ tự bảng chữ cái A-Z, nối dạng key=val&key2=val2 và gắn api_secret ở cuối
 */
async function generateCloudinarySignature(
  params: Record<string, string | number>,
  apiSecret: string
): Promise<string> {
  const sortedKeys = Object.keys(params).sort();
  const toSign = sortedKeys.map((k) => `${k}=${params[k]}`).join('&') + apiSecret;
  const encoder = new TextEncoder();
  const data = encoder.encode(toSign);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function normalizeContent(raw: unknown): UniverseContent {
  if (!raw || typeof raw !== 'object') {
    return defaultContent;
  }
  const obj = raw as Record<string, unknown>;
  if (obj.content && typeof obj.content === 'object') {
    const inner = obj.content as Record<string, unknown>;
    if (inner.personal) {
      return {
        ...(inner as unknown as UniverseContent),
        lastPublishedAt:
          (obj.lastPublishedAt as string) ||
          (inner.lastPublishedAt as string) ||
          new Date().toISOString(),
      };
    }
  }
  return raw as UniverseContent;
}

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

/* ==========================================================================
   AUTHENTICATION MIDDLEWARE
   ========================================================================== */
async function getAuthenticatedSession(
  db: D1Database,
  authHeader?: string | null
): Promise<{ valid: boolean; expiresAt?: number }> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false };
  }
  const token = authHeader.substring(7).trim();
  if (!token) return { valid: false };

  const tokenHashed = await hashToken(token);
  const row = await db
    .prepare('SELECT expires_at FROM sessions WHERE token_hash = ?')
    .bind(tokenHashed)
    .first<{ expires_at: number }>();

  if (!row) return { valid: false };

  const now = Date.now();
  if (now > row.expires_at) {
    // Tự động dọn dẹp phiên hết hạn
    await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHashed).run();
    return { valid: false };
  }

  return { valid: true, expiresAt: row.expires_at };
}

/* ==========================================================================
   LEGACY MEDIA REDIRECT (Chuyển tiếp /uploads/:filename sang Cloudinary URL)
   ========================================================================== */
app.get('/uploads/:filename', async (c) => {
  const filename = c.req.param('filename');
  if (!filename || filename.includes('..') || filename.includes('/')) {
    return c.text('Tệp không hợp lệ', 400);
  }

  try {
    const record = await c.env.DB.prepare(
      'SELECT cloudinary_url FROM media_records WHERE filename = ? OR id = ?'
    )
      .bind(filename, filename)
      .first<{ cloudinary_url: string }>();

    if (record && record.cloudinary_url) {
      return c.redirect(record.cloudinary_url, 302);
    }
  } catch (err) {
    console.error('Error looking up media record:', err);
  }

  return c.text('Không tìm thấy tệp phương tiện.', 404);
});

/* ==========================================================================
   AUTHENTICATION ENDPOINTS
   ========================================================================== */

/**
 * 1. POST /api/auth/verify
 * Xác thực Owner Access Code, cấp token phiên 24h
 */
app.post('/api/auth/verify', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const rawCode = body?.code ?? body?.accessCode;

  if (!rawCode || typeof rawCode !== 'string') {
    return c.json({ success: false, message: 'Vui lòng cung cấp mã truy cập.' }, 400);
  }

  const secret = c.env.OWNER_ACCESS_CODE || 'bimat';
  const isMatch = await timingSafeEqualString(rawCode, secret);

  if (!isMatch) {
    return c.json(
      {
        success: false,
        message: 'Mã truy cập không chính xác. Vui lòng kiểm tra lại.',
      },
      401
    );
  }

  const token = generateToken();
  const tokenHashed = await hashToken(token);
  const now = Date.now();
  const expiresAt = now + 24 * 60 * 60 * 1000; // 24 giờ

  await c.env.DB.prepare(
    'INSERT OR REPLACE INTO sessions (token_hash, created_at, expires_at) VALUES (?, ?, ?)'
  )
    .bind(tokenHashed, now, expiresAt)
    .run();

  return c.json({
    success: true,
    token,
    expiresAt,
    message: 'Xác thực thành công. Đã bật chế độ chỉnh sửa (Owner Mode).',
  });
});

/**
 * 2. POST /api/auth/check & GET /api/auth/check
 * Kiểm tra tính hợp lệ của phiên chỉnh sửa
 */
const checkSessionHandler = async (c: any) => {
  let authHeader = c.req.header('authorization');
  if (!authHeader) {
    const body = await c.req.json().catch(() => ({}));
    if (body?.token) {
      authHeader = `Bearer ${body.token}`;
    }
  }

  const session = await getAuthenticatedSession(c.env.DB, authHeader);
  return c.json(session);
};
app.post('/api/auth/check', checkSessionHandler);
app.get('/api/auth/check', checkSessionHandler);

/**
 * 3. POST /api/auth/logout
 * Đăng xuất kết thúc phiên Owner
 */
app.post('/api/auth/logout', async (c) => {
  let authHeader = c.req.header('authorization');
  if (!authHeader) {
    const body = await c.req.json().catch(() => ({}));
    if (body?.token) authHeader = `Bearer ${body.token}`;
  }

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const tokenHashed = await hashToken(token);
    await c.env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?')
      .bind(tokenHashed)
      .run();
  }

  return c.json({ success: true, message: 'Đã thoát chế độ chỉnh sửa.' });
});

/* ==========================================================================
   CONTENT MANAGEMENT ENDPOINTS (Draft vs Published Isolation)
   ========================================================================== */

/**
 * 4. GET /api/content
 * Endpoint công khai cho khách truy cập (CHỈ trả về dữ liệu Published)
 */
app.get('/api/content', async (c) => {
  try {
    const row = await c.env.DB.prepare(
      'SELECT data, published_at FROM content WHERE key = ?'
    )
      .bind('published')
      .first<{ data: string; published_at: string }>();

    let content: UniverseContent = defaultContent;
    if (row && row.data) {
      content = normalizeContent(JSON.parse(row.data));
      if (row.published_at) {
        content.lastPublishedAt = row.published_at;
      }
    }

    return c.json({
      success: true,
      data: content,
      isPublishedVersion: true,
    });
  } catch (err) {
    console.error('Error fetching published content:', err);
    return c.json({
      success: true,
      data: defaultContent,
      isPublishedVersion: true,
    });
  }
});

/**
 * 5. GET /api/content/draft
 * Endpoint cho chủ sở hữu: Lấy dữ liệu bản nháp để chỉnh sửa
 */
app.get('/api/content/draft', async (c) => {
  const session = await getAuthenticatedSession(c.env.DB, c.req.header('authorization'));
  if (!session.valid) {
    return c.json({ success: false, message: 'Yêu cầu quyền chủ sở hữu.' }, 401);
  }

  try {
    const row = await c.env.DB.prepare(
      'SELECT data FROM content WHERE key = ?'
    )
      .bind('draft')
      .first<{ data: string }>();

    let draft: UniverseContent = defaultContent;
    if (row && row.data) {
      draft = normalizeContent(JSON.parse(row.data));
    } else {
      const pubRow = await c.env.DB.prepare(
        'SELECT data FROM content WHERE key = ?'
      )
        .bind('published')
        .first<{ data: string }>();
      if (pubRow && pubRow.data) {
        draft = normalizeContent(JSON.parse(pubRow.data));
      }
    }

    return c.json({
      success: true,
      data: draft,
      isDraftVersion: true,
    });
  } catch (err) {
    console.error('Error reading draft content:', err);
    return c.json({ success: true, data: defaultContent, isDraftVersion: true });
  }
});

/**
 * 6. PUT /api/content/draft
 * Endpoint cho chủ sở hữu: Lưu bản nháp (KHÔNG ảnh hưởng khách xem)
 */
app.put('/api/content/draft', async (c) => {
  const session = await getAuthenticatedSession(c.env.DB, c.req.header('authorization'));
  if (!session.valid) {
    return c.json({ success: false, message: 'Yêu cầu quyền chủ sở hữu.' }, 401);
  }

  const body = await c.req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return c.json({ success: false, message: 'Dữ liệu không hợp lệ.' }, 400);
  }

  const normalized = normalizeContent(body);
  const now = new Date().toISOString();

  await c.env.DB.prepare(
    'INSERT OR REPLACE INTO content (key, data, updated_at, published_at) VALUES (?, ?, ?, NULL)'
  )
    .bind('draft', JSON.stringify(normalized), now)
    .run();

  return c.json({
    success: true,
    message: 'Đã lưu bản nháp thành công! Khách xem web vẫn sẽ thấy bản đã xuất bản gần nhất.',
  });
});

/**
 * 7. POST /api/content/publish
 * Endpoint cho chủ sở hữu: Xuất bản bản nháp thành bản công khai
 */
app.post('/api/content/publish', async (c) => {
  const session = await getAuthenticatedSession(c.env.DB, c.req.header('authorization'));
  if (!session.valid) {
    return c.json({ success: false, message: 'Yêu cầu quyền chủ sở hữu.' }, 401);
  }

  const draftRow = await c.env.DB.prepare(
    'SELECT data FROM content WHERE key = ?'
  )
    .bind('draft')
    .first<{ data: string }>();

  let draft: UniverseContent = defaultContent;
  if (draftRow && draftRow.data) {
    draft = normalizeContent(JSON.parse(draftRow.data));
  }

  const now = new Date().toISOString();
  draft.lastPublishedAt = now;

  const statements = [
    c.env.DB.prepare(
      'INSERT OR REPLACE INTO content (key, data, updated_at, published_at) VALUES (?, ?, ?, ?)'
    ).bind('published', JSON.stringify(draft), now, now),
    c.env.DB.prepare(
      'INSERT OR REPLACE INTO content (key, data, updated_at, published_at) VALUES (?, ?, ?, NULL)'
    ).bind('draft', JSON.stringify(draft), now),
  ];

  await c.env.DB.batch(statements);

  return c.json({
    success: true,
    data: draft,
    message: 'Xuất bản thành công! Nội dung mới đã được cập nhật trực tiếp cho tất cả mọi người.',
  });
});

/* ==========================================================================
   CLOUDINARY MEDIA ENDPOINTS (Cloudinary Free Storage)
   ========================================================================== */

/**
 * 8. POST /api/upload/sign
 * Cấp chữ ký upload Cloudinary trực tiếp từ trình duyệt
 */
app.post('/api/upload/sign', async (c) => {
  const session = await getAuthenticatedSession(c.env.DB, c.req.header('authorization'));
  if (!session.valid) {
    return c.json({ success: false, message: 'Yêu cầu quyền chủ sở hữu.' }, 401);
  }

  const cloudName = c.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = c.env.CLOUDINARY_API_KEY;
  const apiSecret = c.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return c.json(
      {
        success: false,
        message: 'Cloudinary credentials chưa được cấu hình trên Worker. Vui lòng cấu hình CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.',
      },
      500
    );
  }

  const body = await c.req.json().catch(() => ({}));
  const rawType = body?.resourceType || 'image';
  const resourceType = rawType === 'video' || rawType === 'audio' ? 'video' : 'image';
  const folder = resourceType === 'video' ? 'personal-universe/audio' : 'personal-universe/images';

  const timestamp = Math.floor(Date.now() / 1000);
  const prefix = resourceType === 'video' ? 'audio' : 'img';
  const publicId = `${prefix}-${Date.now()}-${generateRandomHex(6)}`;

  const paramsToSign: Record<string, string | number> = {
    folder,
    public_id: publicId,
    timestamp,
  };

  const signature = await generateCloudinarySignature(paramsToSign, apiSecret);

  return c.json({
    success: true,
    cloudName,
    apiKey,
    timestamp,
    signature,
    folder,
    publicId,
    resourceType,
  });
});

/**
 * 9. POST /api/upload/complete
 * Xác nhận sau khi trình duyệt upload thành công lên Cloudinary để ghi metadata vào D1
 */
app.post('/api/upload/complete', async (c) => {
  const session = await getAuthenticatedSession(c.env.DB, c.req.header('authorization'));
  if (!session.valid) {
    return c.json({ success: false, message: 'Yêu cầu quyền chủ sở hữu.' }, 401);
  }

  const body = await c.req.json().catch(() => null);
  if (!body || !body.publicId || !body.secureUrl) {
    return c.json({ success: false, message: 'Thiếu thông tin asset Cloudinary.' }, 400);
  }

  const now = new Date().toISOString();
  const safeFilename = body.publicId.split('/').pop() || body.publicId;

  await c.env.DB.prepare(
    `INSERT OR REPLACE INTO media_records 
     (id, filename, content_type, size, uploaded_at, cloudinary_public_id, cloudinary_url, resource_type) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      safeFilename,
      safeFilename,
      body.contentType || (body.resourceType === 'video' ? 'audio/mpeg' : 'image/jpeg'),
      body.size || 0,
      now,
      body.publicId,
      body.secureUrl,
      body.resourceType || 'image'
    )
    .run();

  return c.json({
    success: true,
    url: body.secureUrl,
    filename: body.publicId,
    message: 'Ghi nhận tệp thành công!',
  });
});

/**
 * 10. POST /api/upload
 * Worker-mediated fallback cho tải ảnh lên Cloudinary
 */
app.post('/api/upload', async (c) => {
  const session = await getAuthenticatedSession(c.env.DB, c.req.header('authorization'));
  if (!session.valid) {
    return c.json({ success: false, message: 'Yêu cầu quyền chủ sở hữu.' }, 401);
  }

  const cloudName = c.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = c.env.CLOUDINARY_API_KEY;
  const apiSecret = c.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return c.json(
      {
        success: false,
        message: 'Cloudinary credentials chưa được cấu hình trên Worker.',
      },
      500
    );
  }

  const formData = await c.req.formData().catch(() => null);
  const file = formData?.get('image') as File | null;

  if (!file || typeof file === 'string') {
    return c.json({ success: false, message: 'Vui lòng chọn một tệp ảnh để tải lên.' }, 400);
  }

  // Validate image
  const allowed = /\.(jpe?g|png|webp|gif|svg)$/i;
  const mimeAllowed = /image\/(jpeg|png|webp|gif|svg\+xml)/i;
  if (!allowed.test(file.name) && !mimeAllowed.test(file.type)) {
    return c.json(
      { success: false, message: 'Chỉ chấp nhận các định dạng ảnh: JPG, PNG, WEBP, GIF, SVG' },
      400
    );
  }

  // Max 10MB
  if (file.size > 10 * 1024 * 1024) {
    return c.json({ success: false, message: 'Kích thước ảnh tối đa là 10MB.' }, 400);
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'personal-universe/images';
  const publicId = `img-${Date.now()}-${generateRandomHex(6)}`;

  const signature = await generateCloudinarySignature(
    { folder, public_id: publicId, timestamp },
    apiSecret
  );

  const uploadForm = new FormData();
  uploadForm.append('file', file);
  uploadForm.append('api_key', apiKey);
  uploadForm.append('timestamp', String(timestamp));
  uploadForm.append('signature', signature);
  uploadForm.append('folder', folder);
  uploadForm.append('public_id', publicId);

  const cloudRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: uploadForm,
    }
  );

  if (!cloudRes.ok) {
    const errorText = await cloudRes.text();
    console.error('Cloudinary image upload error:', errorText);
    return c.json({ success: false, message: 'Lỗi khi tải ảnh lên Cloudinary.' }, 502);
  }

  const cloudData: any = await cloudRes.json();
  const secureUrl = cloudData.secure_url;
  const now = new Date().toISOString();
  const safeFilename = publicId;

  await c.env.DB.prepare(
    `INSERT OR REPLACE INTO media_records 
     (id, filename, content_type, size, uploaded_at, cloudinary_public_id, cloudinary_url, resource_type) 
     VALUES (?, ?, ?, ?, ?, ?, ?, 'image')`
  )
    .bind(
      safeFilename,
      safeFilename,
      file.type || 'image/jpeg',
      file.size,
      now,
      cloudData.public_id,
      secureUrl
    )
    .run();

  return c.json({
    success: true,
    url: secureUrl,
    filename: cloudData.public_id,
    size: file.size,
    message: 'Tải ảnh lên thành công!',
  });
});

/**
 * 11. POST /api/upload-audio
 * Worker-mediated fallback cho tải MP3 lên Cloudinary (resource_type: video)
 */
app.post('/api/upload-audio', async (c) => {
  const session = await getAuthenticatedSession(c.env.DB, c.req.header('authorization'));
  if (!session.valid) {
    return c.json({ success: false, message: 'Yêu cầu quyền chủ sở hữu.' }, 401);
  }

  const cloudName = c.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = c.env.CLOUDINARY_API_KEY;
  const apiSecret = c.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return c.json(
      {
        success: false,
        message: 'Cloudinary credentials chưa được cấu hình trên Worker.',
      },
      500
    );
  }

  const formData = await c.req.formData().catch(() => null);
  const file = formData?.get('audio') as File | null;

  if (!file || typeof file === 'string') {
    return c.json({ success: false, message: 'Vui lòng chọn một tệp âm thanh MP3 để tải lên.' }, 400);
  }

  // Validate audio
  const allowedExts = /\.(mp3|wav|ogg|m4a|aac)$/i;
  const allowedMimes = /audio\/(mpeg|mp3|wav|ogg|x-m4a|mp4|aac)/i;
  if (!allowedExts.test(file.name) && !allowedMimes.test(file.type)) {
    return c.json(
      { success: false, message: 'Chỉ chấp nhận các tệp âm thanh định dạng MP3, WAV, OGG hoặc M4A.' },
      400
    );
  }

  // Max 25MB
  if (file.size > 25 * 1024 * 1024) {
    return c.json({ success: false, message: 'Kích thước tệp âm thanh tối đa là 25MB.' }, 400);
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'personal-universe/audio';
  const publicId = `audio-${Date.now()}-${generateRandomHex(6)}`;

  const signature = await generateCloudinarySignature(
    { folder, public_id: publicId, timestamp },
    apiSecret
  );

  const uploadForm = new FormData();
  uploadForm.append('file', file);
  uploadForm.append('api_key', apiKey);
  uploadForm.append('timestamp', String(timestamp));
  uploadForm.append('signature', signature);
  uploadForm.append('folder', folder);
  uploadForm.append('public_id', publicId);

  // Cloudinary: Audio upload yêu cầu resource_type là 'video'
  const cloudRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
    {
      method: 'POST',
      body: uploadForm,
    }
  );

  if (!cloudRes.ok) {
    const errorText = await cloudRes.text();
    console.error('Cloudinary audio upload error:', errorText);
    return c.json({ success: false, message: 'Lỗi khi tải tệp âm thanh lên Cloudinary.' }, 502);
  }

  const cloudData: any = await cloudRes.json();
  const secureUrl = cloudData.secure_url;
  const now = new Date().toISOString();
  const safeFilename = publicId;

  await c.env.DB.prepare(
    `INSERT OR REPLACE INTO media_records 
     (id, filename, content_type, size, uploaded_at, cloudinary_public_id, cloudinary_url, resource_type) 
     VALUES (?, ?, ?, ?, ?, ?, ?, 'video')`
  )
    .bind(
      safeFilename,
      safeFilename,
      file.type || 'audio/mpeg',
      file.size,
      now,
      cloudData.public_id,
      secureUrl
    )
    .run();

  return c.json({
    success: true,
    url: secureUrl,
    filename: cloudData.public_id,
    originalName: file.name,
    size: file.size,
    message: 'Tải tệp âm thanh lên thành công!',
  });
});

/**
 * 12. DELETE /api/audio
 * Xóa file nhạc an toàn (KHÔNG xóa asset nếu đang được Published sử dụng)
 */
app.delete('/api/audio', async (c) => {
  const session = await getAuthenticatedSession(c.env.DB, c.req.header('authorization'));
  if (!session.valid) {
    return c.json({ success: false, message: 'Yêu cầu quyền chủ sở hữu.' }, 401);
  }

  const body = await c.req.json().catch(() => ({}));
  const target = body?.filename || body?.publicId || body?.url;

  if (!target || typeof target !== 'string') {
    return c.json({ success: false, message: 'Thiếu thông tin file âm thanh cần xóa.' }, 400);
  }

  // 1. Kiểm tra xem file này có đang được dùng trong bản Published không
  const pubRow = await c.env.DB.prepare(
    'SELECT data FROM content WHERE key = ?'
  )
    .bind('published')
    .first<{ data: string }>();

  let isReferencedInPublished = false;
  if (pubRow && pubRow.data) {
    if (pubRow.data.includes(target)) {
      isReferencedInPublished = true;
    }
  }

  if (isReferencedInPublished) {
    // Không xóa khỏi Cloudinary để tránh làm hỏng bản đã xuất bản của khách xem!
    return c.json({
      success: true,
      message: 'Tệp nhạc đã được gỡ khỏi bản nháp. Tệp lưu trữ được bảo lưu an toàn trên Cloudinary vì vẫn đang được dùng trong bản đã xuất bản.',
    });
  }

  // 2. Nếu không còn dùng trong Published, xóa khỏi Cloudinary và D1
  const cloudName = c.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = c.env.CLOUDINARY_API_KEY;
  const apiSecret = c.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    try {
      // Tìm public_id từ media_records
      const rec = await c.env.DB.prepare(
        'SELECT cloudinary_public_id FROM media_records WHERE filename = ? OR id = ? OR cloudinary_url = ?'
      )
        .bind(target, target, target)
        .first<{ cloudinary_public_id: string }>();

      const publicId = rec?.cloudinary_public_id || target;
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = await generateCloudinarySignature(
        { public_id: publicId, timestamp },
        apiSecret
      );

      const destroyForm = new FormData();
      destroyForm.append('public_id', publicId);
      destroyForm.append('api_key', apiKey);
      destroyForm.append('timestamp', String(timestamp));
      destroyForm.append('signature', signature);

      await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/destroy`, {
        method: 'POST',
        body: destroyForm,
      });

      await c.env.DB.prepare(
        'DELETE FROM media_records WHERE filename = ? OR id = ? OR cloudinary_public_id = ?'
      )
        .bind(target, target, publicId)
        .run();
    } catch (err) {
      console.error('Error destroying Cloudinary asset:', err);
    }
  }

  return c.json({ success: true, message: 'Đã xóa file nhạc thành công.' });
});

/* ==========================================================================
   SPA STATIC ASSETS FALLBACK
   ========================================================================== */
app.all('*', async (c) => {
  if (c.env.ASSETS) {
    return c.env.ASSETS.fetch(c.req.raw);
  }
  return c.text('Not Found', 404);
});

export default app;
