/**
 * Script di chuyển toàn bộ tệp phương tiện cục bộ (uploads/) sang Cloudinary Free
 * và cập nhật URL trong dữ liệu Draft / Published của Cloudflare D1.
 *
 * Cách chạy:
 *   node scripts/migrate-media-to-cloudinary.cjs
 * hoặc truyền trực tiếp tham số:
 *   node scripts/migrate-media-to-cloudinary.cjs --cloud-name=xxx --api-key=yyy --api-secret=zzz [--remote]
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

// Đọc tham số CLI
const args = process.argv.slice(2);
function getArg(name) {
  const match = args.find((a) => a.startsWith(`--${name}=`));
  if (match) return match.split('=')[1].trim();
  const idx = args.indexOf(`--${name}`);
  if (idx !== -1 && args[idx + 1]) return args[idx + 1].trim();
  return null;
}
const isRemote = args.includes('--remote');

// Tìm credentials từ CLI, .dev.vars, .env hoặc process.env
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const res = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
      res[key] = val;
    }
  }
  return res;
}

const envDevVars = loadEnvFile(path.join(__dirname, '..', '.dev.vars'));
const envDotEnv = loadEnvFile(path.join(__dirname, '..', '.env'));

const cloudName =
  getArg('cloud-name') ||
  process.env.CLOUDINARY_CLOUD_NAME ||
  envDevVars.CLOUDINARY_CLOUD_NAME ||
  envDotEnv.CLOUDINARY_CLOUD_NAME;

const apiKey =
  getArg('api-key') ||
  process.env.CLOUDINARY_API_KEY ||
  envDevVars.CLOUDINARY_API_KEY ||
  envDotEnv.CLOUDINARY_API_KEY;

const apiSecret =
  getArg('api-secret') ||
  process.env.CLOUDINARY_API_SECRET ||
  envDevVars.CLOUDINARY_API_SECRET ||
  envDotEnv.CLOUDINARY_API_SECRET;

console.log('='.repeat(70));
console.log('  PERSONAL UNIVERSE — CLOUDINARY MEDIA MIGRATION');
console.log('='.repeat(70));

if (!cloudName || !apiKey || !apiSecret) {
  console.log('\n⚠️  THIẾU THÔNG TIN CLOUDINARY CREDENTIALS!');
  console.log('Vui lòng cung cấp 3 biến môi trường sau trong file .dev.vars (hoặc .env):');
  console.log('  CLOUDINARY_CLOUD_NAME=<Tên Cloud Name của bạn>');
  console.log('  CLOUDINARY_API_KEY=<API Key của bạn>');
  console.log('  CLOUDINARY_API_SECRET=<API Secret của bạn>');
  console.log('\nHoặc chạy lệnh kèm tham số:');
  console.log('  node scripts/migrate-media-to-cloudinary.cjs --cloud-name=xxx --api-key=yyy --api-secret=zzz [--remote]\n');
  process.exit(1);
}

console.log(`✓ Cloud Name : ${cloudName}`);
console.log(`✓ API Key    : ${apiKey.slice(0, 4)}****`);
console.log(`✓ Chế độ D1  : ${isRemote ? 'Remote (Cloudflare D1 Production)' : 'Local (.wrangler/state)'}\n`);

// Paths
const uploadsDir = path.join(__dirname, '..', 'uploads');
const draftPath = path.join(__dirname, '..', 'server', 'data', 'draft.json');
const publishedPath = path.join(__dirname, '..', 'server', 'data', 'published.json');

if (!fs.existsSync(draftPath) || !fs.existsSync(publishedPath)) {
  console.error('❌ Lỗi: Không tìm thấy file draft.json hoặc published.json!');
  process.exit(1);
}

const draft = JSON.parse(fs.readFileSync(draftPath, 'utf8'));
const published = JSON.parse(fs.readFileSync(publishedPath, 'utf8'));

// Tìm tất cả các đường dẫn /uploads/ trong JSON
function findUploadPaths(obj) {
  const set = new Set();
  function traverse(item) {
    if (typeof item === 'string') {
      if (item.startsWith('/uploads/') || item.startsWith('uploads/')) {
        set.add(item);
      }
    } else if (Array.isArray(item)) {
      item.forEach(traverse);
    } else if (item && typeof item === 'object') {
      Object.values(item).forEach(traverse);
    }
  }
  traverse(obj);
  return set;
}

const allUploadPaths = new Set([...findUploadPaths(draft), ...findUploadPaths(published)]);
console.log(`🔍 Tìm thấy ${allUploadPaths.size} tệp phương tiện đang được sử dụng:\n`);

function generateSignature(params, secret) {
  const sorted = Object.keys(params).sort();
  const toSign = sorted.map((k) => `${k}=${params[k]}`).join('&') + secret;
  return crypto.createHash('sha1').update(toSign).digest('hex');
}

async function uploadToCloudinary(filePath, filename) {
  const ext = path.extname(filename).toLowerCase();
  const isAudio = ['.mp3', '.wav', '.ogg', '.m4a', '.aac'].includes(ext);
  const resourceType = isAudio ? 'video' : 'image';
  const folder = isAudio ? 'personal-universe/audio' : 'personal-universe/images';

  const baseNameWithoutExt = path.basename(filename, ext);
  const publicId = `${baseNameWithoutExt}`;
  const timestamp = Math.floor(Date.now() / 1000);

  const params = {
    folder,
    public_id: publicId,
    timestamp,
  };
  const signature = generateSignature(params, apiSecret);

  const fileBuffer = fs.readFileSync(filePath);
  const boundary = '----WebKitFormBoundary' + crypto.randomBytes(16).toString('hex');

  let body = '';
  function addField(name, value) {
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="${name}"\r\n\r\n`;
    body += `${value}\r\n`;
  }

  addField('api_key', apiKey);
  addField('timestamp', timestamp);
  addField('signature', signature);
  addField('folder', folder);
  addField('public_id', publicId);

  const headBuffer = Buffer.from(body, 'utf8');

  let fileHeader = `--${boundary}\r\n`;
  fileHeader += `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n`;
  fileHeader += `Content-Type: ${isAudio ? 'audio/mpeg' : 'image/jpeg'}\r\n\r\n`;
  const fileHeaderBuffer = Buffer.from(fileHeader, 'utf8');

  const tailBuffer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
  const fullBody = Buffer.concat([headBuffer, fileHeaderBuffer, fileBuffer, tailBuffer]);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': String(fullBody.length),
    },
    body: fullBody,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Cloudinary upload HTTP ${res.status}: ${errText}`);
  }

  const json = await res.json();
  return {
    secureUrl: json.secure_url,
    publicId: json.public_id,
    bytes: json.bytes,
    resourceType,
  };
}

async function run() {
  const urlMap = {};
  let totalBytes = 0;
  let count = 0;

  for (const uploadPath of allUploadPaths) {
    count++;
    const filename = uploadPath.replace(/^\/?uploads\//, '');
    const localFilePath = path.join(uploadsDir, filename);

    if (!fs.existsSync(localFilePath)) {
      console.warn(`  ⚠️ [${count}/${allUploadPaths.size}] Bỏ qua vì không thấy file cục bộ: ${filename}`);
      continue;
    }

    const fileSize = fs.statSync(localFilePath).size;
    process.stdout.write(`  [${count}/${allUploadPaths.size}] Đang tải lên Cloudinary: ${filename} (${(fileSize / 1024).toFixed(1)} KB)... `);

    try {
      const result = await uploadToCloudinary(localFilePath, filename);
      urlMap[uploadPath] = result.secureUrl;
      // Cũng map biến thể không có slash đầu nếu có
      if (uploadPath.startsWith('/')) {
        urlMap[uploadPath.substring(1)] = result.secureUrl;
      } else {
        urlMap['/' + uploadPath] = result.secureUrl;
      }
      totalBytes += result.bytes || fileSize;
      console.log(`✓ Xong!\n    -> URL: ${result.secureUrl}`);
    } catch (err) {
      console.log(`❌ Thất bại: ${err.message}`);
    }
  }

  console.log(`\n🎉 Đã hoàn tất tải lên ${Object.keys(urlMap).length / 2} tệp! Tổng dung lượng: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);

  // Thay thế URL trong file draft và published
  function replaceUrls(obj) {
    if (typeof obj === 'string') {
      if (urlMap[obj]) return urlMap[obj];
      for (const [oldUrl, newUrl] of Object.entries(urlMap)) {
        if (obj === oldUrl) return newUrl;
      }
      return obj;
    } else if (Array.isArray(obj)) {
      return obj.map(replaceUrls);
    } else if (obj && typeof obj === 'object') {
      const newObj = {};
      for (const [k, v] of Object.entries(obj)) {
        newObj[k] = replaceUrls(v);
      }
      return newObj;
    }
    return obj;
  }

  const updatedDraft = replaceUrls(draft);
  const updatedPublished = replaceUrls(published);

  fs.writeFileSync(draftPath, JSON.stringify(updatedDraft, null, 2), 'utf8');
  fs.writeFileSync(publishedPath, JSON.stringify(updatedPublished, null, 2), 'utf8');
  console.log('✓ Đã cập nhật URL Cloudinary vào server/data/draft.json và published.json');

  // Cập nhật migration seed file
  const escapeSql = (str) => str.replace(/'/g, "''");
  const draftJson = escapeSql(JSON.stringify(updatedDraft));
  const publishedJson = escapeSql(JSON.stringify(updatedPublished));
  const now = new Date().toISOString();

  const seedSql = `-- Seed initial content with Cloudinary URLs
INSERT OR REPLACE INTO content (key, data, updated_at, published_at) VALUES
  ('draft', '${draftJson}', '${now}', NULL),
  ('published', '${publishedJson}', '${now}', '${updatedPublished.lastPublishedAt || now}');
`;
  fs.writeFileSync(path.join(__dirname, '..', 'migrations', '0002_seed_initial_content.sql'), seedSql, 'utf8');
  console.log('✓ Đã tái tạo file seed migrations/0002_seed_initial_content.sql với URL Cloudinary');

  // Ghi các bản ghi vào media_records trên D1
  const mediaRecordsSqlLines = [];
  for (const [oldPath, cloudUrl] of Object.entries(urlMap)) {
    if (!oldPath.startsWith('/')) continue;
    const filename = oldPath.replace(/^\/uploads\//, '');
    const isAudio = filename.endsWith('.mp3');
    const safeId = escapeSql(filename);
    const safeUrl = escapeSql(cloudUrl);
    const pubId = escapeSql(cloudUrl.split('/').slice(-2).join('/').replace(/\.[^.]+$/, ''));
    mediaRecordsSqlLines.push(
      `INSERT OR REPLACE INTO media_records (id, filename, content_type, size, uploaded_at, cloudinary_public_id, cloudinary_url, resource_type) VALUES ('${safeId}', '${safeId}', '${isAudio ? 'audio/mpeg' : 'image/jpeg'}', 0, '${now}', '${pubId}', '${safeUrl}', '${isAudio ? 'video' : 'image'}');`
    );
  }

  const updateSql = `${seedSql}\n${mediaRecordsSqlLines.join('\n')}\n`;
  const tmpSqlPath = path.join(__dirname, '..', 'temp_cloudinary_sync.sql');
  fs.writeFileSync(tmpSqlPath, updateSql, 'utf8');

  try {
    const flag = isRemote ? '--remote' : '--local';
    console.log(`\n⏳ Đang đồng bộ dữ liệu vào Cloudflare D1 (${flag})...`);
    execSync(`npx wrangler d1 execute personal_universe_db ${flag} --file=temp_cloudinary_sync.sql`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
    console.log('✓ Đã đồng bộ dữ liệu Cloudinary thành công vào Cloudflare D1!');
  } catch (err) {
    console.error('⚠️ Không thể chạy lệnh tự động wrangler d1 execute:', err.message);
  } finally {
    if (fs.existsSync(tmpSqlPath)) fs.unlinkSync(tmpSqlPath);
  }

  console.log('\n' + '='.repeat(70));
  console.log('  HOÀN THÀNH MIGRATION PHƯƠNG TIỆN SANG CLOUDINARY THÀNH CÔNG!');
  console.log('='.repeat(70));
}

run().catch((err) => {
  console.error('\n❌ Có lỗi xảy ra trong quá trình di chuyển:', err);
  process.exit(1);
});
