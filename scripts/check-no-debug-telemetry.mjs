import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const srcDir = path.resolve('src');
const forbiddenPatterns = [
  /127\.0\.0\.1:7840/,
  /\/ingest\/[0-9a-f-]{36}/i,
  /X-Debug-Session-Id/,
  /\bdebugLog\b/,
  /\bdebugRunId\b/,
  /#region agent log/
];

async function* sourceFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const filePath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      yield* sourceFiles(filePath);
    } else if (/\.(astro|js|mjs|ts|tsx)$/.test(entry.name)) {
      yield filePath;
    }
  }
}

const matches = [];

for await (const filePath of sourceFiles(srcDir)) {
  const source = await readFile(filePath, 'utf8');
  const lines = source.split('\n');

  lines.forEach((line, index) => {
    if (forbiddenPatterns.some((pattern) => pattern.test(line))) {
      matches.push(`${path.relative(process.cwd(), filePath)}:${index + 1}: ${line.trim()}`);
    }
  });
}

if (matches.length > 0) {
  console.error('Debug telemetry markers found in source:');
  console.error(matches.join('\n'));
  process.exit(1);
}

console.log('No debug telemetry markers found in src/.');
