import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const sourceRoot = path.resolve('src');
const checkedExtensions = new Set(['.astro', '.js', '.mjs', '.ts', '.tsx']);
const forbiddenTokens = [
  '127.0.0.1:' + '7840',
  '/ing' + 'est/',
  'X-Debug-' + 'Session-Id',
  'debug' + 'Log',
  'debug' + 'RunId',
  '#region agent ' + 'log',
];

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else if (checkedExtensions.has(path.extname(entry.name))) {
      yield fullPath;
    }
  }
}

const failures = [];

for await (const file of walk(sourceRoot)) {
  const contents = await readFile(file, 'utf8');
  for (const token of forbiddenTokens) {
    if (contents.includes(token)) {
      failures.push(`${path.relative(process.cwd(), file)} contains ${token}`);
    }
  }
}

if (failures.length > 0) {
  console.error('Debug telemetry markers must not ship in source files:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('No debug telemetry markers found in source files.');
