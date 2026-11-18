/**
 * Script di chuyển an toàn toàn bộ tệp phương tiện cục bộ (uploads/) sang Cloudinary Free
 * và cập nhật chính xác các tham chiếu media trong Cloudflare D1 (Draft & Published).
 *
 * Tính năng an toàn:
 * 1. KHÔNG yêu cầu truyền API Secret qua tham số dòng lệnh (tránh lộ qua history/process list).
 *    Tự động đọc từ .dev.vars (đã gitignored) hoặc hỏi tương tác ẩn ký tự trong terminal.
 * 2. Idempotent / Resumable: Sử dụng file bộ nhớ đệm (.cloudinary-migration-map.json).
 *    Nếu bị gián đoạn, chạy lại sẽ tự động bỏ qua các tệp đã upload thành công trước đó.
 * 3. Bảo vệ dữ liệu D1: Khi chạy với --remote, lấy dữ liệu trực tiếp từ remote D1 làm gốc,
 *    chỉ thay thế các đường dẫn media thực sự được di chuyển, giữ nguyên vẹn 100% nội dung chữ.
 * 4. Tách biệt hoàn toàn Draft và Published.
 * 5. Giữ nguyên tệp backup.sql và thư mục uploads/ cục bộ.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const isRemote = args.includes('--remote');
const mapFilePath = path.join(__dirname, '..', '.cloudinary-migration-map.json');

// Đọc file env an toàn
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

// Hàm hỏi tương tác an toàn (ẩn ký tự nếu là secret)
function askQuestion(query, isSecret = false) {
  return new Promise((resolve) => {
    if (!isSecret || !process.stdin.isTTY || typeof process.stdin.setRawMode !== 'function') {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question(query, (ans) => {
        rl.close();
        resolve(ans.trim());
      });
      return;
    }

    // Masked input cho API Secret
    process.stdout.write(query);
    const stdin = process.stdin;
    stdin.resume();
    stdin.setRawMode(true);
    stdin.setEncoding('utf8');

    let password = '';
    const onData = (char) => {
      char = char.toString('utf8');
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener('data', onData);
          process.stdout.write('\n');
          resolve(password.trim());
          break;
        case '\u0003':
          stdin.setRawMode(false);
          process.exit(1);
          break;
        case '\u007f':
        case '\b':
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          password += char;
          process.stdout.write('*');
          break;
      }
    };
    stdin.on('data', onData);
  });
}

function generateSignature(params, secret) {
  const sorted = Object.keys(params).sort();
  const toSign = sorted.map((k) => `${k}=${params[k]}`).join('&') + secret;
  return crypto.createHash('sha1').update(toSign).digest('hex');
}

async function uploadToCloudinary(filePath, filename, cloudName, apiKey, apiSecret) {
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
    throw new Error(`HTTP ${res.status}: ${errText}`);
  }

  const json = await res.json();
  return {
    secureUrl: json.secure_url,
    publicId: json.public_id,
    bytes: json.bytes,
    resourceType,
  };
}

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

async function main() {
  console.log('='.repeat(70));
  console.log('  PERSONAL UNIVERSE — CLOUDINARY MEDIA MIGRATION (SAFETY MODE)');
  console.log('='.repeat(70));
  console.log(`✓ Mục tiêu thực thi: ${isRemote ? 'Cloudflare D1 REMOTE (Production)' : 'Local (.wrangler/state)'}`);

  // 1. Lấy thông tin Credentials an toàn
  const envDevVars = loadEnvFile(path.join(__dirname, '..', '.dev.vars'));
  const envDotEnv = loadEnvFile(path.join(__dirname, '..', '.env'));

  let cloudName = process.env.CLOUDINARY_CLOUD_NAME || envDevVars.CLOUDINARY_CLOUD_NAME || envDotEnv.CLOUDINARY_CLOUD_NAME;
  let apiKey = process.env.CLOUDINARY_API_KEY || envDevVars.CLOUDINARY_API_KEY || envDotEnv.CLOUDINARY_API_KEY;
  let apiSecret = process.env.CLOUDINARY_API_SECRET || envDevVars.CLOUDINARY_API_SECRET || envDotEnv.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    console.log('✓ Đã tải credentials an toàn từ tệp cấu hình bí mật cục bộ (.dev.vars hoặc .env).');
  } else {
    console.log('\n🔒 Chưa tìm thấy đủ credentials trong .dev.vars. Vui lòng nhập thông tin xác thực:');
    if (!cloudName) {
      cloudName = await askQuestion('  Nhập Cloud Name: ');
    }
    if (!apiKey) {
      apiKey = await askQuestion('  Nhập API Key: ');
    }
    if (!apiSecret) {
      apiSecret = await askQuestion('  Nhập API Secret (Ký tự sẽ được ẩn an toàn): ', true);
    }
  }

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('\n❌ Lỗi: Thiếu thông tin xác thực Cloudinary. Quá trình dừng lại.');
    process.exit(1);
  }

  console.log(`\n✓ Cloud Name : ${cloudName}`);
  console.log(`✓ API Key    : ${apiKey.slice(0, 4)}****`);
  console.log(`✓ API Secret : [ĐÃ ẨN AN TOÀN - KHÔNG IN RA LOG]`);

  // 2. Tải bản đồ bộ nhớ đệm (resumable cache) nếu có
  let urlMap = {};
  if (fs.existsSync(mapFilePath)) {
    try {
      urlMap = JSON.parse(fs.readFileSync(mapFilePath, 'utf8'));
      console.log(`✓ Đã nạp bộ nhớ đệm tiếp tục (.cloudinary-migration-map.json) với ${Object.keys(urlMap).length} tệp đã map.`);
    } catch {
      urlMap = {};
    }
  }

  // 3. Chuẩn bị dữ liệu Draft & Published
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const draftPath = path.join(__dirname, '..', 'server', 'data', 'draft.json');
  const publishedPath = path.join(__dirname, '..', 'server', 'data', 'published.json');

  let draftData = JSON.parse(fs.readFileSync(draftPath, 'utf8'));
  let pubData = JSON.parse(fs.readFileSync(publishedPath, 'utf8'));

  if (isRemote) {
    console.log('\n⏳ Đang lấy dữ liệu trực tiếp từ Cloudflare D1 Remote để đảm bảo tính đồng bộ tuyệt đối...');
    try {
      const out = execSync(
        'npx wrangler d1 execute personal_universe_db --remote --command "SELECT key, data, updated_at, published_at FROM content;" --json',
        { encoding: 'utf8' }
      );
      const jsonStart = out.indexOf('[');
      if (jsonStart !== -1) {
        const parsed = JSON.parse(out.slice(jsonStart));
        const rows = parsed[0]?.results || [];
        const remDraft = rows.find((r) => r.key === 'draft');
        const remPub = rows.find((r) => r.key === 'published');
        if (remDraft?.data) draftData = JSON.parse(remDraft.data);
        if (remPub?.data) pubData = JSON.parse(remPub.data);
        console.log('✓ Đã đồng bộ thành công cấu trúc dữ liệu mới nhất từ remote D1!');
      }
    } catch (err) {
      console.warn('⚠️ Không thể tải dữ liệu remote trực tiếp, sẽ dùng file JSON cục bộ:', err.message);
    }
  }

  const allUploadPaths = Array.from(new Set([...findUploadPaths(draftData), ...findUploadPaths(pubData)]));
  console.log(`\n🔍 Xác định được ${allUploadPaths.length} vị trí tệp media cần xử lý:\n`);

  // 4. Tiến hành upload an toàn
  const successfulUploads = [];
  const skippedUploads = [];
  const failedUploads = [];
  let totalUploadedBytes = 0;
  let count = 0;

  for (const uploadPath of allUploadPaths) {
    count++;
    const filename = uploadPath.replace(/^\/?uploads\//, '');
    const localFilePath = path.join(uploadsDir, filename);

    // Kiểm tra xem đã có URL Cloudinary trong cache chưa
    if (urlMap[uploadPath]) {
      skippedUploads.push({ uploadPath, url: urlMap[uploadPath] });
      console.log(`  [${count}/${allUploadPaths.length}] ⏩ Bỏ qua (Đã upload từ phiên trước): ${filename}`);
      continue;
    }

    if (!fs.existsSync(localFilePath)) {
      failedUploads.push({ uploadPath, error: 'Không tìm thấy tệp cục bộ trên đĩa' });
      console.warn(`  [${count}/${allUploadPaths.length}] ❌ Lỗi: Tệp không tồn tại: ${filename}`);
      continue;
    }

    const fileSize = fs.statSync(localFilePath).size;
    const isAudio = filename.endsWith('.mp3');
    process.stdout.write(
      `  [${count}/${allUploadPaths.length}] 📤 Đang upload [${isAudio ? 'MP3 (video)' : 'Ảnh'}]: ${filename} (${(fileSize / 1024).toFixed(1)} KB)... `
    );

    try {
      const res = await uploadToCloudinary(localFilePath, filename, cloudName, apiKey, apiSecret);
      urlMap[uploadPath] = res.secureUrl;
      // Map cả biến thể có/không có dấu gạch chéo
      if (uploadPath.startsWith('/')) {
        urlMap[uploadPath.substring(1)] = res.secureUrl;
      } else {
        urlMap['/' + uploadPath] = res.secureUrl;
      }

      // Lưu cache ngay lập tức để nếu gặp sự cố vẫn có thể resume
      fs.writeFileSync(mapFilePath, JSON.stringify(urlMap, null, 2), 'utf8');

      successfulUploads.push({ uploadPath, url: res.secureUrl, bytes: res.bytes || fileSize });
      totalUploadedBytes += res.bytes || fileSize;
      console.log(`✓ Xong!\n      -> URL: ${res.secureUrl}`);
    } catch (err) {
      failedUploads.push({ uploadPath, error: err.message });
      console.log(`❌ Thất bại: ${err.message}`);
    }
  }

  // 5. Báo cáo kết quả upload
  console.log('\n' + '-'.repeat(70));
  console.log('  TỔNG KẾT TIẾN TRÌNH UPLOAD PHƯƠNG TIỆN');
  console.log('-'.repeat(70));
  console.log(`✓ Tệp upload mới thành công : ${successfulUploads.length}`);
  console.log(`✓ Tệp tái sử dụng (đã có)  : ${skippedUploads.length}`);
  console.log(`❌ Tệp gặp lỗi               : ${failedUploads.length}`);
  console.log(`📊 Tổng dung lượng chuyển giao: ${(totalUploadedBytes / 1024 / 1024).toFixed(2)} MB`);

  if (failedUploads.length > 0) {
    console.log('\nDanh sách tệp thất bại:');
    failedUploads.forEach((f) => console.log(`  - ${f.uploadPath}: ${f.error}`));
  }

  // 6. Cập nhật D1 (Chỉ thực hiện khi có ít nhất 1 URL thành công hoặc đã có cache)
  const totalAvailable = successfulUploads.length + skippedUploads.length;
  if (totalAvailable === 0) {
    console.log('\n⚠️ Không có tệp nào được xử lý thành công. Hủy thao tác cập nhật cơ sở dữ liệu để bảo vệ an toàn.');
    process.exit(1);
  }

  console.log('\n⏳ Đang tiến hành thay thế các đường dẫn media trong dữ liệu Content...');
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

  const updatedDraft = replaceUrls(draftData);
  const updatedPub = replaceUrls(pubData);

  // Lưu file cục bộ
  fs.writeFileSync(draftPath, JSON.stringify(updatedDraft, null, 2), 'utf8');
  fs.writeFileSync(publishedPath, JSON.stringify(updatedPub, null, 2), 'utf8');
  console.log('✓ Đã cập nhật an toàn vào server/data/draft.json và published.json');

  // Chuẩn bị SQL cập nhật D1
  const escapeSql = (str) => str.replace(/'/g, "''");
  const draftJson = escapeSql(JSON.stringify(updatedDraft));
  const pubJson = escapeSql(JSON.stringify(updatedPub));
  const now = new Date().toISOString();

  const seedSql = `-- Content update with Cloudinary URLs
INSERT OR REPLACE INTO content (key, data, updated_at, published_at) VALUES
  ('draft', '${draftJson}', '${now}', NULL),
  ('published', '${pubJson}', '${now}', '${updatedPub.lastPublishedAt || now}');
`;
  fs.writeFileSync(path.join(__dirname, '..', 'migrations', '0002_seed_initial_content.sql'), seedSql, 'utf8');

  // Tạo các bản ghi media_records
  const mediaLines = [];
  for (const [oldPath, cloudUrl] of Object.entries(urlMap)) {
    if (!oldPath.startsWith('/')) continue;
    const filename = oldPath.replace(/^\/uploads\//, '');
    const isAudio = filename.endsWith('.mp3');
    const safeId = escapeSql(filename);
    const safeUrl = escapeSql(cloudUrl);
    const pubId = escapeSql(cloudUrl.split('/').slice(-2).join('/').replace(/\.[^.]+$/, ''));
    mediaLines.push(
      `INSERT OR REPLACE INTO media_records (id, filename, content_type, size, uploaded_at, cloudinary_public_id, cloudinary_url, resource_type) VALUES ('${safeId}', '${safeId}', '${isAudio ? 'audio/mpeg' : 'image/jpeg'}', 0, '${now}', '${pubId}', '${safeUrl}', '${isAudio ? 'video' : 'image'}');`
    );
  }

  const syncSql = `${seedSql}\n${mediaLines.join('\n')}\n`;
  const tmpSqlPath = path.join(__dirname, '..', 'temp_cloudinary_sync.tmp.sql');
  fs.writeFileSync(tmpSqlPath, syncSql, 'utf8');

  try {
    const flag = isRemote ? '--remote' : '--local';
    console.log(`⏳ Đang thực thi đồng bộ vào Cloudflare D1 (${flag})...`);
    execSync(`npx wrangler d1 execute personal_universe_db ${flag} --file=temp_cloudinary_sync.tmp.sql`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
    console.log('✓ Đã cập nhật thành công dữ liệu vào Cloudflare D1!');
  } catch (err) {
    console.error('❌ Lỗi khi đồng bộ vào D1:', err.message);
  } finally {
    if (fs.existsSync(tmpSqlPath)) fs.unlinkSync(tmpSqlPath);
  }

  console.log('\n' + '='.repeat(70));
  console.log('🎉 TOÀN BỘ QUÁ TRÌNH DI CHUYỂN PHƯƠNG TIỆN ĐÃ HOÀN THÀNH AN TOÀN!');
  console.log('='.repeat(70));
}

main().catch((err) => {
  console.error('\n❌ Lỗi ngoài ý muốn:', err);
  process.exit(1);
});
