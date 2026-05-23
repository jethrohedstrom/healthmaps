import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sourceRoot = path.join(root, 'src');

const forbiddenPatterns = [
  { label: 'localhost debug endpoint', pattern: /127\.0\.0\.1:7840|localhost:7840/ },
  { label: 'debug telemetry ingest path', pattern: /\/ingest\// },
  { label: 'debug session header', pattern: /X-Debug-Session-Id/ },
  { label: 'debug telemetry helper', pattern: /\bdebugLog\b/ },
  { label: 'debug telemetry run id', pattern: /\bdebugRunId\b/ },
  { label: 'agent log marker', pattern: /#region agent log|#endregion/ },
];

const ignoredDirectories = new Set(['node_modules', '.git', 'dist', '.astro']);
const scannedExtensions = new Set(['.astro', '.js', '.jsx', '.mjs', '.ts', '.tsx']);

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) continue;

    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(fullPath));
    } else if (scannedExtensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

const violations = [];
for (const file of await listFiles(sourceRoot)) {
  const text = await readFile(file, 'utf8');
  const relativePath = path.relative(root, file);

  for (const { label, pattern } of forbiddenPatterns) {
    if (pattern.test(text)) {
      violations.push(`${relativePath}: ${label}`);
    }
  }
}

if (violations.length > 0) {
  console.error('Debug telemetry markers found in production source:');
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log('No debug telemetry markers found in production source.');
