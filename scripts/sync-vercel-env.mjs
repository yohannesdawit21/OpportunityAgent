#!/usr/bin/env node
/**
 * Push CURSOR_API_KEY from backend/.env to the linked Vercel project.
 * Usage: npm run vercel:sync-env
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(root, 'backend', '.env');

function parseKey(file) {
  if (!existsSync(file)) {
    console.error(`Missing ${file} — copy backend/.env.example and set CURSOR_API_KEY.`);
    process.exit(1);
  }
  const line = readFileSync(file, 'utf8')
    .split('\n')
    .find((l) => /^\s*CURSOR_API_KEY\s*=/.test(l));
  if (!line) {
    console.error('CURSOR_API_KEY not found in backend/.env');
    process.exit(1);
  }
  const value = line.replace(/^\s*CURSOR_API_KEY\s*=\s*/, '').trim();
  if (!value || value === 'your_cursor_api_key_here') {
    console.error('Set a real CURSOR_API_KEY in backend/.env first.');
    process.exit(1);
  }
  return value;
}

function run(args) {
  const r = spawnSync('npx', ['--yes', 'vercel@latest', ...args], {
    cwd: root,
    encoding: 'utf8',
    stdio: 'inherit',
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const key = parseKey(envPath);

console.log('Linking project (if needed)…');
run(['link', '--yes']);

for (const target of ['production', 'preview', 'development']) {
  console.log(`Setting CURSOR_API_KEY for ${target}…`);
  spawnSync(
    'npx',
    ['--yes', 'vercel@latest', 'env', 'rm', 'CURSOR_API_KEY', target, '--yes'],
    { cwd: root, stdio: 'inherit' },
  );
  run([
    'env',
    'add',
    'CURSOR_API_KEY',
    target,
    '--value',
    key,
    '--sensitive',
    '--yes',
  ]);
}

console.log('\nDone. Redeploy on Vercel, then verify:');
console.log('  curl https://YOUR-APP.vercel.app/api/health');
console.log('Expected: {"ok":true,"agent":true,...}');
