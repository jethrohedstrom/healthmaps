import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const scanDirs = ['src'];
const extensions = new Set(['.astro', '.js', '.mjs', '.ts']);
const forbiddenMarkers = [
  '127.0.0.1:7840',
  '/ingest/',
  'X-Debug-Session-Id',
  'debugLog',
  'debugRunId',
];

const matches = [];

async function scanDirectory(dir) {
  const entries = await readdir(dir, { withFileTypes: true });

  await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await scanDirectory(fullPath);
      return;
    }

    if (!entry.isFile() || !extensions.has(path.extname(entry.name))) {
      return;
    }

    const contents = await readFile(fullPath, 'utf8');
    const lines = contents.split(/\r?\n/);

    lines.forEach((line, index) => {
      forbiddenMarkers.forEach((marker) => {
        if (line.includes(marker)) {
          matches.push({
            marker,
            file: path.relative(rootDir, fullPath),
            line: index + 1,
          });
        }
      });
    });
  }));
}

for (const scanDir of scanDirs) {
  await scanDirectory(path.join(rootDir, scanDir));
}

if (matches.length > 0) {
  console.error('Debug telemetry markers must not be committed to production source:');
  matches.forEach(({ marker, file, line }) => {
    console.error(`- ${file}:${line} contains ${marker}`);
  });
  process.exit(1);
}

console.log('No debug telemetry markers found.');
