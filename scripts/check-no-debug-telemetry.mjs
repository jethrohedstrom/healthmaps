import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const srcDir = path.resolve('src');
const forbiddenMarkers = [
  '127.0.0.1:7840',
  '/ingest/',
  'X-Debug-Session-Id',
  'debugLog',
  'debugRunId',
  '#region agent log',
];

const sourceExtensions = new Set(['.astro', '.js', '.mjs', '.ts', '.tsx']);
const failures = [];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
      return;
    }
    if (!sourceExtensions.has(path.extname(entry.name))) return;

    const content = await readFile(fullPath, 'utf8');
    for (const marker of forbiddenMarkers) {
      if (content.includes(marker)) {
        failures.push(`${path.relative(process.cwd(), fullPath)} contains ${marker}`);
      }
    }
  }));
}

await walk(srcDir);

if (failures.length > 0) {
  console.error('Debug telemetry markers found in production source:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('No debug telemetry markers found in production source.');
