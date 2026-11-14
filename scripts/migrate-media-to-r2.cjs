const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const isRemote = process.argv.includes('--remote');
const flag = isRemote ? '--remote' : '--local';
const bucketName = 'personal-universe-media';
const uploadsDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  console.log('No uploads directory found. Nothing to migrate.');
  process.exit(0);
}

const files = fs.readdirSync(uploadsDir).filter((f) => f !== '.gitkeep' && !f.startsWith('.'));

if (files.length === 0) {
  console.log('No media files found in uploads/ to migrate.');
  process.exit(0);
}

console.log(`Starting media migration to Cloudflare R2 (${isRemote ? 'REMOTE' : 'LOCAL'})...`);
console.log(`Target Bucket: ${bucketName}`);
console.log(`Found ${files.length} file(s) to upload:\n`);

let successCount = 0;
let failCount = 0;

for (const file of files) {
  const filePath = path.join(uploadsDir, file);
  const command = `npx wrangler r2 object put ${bucketName}/${file} --file="${filePath}" ${flag}`;
  console.log(`Uploading: ${file} (${(fs.statSync(filePath).size / 1024).toFixed(1)} KB)...`);
  try {
    execSync(command, { stdio: 'inherit' });
    successCount++;
    console.log(`✓ Successfully uploaded: ${file}\n`);
  } catch (err) {
    console.error(`✗ Failed to upload ${file}:`, err.message);
    failCount++;
  }
}

console.log('--------------------------------------------------');
console.log(`Migration Complete: ${successCount} succeeded, ${failCount} failed.`);
if (failCount > 0) {
  process.exit(1);
}
