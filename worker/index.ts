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
  MEDIA_BUCKET: R2Bucket;
  ASSETS?: Fetcher;
  OWNER_ACCESS_CODE?: string;
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

// Cryptographic helpers
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
    // Clean up expired session
    await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHashed).run();
    return { valid: false };
  }

  return { valid: true, expiresAt: row.expires_at };
}

/* ==========================================================================
   PUBLIC MEDIA STREAMING (R2 Storage with Range request support for audio)
   ========================================================================== */
app.get('/uploads/:filename', async (c) => {
  const filename = c.req.param('filename');
  if (!filename || filename.includes('..') || filename.includes('/')) {
    return c.text('Tệp không hợp lệ', 400);
  }

  const rangeHeader = c.req.header('range');
  let object: R2Object | R2ObjectBody | null = null;

  if (rangeHeader) {
    // Parse Range header for streaming audio
    const match = rangeHeader.match(/bytes=(\d+)-(\d+)?/);
    if (match) {
      const offset = parseInt(match[1], 10);
      const end = match[2] ? parseInt(match[2], 10) : undefined;
      const length = end !== undefined ? end - offset + 1 : undefined;

      object = await c.env.MEDIA_BUCKET.get(filename, {
        range: { offset, length },
      });
    }
  }

  if (!object) {
    object = await c.env.MEDIA_BUCKET.get(filename);
  }

  if (!object) {
    return c.text('Không tìm thấy tệp phương tiện.', 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  const ext = filename.split('.').pop()?.toLowerCase();
  if (!headers.get('content-type')) {
    if (ext === 'mp3') headers.set('content-type', 'audio/mpeg');
    else if (ext === 'wav') headers.set('content-type', 'audio/wav');
    else if (ext === 'ogg') headers.set('content-type', 'audio/ogg');
    else if (ext === 'm4a') headers.set('content-type', 'audio/mp4');
    else if (ext === 'png') headers.set('content-type', 'image/png');
    else if (ext === 'webp') headers.set('content-type', 'image/webp');
    else if (ext === 'jpg' || ext === 'jpeg') headers.set('content-type', 'image/jpeg');
    else headers.set('content-type', 'application/octet-stream');
  }

  if (rangeHeader && 'range' in object && object.range) {
    headers.set(
      'content-range',
      `bytes ${object.range.offset}-${object.range.offset + (object.range.length ?? object.size) - 1}/${object.size}`
    );
    headers.set('accept-ranges', 'bytes');
    return new Response('body' in object ? object.body : null, {
      status: 206,
      headers,
    });
  }

  headers.set('accept-ranges', 'bytes');
  return new Response('body' in object ? object.body : null, {
    status: 200,
    headers,
  });
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
  const expiresAt = now + 24 * 60 * 60 * 1000; // 24 hours

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
      // Fallback to published if draft empty
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

  // Get current draft
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

  // Atomically update published and draft in D1
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
   FILE MANAGEMENT ENDPOINTS (Cloudflare R2 Storage)
   ========================================================================== */

/**
 * 8. POST /api/upload
 * Tải ảnh lên Cloudflare R2 (Avatar, Polaroid, Bìa sở thích)
 */
app.post('/api/upload', async (c) => {
  const session = await getAuthenticatedSession(c.env.DB, c.req.header('authorization'));
  if (!session.valid) {
    return c.json({ success: false, message: 'Yêu cầu quyền chủ sở hữu.' }, 401);
  }

  const formData = await c.req.formData().catch(() => null);
  const file = formData?.get('image') as File | null;

  if (!file || typeof file === 'string') {
    return c.json({ success: false, message: 'Vui lòng chọn một tệp ảnh để tải lên.' }, 400);
  }

  // Validate image type
  const allowed = /\.(jpe?g|png|webp|gif|svg)$/i;
  const mimeAllowed = /image\/(jpeg|png|webp|gif|svg\+xml)/i;
  if (!allowed.test(file.name) && !mimeAllowed.test(file.type)) {
    return c.json(
      { success: false, message: 'Chỉ chấp nhận các định dạng ảnh: JPG, PNG, WEBP, GIF, SVG' },
      400
    );
  }

  // Validate max size 10MB
  if (file.size > 10 * 1024 * 1024) {
    return c.json({ success: false, message: 'Kích thước ảnh tối đa là 10MB.' }, 400);
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const safeName = `img-${Date.now()}-${generateRandomHex(8)}.${ext}`;

  await c.env.MEDIA_BUCKET.put(safeName, file.stream(), {
    httpMetadata: { contentType: file.type || 'image/jpeg' },
  });

  const now = new Date().toISOString();
  await c.env.DB.prepare(
    'INSERT OR REPLACE INTO media_records (id, filename, content_type, size, uploaded_at) VALUES (?, ?, ?, ?, ?)'
  )
    .bind(safeName, safeName, file.type || 'image/jpeg', file.size, now)
    .run();

  const fileUrl = `/uploads/${safeName}`;
  return c.json({
    success: true,
    url: fileUrl,
    filename: safeName,
    size: file.size,
    message: 'Tải ảnh lên thành công!',
  });
});

/**
 * 9. POST /api/upload-audio
 * Tải file nhạc MP3 lên Cloudflare R2
 */
app.post('/api/upload-audio', async (c) => {
  const session = await getAuthenticatedSession(c.env.DB, c.req.header('authorization'));
  if (!session.valid) {
    return c.json({ success: false, message: 'Yêu cầu quyền chủ sở hữu.' }, 401);
  }

  const formData = await c.req.formData().catch(() => null);
  const file = formData?.get('audio') as File | null;

  if (!file || typeof file === 'string') {
    return c.json({ success: false, message: 'Vui lòng chọn một tệp âm thanh MP3 để tải lên.' }, 400);
  }

  // Validate audio format
  const allowedExts = /\.(mp3|wav|ogg|m4a|aac)$/i;
  const allowedMimes = /audio\/(mpeg|mp3|wav|ogg|x-m4a|mp4|aac)/i;
  if (!allowedExts.test(file.name) && !allowedMimes.test(file.type)) {
    return c.json(
      { success: false, message: 'Chỉ chấp nhận các tệp âm thanh định dạng MP3, WAV, OGG hoặc M4A.' },
      400
    );
  }

  // Validate max size 25MB
  if (file.size > 25 * 1024 * 1024) {
    return c.json({ success: false, message: 'Kích thước tệp âm thanh tối đa là 25MB.' }, 400);
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'mp3';
  const safeName = `audio-${Date.now()}-${generateRandomHex(8)}.${ext}`;

  await c.env.MEDIA_BUCKET.put(safeName, file.stream(), {
    httpMetadata: { contentType: file.type || 'audio/mpeg' },
  });

  const now = new Date().toISOString();
  await c.env.DB.prepare(
    'INSERT OR REPLACE INTO media_records (id, filename, content_type, size, uploaded_at) VALUES (?, ?, ?, ?, ?)'
  )
    .bind(safeName, safeName, file.type || 'audio/mpeg', file.size, now)
    .run();

  const fileUrl = `/uploads/${safeName}`;
  return c.json({
    success: true,
    url: fileUrl,
    filename: safeName,
    originalName: file.name,
    size: file.size,
    message: 'Tải tệp âm thanh lên thành công!',
  });
});

/**
 * 10. DELETE /api/audio
 * Xóa file nhạc khỏi Cloudflare R2
 */
app.delete('/api/audio', async (c) => {
  const session = await getAuthenticatedSession(c.env.DB, c.req.header('authorization'));
  if (!session.valid) {
    return c.json({ success: false, message: 'Yêu cầu quyền chủ sở hữu.' }, 401);
  }

  const body = await c.req.json().catch(() => ({}));
  const filename = body?.filename;

  if (filename && typeof filename === 'string') {
    const safeName = filename.split('/').pop()?.trim();
    if (safeName && !safeName.includes('..')) {
      await c.env.MEDIA_BUCKET.delete(safeName);
      await c.env.DB.prepare('DELETE FROM media_records WHERE filename = ?').bind(safeName).run();
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
