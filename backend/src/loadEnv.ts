import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(here, '../..');
const repoRoot = path.resolve(backendRoot, '..');

config({ path: path.join(backendRoot, '.env') });
config({ path: path.join(repoRoot, '.env') });

export function getCursorApiKey(): string | undefined {
  const key = process.env.CURSOR_API_KEY?.trim();
  return key || undefined;
}

export function isAgentConfigured(): boolean {
  return Boolean(getCursorApiKey()) || process.env.USE_AGENT_FALLBACK === 'true';
}
