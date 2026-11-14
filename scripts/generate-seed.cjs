const fs = require('fs');
const path = require('path');

const draftPath = path.join(__dirname, '..', 'server', 'data', 'draft.json');
const publishedPath = path.join(__dirname, '..', 'server', 'data', 'published.json');
const outputPath = path.join(__dirname, '..', 'migrations', '0002_seed_initial_content.sql');

if (!fs.existsSync(draftPath) || !fs.existsSync(publishedPath)) {
  console.error('Draft or published file missing!');
  process.exit(1);
}

const draft = JSON.parse(fs.readFileSync(draftPath, 'utf8'));
const published = JSON.parse(fs.readFileSync(publishedPath, 'utf8'));

// Escape single quotes for SQLite
const escapeSql = (str) => str.replace(/'/g, "''");

const draftJson = escapeSql(JSON.stringify(draft));
const publishedJson = escapeSql(JSON.stringify(published));
const now = new Date().toISOString();

const sql = `-- Seed initial content from existing local data
INSERT OR REPLACE INTO content (key, data, updated_at, published_at) VALUES
  ('draft', '${draftJson}', '${now}', NULL),
  ('published', '${publishedJson}', '${now}', '${published.lastPublishedAt || now}');
`;

fs.writeFileSync(outputPath, sql, 'utf8');
console.log('Successfully generated:', outputPath);
