#!/usr/bin/env node
/**
 * Push GEMINI_API_KEY from backend/.env to the linked Vercel project.
 * Usage: npm run vercel:sync-env
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(root, 'backend', '.env');
const ENV_KEY = 'GEMINI_API_KEY';

function parseKey(file) {
  if (!existsSync(file)) {
    console.error(`Missing ${file} — copy backend/.env.example and set ${ENV_KEY}.`);
    process.exit(1);
  }
  const line = readFileSync(file, 'utf8')
    .split('\n')
    .find((l) => new RegExp(`^\\s*${ENV_KEY}\\s*=`).test(l));
  if (!line) {
    console.error(`${ENV_KEY} not found in backend/.env`);
    process.exit(1);
  }
  const value = line.replace(new RegExp(`^\\s*${ENV_KEY}\\s*=\\s*`), '').trim();
  if (!value || value === 'your_gemini_api_key_here') {
    console.error(`Set a real ${ENV_KEY} in backend/.env first.`);
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

// Skip link step if .vercel/repo.json exists (project already linked)
if (!existsSync(path.join(root, '.vercel', 'repo.json'))) {
  console.log('Linking project (if needed)…');
  run(['link', '--yes']);
}

for (const target of ['production', 'preview', 'development']) {
  console.log(`Setting ${ENV_KEY} for ${target}…`);
  spawnSync(
    'npx',
    ['--yes', 'vercel@latest', 'env', 'rm', ENV_KEY, target, '--yes'],
    { cwd: root, stdio: 'inherit' },
  );
  run([
    'env',
    'add',
    ENV_KEY,
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
