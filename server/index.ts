import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

import { personalData } from '../src/data/personal.js';
import { interestsData } from '../src/data/interests.js';
import { favoritesData } from '../src/data/favorites.js';
import { personalityData } from '../src/data/personality.js';
import { memoriesData } from '../src/data/memories.js';
import { socialLinksData } from '../src/data/social.js';
import type { UniverseContent } from '../src/types/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Đọc mã Owner Access Code động trực tiếp từ file .env mỗi lần kiểm tra
// Nhờ đó, người dùng có thể đổi mã trong file .env và mã mới có hiệu lực ngay lập tức
// mà không cần phải khởi động lại server.
function getOwnerAccessCode(): string {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      const parsed = dotenv.parse(fs.readFileSync(envPath));
      if (parsed.OWNER_ACCESS_CODE) {
        return parsed.OWNER_ACCESS_CODE.trim().replace(/^['"]|['"]$/g, '');
      }
    }
  } catch (err) {
    console.error('Lỗi khi đọc file .env:', err);
  }
  return (process.env.OWNER_ACCESS_CODE || 'universe2026').trim().replace(/^['"]|['"]$/g, '');
}

// Paths
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const PUBLISHED_FILE = path.join(DATA_DIR, 'published.json');
const DRAFT_FILE = path.join(DATA_DIR, 'draft.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Initial content seed
const initialContent: UniverseContent = {
  personal: personalData,
  interests: interestsData,
  favorites: favoritesData,
  personality: personalityData,
  memories: memoriesData,
  socialLinks: socialLinksData,
  publicSlug: 'bao-trung',
  lastPublishedAt: new Date().toISOString(),
};

// Seed initial files if not present
if (!fs.existsSync(PUBLISHED_FILE)) {
  fs.writeFileSync(PUBLISHED_FILE, JSON.stringify(initialContent, null, 2), 'utf-8');
}
if (!fs.existsSync(DRAFT_FILE)) {
  fs.writeFileSync(DRAFT_FILE, JSON.stringify(initialContent, null, 2), 'utf-8');
}

// Helpers to read/write content
function normalizeContent(raw: any): UniverseContent {
  if (!raw || typeof raw !== 'object') {
    return initialContent;
  }
  if (raw.content && typeof raw.content === 'object' && raw.content.personal) {
    return {
      ...raw.content,
      lastPublishedAt: raw.lastPublishedAt || raw.content.lastPublishedAt || new Date().toISOString(),
    };
  }
  return raw as UniverseContent;
}

function getPublishedContent(): UniverseContent {
  try {
    const raw = fs.readFileSync(PUBLISHED_FILE, 'utf-8');
    return normalizeContent(JSON.parse(raw));
  } catch {
    return initialContent;
  }
}

function getDraftContent(): UniverseContent {
  try {
    const raw = fs.readFileSync(DRAFT_FILE, 'utf-8');
    return normalizeContent(JSON.parse(raw));
  } catch {
    return getPublishedContent();
  }
}

function saveDraftContent(data: UniverseContent): void {
  const normalized = normalizeContent(data);
  fs.writeFileSync(DRAFT_FILE, JSON.stringify(normalized, null, 2), 'utf-8');
}

function publishContent(): UniverseContent {
  const draft = getDraftContent();
  draft.lastPublishedAt = new Date().toISOString();
  saveDraftContent(draft);
  fs.writeFileSync(PUBLISHED_FILE, JSON.stringify(draft, null, 2), 'utf-8');
  return draft;
}

// Session store for Owner Mode (token -> expiresAt)
interface SessionInfo {
  token: string;
  createdAt: number;
  expiresAt: number;
}
const activeSessions = new Map<string, SessionInfo>();

// Multer storage for image uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const hash = crypto.randomBytes(8).toString('hex');
    const safeName = `img-${Date.now()}-${hash}${ext}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif|svg/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype.toLowerCase();
    if (allowed.test(ext) || allowed.test(mime)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận các định dạng ảnh: JPG, PNG, WEBP, GIF, SVG'));
    }
  },
});

// Multer storage for audio uploads (MP3, WAV, OGG, M4A)
const audioStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.mp3';
    const hash = crypto.randomBytes(8).toString('hex');
    const safeName = `audio-${Date.now()}-${hash}${ext}`;
    cb(null, safeName);
  },
});

const uploadAudio = multer({
  storage: audioStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit for MP3/audio
  fileFilter: (_req, file, cb) => {
    const allowedExts = /\.(mp3|wav|ogg|m4a|aac)$/i;
    const allowedMimes = /audio\/(mpeg|mp3|wav|ogg|x-m4a|mp4|aac)/i;
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype.toLowerCase();
    if (allowedExts.test(ext) || allowedMimes.test(mime)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận các tệp âm thanh định dạng MP3, WAV, OGG hoặc M4A.'));
    }
  },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve uploaded images statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Authentication Middleware for Owner-only routes
function requireOwnerAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Không có quyền truy cập. Yêu cầu mã truy cập của chủ sở hữu.',
    });
    return;
  }

  const token = authHeader.substring(7).trim();
  const session = activeSessions.get(token);

  if (!session || Date.now() > session.expiresAt) {
    if (session) activeSessions.delete(token);
    res.status(401).json({
      success: false,
      message: 'Phiên làm việc đã hết hạn hoặc không hợp lệ. Vui lòng nhập lại mã truy cập.',
    });
    return;
  }

  next();
}

/* ==========================================================================
   API ENDPOINTS
   ========================================================================== */

/**
 * 1. POST /api/auth/verify
 * Xác thực Owner Access Code, cấp token phiên an toàn (24h)
 */
app.post('/api/auth/verify', (req: Request, res: Response) => {
  const rawCode = req.body?.code ?? req.body?.accessCode;
  if (!rawCode || typeof rawCode !== 'string') {
    res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã truy cập.' });
    return;
  }

  const currentSecret = getOwnerAccessCode();
  const expected = Buffer.from(currentSecret.trim());
  const provided = Buffer.from(rawCode.trim());

  let isMatch = false;
  if (expected.length === provided.length) {
    isMatch = crypto.timingSafeEqual(expected, provided);
  }

  if (!isMatch) {
    res.status(401).json({
      success: false,
      message: 'Mã truy cập không chính xác. Vui lòng kiểm tra lại.',
    });
    return;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const expiresAt = now + 24 * 60 * 60 * 1000; // 24 hours

  activeSessions.set(token, {
    token,
    createdAt: now,
    expiresAt,
  });

  res.json({
    success: true,
    token,
    expiresAt,
    message: 'Xác thực thành công. Đã bật chế độ chỉnh sửa (Owner Mode).',
  });
});

/**
 * 2. POST /api/auth/check
 * Kiểm tra xem phiên chỉnh sửa hiện tại có hợp lệ không
 */
app.post('/api/auth/check', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.json({ valid: false });
    return;
  }
  const token = authHeader.substring(7).trim();
  const session = activeSessions.get(token);
  if (!session || Date.now() > session.expiresAt) {
    if (session) activeSessions.delete(token);
    res.json({ valid: false });
    return;
  }
  res.json({ valid: true, expiresAt: session.expiresAt });
});

/**
 * 3. POST /api/auth/logout
 * Đăng xuất khỏi chế độ chỉnh sửa
 */
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    activeSessions.delete(token);
  }
  res.json({ success: true, message: 'Đã thoát chế độ chỉnh sửa.' });
});

/**
 * 4. GET /api/content
 * Endpoint công khai cho khách truy cập (CHỈ trả về dữ liệu Published)
 */
app.get('/api/content', (_req: Request, res: Response) => {
  const published = getPublishedContent();
  res.json({
    success: true,
    data: published,
    isPublishedVersion: true,
  });
});

/**
 * 5. GET /api/content/draft
 * Endpoint cho chủ sở hữu: Lấy dữ liệu bản nháp để chỉnh sửa
 */
app.get('/api/content/draft', requireOwnerAuth, (_req: Request, res: Response) => {
  const draft = getDraftContent();
  res.json({
    success: true,
    data: draft,
    isDraftVersion: true,
  });
});

/**
 * 6. PUT /api/content/draft
 * Endpoint cho chủ sở hữu: Lưu bản nháp (KHÔNG ảnh hưởng khách truy cập)
 */
app.put('/api/content/draft', requireOwnerAuth, (req: Request, res: Response) => {
  const newContent = req.body;
  if (!newContent || typeof newContent !== 'object') {
    res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ.' });
    return;
  }

  saveDraftContent(newContent as UniverseContent);
  res.json({
    success: true,
    message: 'Đã lưu bản nháp thành công! Khách xem web vẫn sẽ thấy bản đã xuất bản gần nhất.',
  });
});

/**
 * 7. POST /api/content/publish
 * Endpoint cho chủ sở hữu: Xuất bản bản nháp thành bản công khai
 */
app.post('/api/content/publish', requireOwnerAuth, (_req: Request, res: Response) => {
  const published = publishContent();
  res.json({
    success: true,
    data: published,
    message: 'Xuất bản thành công! Nội dung mới đã được cập nhật trực tiếp cho tất cả mọi người.',
  });
});

/**
 * 8. POST /api/upload
 * Tải ảnh lên máy chủ (avatar, bìa sở thích, polaroid...)
 */
app.post('/api/upload', requireOwnerAuth, upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'Vui lòng chọn một tệp ảnh để tải lên.' });
    return;
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    url: fileUrl,
    filename: req.file.filename,
    size: req.file.size,
    message: 'Tải ảnh lên thành công!',
  });
});

/**
 * 9. POST /api/upload-audio
 * Tải file nhạc nền MP3 lên máy chủ
 */
app.post('/api/upload-audio', requireOwnerAuth, uploadAudio.single('audio'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'Vui lòng chọn một tệp âm thanh MP3 để tải lên.' });
    return;
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    url: fileUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    message: 'Tải tệp âm thanh lên thành công!',
  });
});

/**
 * 10. DELETE /api/audio
 * Xóa file âm thanh khỏi máy chủ (dọn dẹp khi gỡ bỏ bài hát)
 */
app.delete('/api/audio', requireOwnerAuth, (req: Request, res: Response) => {
  const { filename } = req.body || {};
  if (filename && typeof filename === 'string') {
    const safeFilename = path.basename(filename);
    const targetPath = path.join(UPLOADS_DIR, safeFilename);
    if (fs.existsSync(targetPath)) {
      try {
        fs.unlinkSync(targetPath);
      } catch {
        // ignore deletion error
      }
    }
  }
  res.json({ success: true, message: 'Đã xóa file nhạc thành công.' });
});

// Production: serve built frontend static files if dist folder exists
const DIST_DIR = path.join(__dirname, '..', 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((_req: Request, res: Response) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

const server = app.listen(PORT, () => {
  console.log(`✨ Server backend đang chạy tại: http://localhost:${PORT}`);
  console.log(`🔐 Owner Access Code đã được nạp an toàn từ .env`);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`⚠️ Cổng ${PORT} đã đang chạy bởi một tiến trình khác.`);
    console.log(`ℹ️ Backend sẵn sàng, tiếp tục chạy giao diện frontend...`);
    setInterval(() => {}, 1000 * 60 * 60);
  } else {
    console.error('Lỗi máy chủ backend:', err);
    process.exit(1);
  }
});
