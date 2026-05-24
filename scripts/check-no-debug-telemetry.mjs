import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, 'src');
const FORBIDDEN_MARKERS = [
  '127.0.0.1:7840',
  '/ingest/',
  'X-Debug-Session-Id',
  'debugLog',
  'debugRunId',
];

const TEXT_EXTENSIONS = new Set([
  '.astro',
  '.css',
  '.js',
  '.json',
  '.md',
  '.mjs',
  '.ts',
]);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
    } else if (entry.isFile() && TEXT_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

const matches = [];

for (const file of await walk(SOURCE_DIR)) {
  const content = await readFile(file, 'utf8');
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    FORBIDDEN_MARKERS.forEach((marker) => {
      if (line.includes(marker)) {
        matches.push({
          marker,
          line: index + 1,
          file: path.relative(ROOT, file),
        });
      }
    });
  });
}

if (matches.length > 0) {
  console.error('Debug telemetry markers found in production source:');
  matches.forEach(({ file, line, marker }) => {
    console.error(`- ${file}:${line} contains ${marker}`);
  });
  process.exit(1);
}

console.log('No debug telemetry markers found in src/.');
