import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(here, '../..');
const repoRoot = path.resolve(backendRoot, '..');

config({ path: path.join(backendRoot, '.env') });
config({ path: path.join(repoRoot, '.env') });

/** Placeholder values shipped in .env.example that must NOT count as a configured key. */
const PLACEHOLDER_KEYS = new Set([
  'your_groq_api_key_here',
  'your_gemini_api_key_here',
  'your_google_api_key_here',
  'your_api_key_here',
]);

export function getGroqApiKey(): string | undefined {
  const key = process.env.GROQ_API_KEY?.trim();
  if (!key || PLACEHOLDER_KEYS.has(key)) return undefined;
  return key;
}

export function isAgentConfigured(): boolean {
  return Boolean(getGroqApiKey()) || process.env.USE_AGENT_FALLBACK === 'true';
}
