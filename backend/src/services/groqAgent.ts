import {
  DEFAULT_AI_STRENGTHS,
  DEFAULT_SKILL_TAGS,
  type Opportunity,
  type OpportunityType,
  type RoadmapStep,
  SEED_OPPORTUNITIES,
} from '../data/opportunities.js';
import { fetchGitHubProfileSummary } from './github.js';
import { getGroqApiKey } from '../loadEnv.js';
import type { ProfileInput } from '../store/session.js';

const apiKey = () => getGroqApiKey();
const useFallback = () => process.env.USE_AGENT_FALLBACK === 'true';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Ordered list of models to try. First success wins; an unavailable model
 * (404/decommissioned) OR a rate-limited model (429) falls through to the next —
 * Groq enforces limits per-model, so a different model may still have headroom.
 */
function modelChain(): string[] {
  const primary = process.env.GROQ_MODEL?.trim() || 'llama-3.3-70b-versatile';
  const chain = [primary, 'openai/gpt-oss-120b', 'llama-3.1-8b-instant'];
  return [...new Set(chain)];
}

const GROQ_TIMEOUT_MS = 60_000;

/**
 * Groq's free tier counts prompt + max_tokens against one per-minute token budget
 * (12k TPM for llama-3.3-70b). Keep requests comfortably under it by bounding both
 * the context we send and the completion we reserve.
 */
const MAX_RESUME_CHARS = 14_000;
const MAX_GITHUB_SUMMARY_CHARS = 4_000;
const ANALYZE_MAX_TOKENS = 3_500;
const COVER_LETTER_MAX_TOKENS = 1_024;

export function assertAgentConfigured(): void {
  if (apiKey() || useFallback()) return;
  throw new Error(
    'GROQ_API_KEY is not set on the server. Add it in Vercel → Settings → Environment Variables, then redeploy.',
  );
}

const OPPORTUNITY_TYPES: OpportunityType[] = [
  'all',
  'internships',
  'hackathons',
  'remote',
  'fellowships',
];

/** Defensive normalizer — Groq usually returns a string, but tolerate message-shaped objects too. */
function extractAssistantText(result: unknown): string {
  if (typeof result === 'string') return result;
  if (!result || typeof result !== 'object') return '';

  const r = result as Record<string, unknown>;
  if (typeof r.text === 'string') return r.text;
  if (typeof r.content === 'string') return r.content;

  const message = r.message as Record<string, unknown> | undefined;
  if (message && Array.isArray(message.content)) {
    return message.content
      .map((block) => {
        if (block && typeof block === 'object' && 'text' in block) {
          return String((block as { text: string }).text);
        }
        return '';
      })
      .join('\n');
  }

  return JSON.stringify(result);
}

function extractJsonPayload<T>(text: string): T | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? text.trim();

  const objStart = candidate.indexOf('{');
  const objEnd = candidate.lastIndexOf('}');
  if (objStart !== -1 && objEnd > objStart) {
    try {
      return JSON.parse(candidate.slice(objStart, objEnd + 1)) as T;
    } catch {
      /* try array */
    }
  }

  const arrStart = candidate.indexOf('[');
  const arrEnd = candidate.lastIndexOf(']');
  if (arrStart !== -1 && arrEnd > arrStart) {
    try {
      return JSON.parse(candidate.slice(arrStart, arrEnd + 1)) as T;
    } catch {
      return null;
    }
  }

  return null;
}

interface GroqResponse {
  choices?: Array<{
    message?: { role?: string; content?: string };
    finish_reason?: string;
  }>;
  error?: { code?: string; type?: string; message?: string };
}

/** True for "this model id is unavailable/decommissioned" errors so we can fall through to the next model. */
function isModelUnavailable(status: number, body: GroqResponse): boolean {
  if (status === 404) return true;
  const code = body.error?.code ?? '';
  const message = body.error?.message ?? '';
  return (
    code === 'model_not_found' ||
    code === 'model_decommissioned' ||
    /not found|does not exist|decommissioned|not supported/i.test(message)
  );
}

async function callGroq(
  model: string,
  prompt: string,
  opts: { json: boolean; maxTokens: number },
): Promise<{ text: string } | { retryable: string } | { fatal: string }> {
  const key = apiKey();
  if (!key) throw new Error('GROQ_API_KEY is not set');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

  try {
    const res = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: opts.maxTokens,
        ...(opts.json ? { response_format: { type: 'json_object' } } : {}),
      }),
    });

    const data = (await res.json().catch(() => ({}))) as GroqResponse;

    if (!res.ok) {
      if (isModelUnavailable(res.status, data)) {
        return { retryable: `Model "${model}" is not available for this API key` };
      }
      // Prompt + max_tokens exceeds the per-minute token budget. Fallback models have
      // lower limits, so falling through won't help — fail with an actionable message.
      if (res.status === 413 || data.error?.code === 'request_too_large') {
        return {
          fatal:
            'Groq request exceeded the free-tier token-per-minute limit. Try a shorter resume, ' +
            'or upgrade your Groq plan at https://console.groq.com/settings/billing.',
        };
      }
      // Rate limits are per-model on Groq — try the next model rather than giving up.
      if (res.status === 429) {
        return { retryable: `Model "${model}" is rate limited` };
      }
      const reason = data.error?.message || `HTTP ${res.status}`;
      return { fatal: `Groq request failed: ${reason}` };
    }

    const text = (data.choices?.[0]?.message?.content ?? '').trim();
    if (!text) return { fatal: 'Groq returned an empty response' };
    return { text };
  } finally {
    clearTimeout(timer);
  }
}

async function runPrompt(
  prompt: string,
  opts: { json: boolean; maxTokens: number },
): Promise<string> {
  const key = apiKey();
  if (!key) {
    throw new Error('GROQ_API_KEY is not set');
  }

  const models = modelChain();
  let lastError = 'Groq request failed';

  for (const model of models) {
    console.log(`[groq-agent] starting run (model=${model})…`);
    let outcome;
    try {
      outcome = await callGroq(model, prompt, opts);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        lastError = `Groq request timed out after ${GROQ_TIMEOUT_MS / 1000}s`;
        continue;
      }
      throw err;
    }

    if ('text' in outcome) {
      console.log(`[groq-agent] run finished (model=${model})`);
      return extractAssistantText(outcome.text).trim();
    }
    if ('retryable' in outcome) {
      console.warn(`[groq-agent] ${outcome.retryable}, trying next…`);
      lastError = outcome.retryable;
      continue;
    }
    // fatal — auth, bad request: no point trying other models
    throw new Error(outcome.fatal);
  }

  throw new Error(lastError);
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 56) || 'role'
  );
}

function companyLogoUrl(company: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(company.slice(0, 2))}&background=2d2d44&color=b4c5ff&size=128&bold=true`;
}

function normalizeTypes(types: unknown): OpportunityType[] {
  if (!Array.isArray(types)) return ['all'];
  const valid = types.filter((t): t is OpportunityType =>
    OPPORTUNITY_TYPES.includes(t as OpportunityType),
  );
  return valid.length > 0 ? valid : ['all'];
}

function normalizeRoadmap(steps: unknown): RoadmapStep[] {
  if (!Array.isArray(steps) || steps.length === 0) {
    return [
      {
        id: '1',
        title: 'Research the role',
        description: 'Review the team, product, and recent news.',
        status: 'active',
      },
      {
        id: '2',
        title: 'Tailor application',
        description: 'Align resume and portfolio with the job description.',
        status: 'pending',
      },
    ];
  }

  return steps.slice(0, 5).map((step, i) => {
    const s = step as Record<string, unknown>;
    const status = s.status;
    const normalizedStatus: RoadmapStep['status'] =
      status === 'done' || status === 'active' || status === 'pending'
        ? status
        : i === 0
          ? 'done'
          : i === 1
            ? 'active'
            : 'pending';

    return {
      id: String(s.id ?? i + 1),
      title: String(s.title ?? `Step ${i + 1}`),
      description: String(s.description ?? ''),
      status: normalizedStatus,
    };
  });
}

function normalizeOpportunity(
  raw: Record<string, unknown>,
  candidateName: string,
  index: number,
): Opportunity | null {
  const title = String(raw.title ?? '').trim();
  const company = String(raw.company ?? '').trim();
  if (!title || !company) return null;

  const id =
    String(raw.id ?? '').trim() ||
    slugify(`${company}-${title}-${index}`);

  const matchScore = Math.min(
    99,
    Math.max(
      55,
      Math.round(Number(raw.matchScore) || 75),
    ),
  );

  const missingSkills = Array.isArray(raw.missingSkills)
    ? raw.missingSkills.map(String).slice(0, 6)
    : undefined;

  let coverLetter = String(raw.coverLetter ?? '').trim();
  if (!coverLetter) {
    coverLetter = `Dear Hiring Team at ${company},

I am excited to apply for the ${title} position. My background aligns with your needs, and I would welcome the opportunity to contribute.

Best regards,
${candidateName}`;
  }

  return {
    id,
    title,
    company,
    location: String(raw.location ?? 'Remote').trim(),
    matchScore,
    rationale: String(
      raw.rationale ??
        `Your profile aligns with ${title} at ${company} based on skills and experience.`,
    ).trim(),
    logoUrl:
      String(raw.logoUrl ?? '').trim() || companyLogoUrl(company),
    types: normalizeTypes(raw.types),
    missingSkills:
      missingSkills && missingSkills.length > 0 ? missingSkills : undefined,
    coverLetter,
    roadmap: normalizeRoadmap(raw.roadmap),
  };
}

async function buildEnrichedContext(profile: ProfileInput): Promise<string> {
  const githubSummary = profile.github
    ? profile.githubSummary ?? (await fetchGitHubProfileSummary(profile.github))
    : '';

  // Bound the context so prompt + max_tokens stays under Groq's per-minute budget.
  const trimmedGithub = (githubSummary ?? '').slice(0, MAX_GITHUB_SUMMARY_CHARS);
  const trimmedResume = profile.resumeText?.slice(0, MAX_RESUME_CHARS) ?? '';

  const blocks = [
    `Candidate name: ${profile.name}`,
    profile.github ? `GitHub URL: ${profile.github}` : '',
    trimmedGithub ? `\n--- GitHub analysis ---\n${trimmedGithub}` : '',
    profile.linkedin ? `LinkedIn / portfolio: ${profile.linkedin}` : '',
    profile.resumeUploaded
      ? `Resume file: ${profile.resumeFileName ?? 'uploaded'}`
      : 'No resume file uploaded',
    trimmedResume ? `\n--- Resume / CV text ---\n${trimmedResume}` : '',
  ].filter(Boolean);

  return blocks.join('\n');
}

export interface ProfileInsights {
  skillTags: string[];
  aiStrengths: string[];
  rolesScanned: number;
}

interface AgentAnalysisPayload {
  skillTags?: string[];
  aiStrengths?: string[];
  rolesScanned?: number;
  opportunities?: Array<Record<string, unknown>>;
}

function seedFallback(name: string): ProfileInsights & { opportunities: Opportunity[] } {
  return {
    skillTags: DEFAULT_SKILL_TAGS,
    aiStrengths: DEFAULT_AI_STRENGTHS,
    rolesScanned: 1240,
    opportunities: SEED_OPPORTUNITIES.map((o) => ({
      ...o,
      coverLetter: o.coverLetter.replace(/\{\{name\}\}/g, name),
      roadmap: o.roadmap.map((s) => ({ ...s })),
    })),
  };
}

export async function analyzeProfileWithAgent(
  profile: ProfileInput,
): Promise<
  ProfileInsights & { opportunities: Opportunity[]; source: 'agent' | 'fallback' }
> {
  assertAgentConfigured();

  if (useFallback()) {
    return { ...seedFallback(profile.name), source: 'fallback' };
  }

  // Reuse the summary the route already fetched; only fetch here if it was not provided.
  const githubSummary =
    profile.githubSummary ??
    (profile.github ? await fetchGitHubProfileSummary(profile.github) : undefined);
  const profileWithContext: ProfileInput = { ...profile, githubSummary };
  const enriched = await buildEnrichedContext(profileWithContext);

  const prompt = `You are OpportunityAgent — an autonomous career scout. You work for ANY candidate worldwide (any name, country, seniority, or field).

TASK: Using ONLY the candidate data below (CV/resume text, GitHub repos, LinkedIn URL context), infer their level (student, intern, junior, mid, senior, career-switcher) and search for 4 to 6 realistic opportunities that fit THEM specifically.

Rules:
- Personalize every rationale to THIS candidate's repos, skills, employers, and education — never generic filler.
- Include a mix relevant to their level: internships, fellowships, hackathons, remote roles, or full-time as appropriate.
- Use real or highly plausible employers (global startups, NGOs, tech companies, open-source programs, etc.).
- Match locations to their profile when known; otherwise prefer remote-friendly roles.
- Do NOT copy demo placeholders (Lumina Systems, Nebula Cloud, NeuralFlow AI, Metaverse Systems) unless they truly fit.
- Cover letters must use the candidate's actual name: ${profile.name}

Candidate data:
${enriched}

Respond with ONLY valid JSON (no markdown outside JSON) in exactly this shape:
{
  "skillTags": ["4-8 skills inferred from CV/GitHub"],
  "aiStrengths": ["3-5 career strengths"],
  "rolesScanned": <integer 600-3000 estimating roles reviewed>,
  "opportunities": [
    {
      "id": "unique-slug",
      "title": "Job title",
      "company": "Company name",
      "location": "City or Remote",
      "matchScore": <65-98>,
      "rationale": "2-3 sentences referencing THEIR specific projects, languages, or experience",
      "types": ["all", "remote"] or include "internships" / "fellowships" / "hackathons" as relevant,
      "missingSkills": ["optional gaps"],
      "coverLetter": "Short tailored draft ending with Best regards, ${profile.name}",
      "roadmap": [
        { "id": "1", "title": "...", "description": "...", "status": "done" },
        { "id": "2", "title": "...", "description": "...", "status": "active" },
        { "id": "3", "title": "...", "description": "...", "status": "pending" }
      ]
    }
  ]
}`;

  try {
    const raw = await runPrompt(prompt, { json: true, maxTokens: ANALYZE_MAX_TOKENS });
    const parsed = extractJsonPayload<AgentAnalysisPayload>(raw);

    if (!parsed?.skillTags?.length || !parsed.opportunities?.length) {
      console.warn('[groq-agent] invalid agent JSON shape');
      throw new Error('Incomplete agent response');
    }

    const opportunities = parsed.opportunities
      .map((o, i) => normalizeOpportunity(o, profile.name, i))
      .filter((o): o is Opportunity => o !== null)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 8);

    if (opportunities.length === 0) {
      throw new Error('No valid opportunities parsed');
    }

    return {
      skillTags: parsed.skillTags.slice(0, 8),
      aiStrengths: (parsed.aiStrengths ?? DEFAULT_AI_STRENGTHS).slice(0, 5),
      rolesScanned:
        typeof parsed.rolesScanned === 'number'
          ? Math.round(parsed.rolesScanned)
          : 800 + opportunities.length * 120,
      opportunities,
      source: 'agent',
    };
  } catch (err) {
    console.warn('[groq-agent] full analyze failed:', err);
    if (useFallback()) {
      return { ...seedFallback(profile.name), source: 'fallback' };
    }
    throw err instanceof Error
      ? err
      : new Error('Groq analysis failed');
  }
}

export async function generateCoverLetterWithAgent(
  profile: Pick<
    ProfileInput,
    'name' | 'github' | 'linkedin' | 'resumeText' | 'githubSummary'
  >,
  opportunity: Opportunity,
): Promise<string> {
  if (useFallback() || !apiKey()) {
    return opportunity.coverLetter;
  }

  const githubSummary =
    profile.githubSummary ??
    (profile.github ? await fetchGitHubProfileSummary(profile.github) : '');

  const prompt = `Write a professional cover letter (under 220 words) for this job application. Reference specific details from the candidate's background. Sign off as ${profile.name}.

Candidate:
Name: ${profile.name}
GitHub: ${profile.github || 'n/a'}
${githubSummary ? `GitHub context:\n${githubSummary}` : ''}
LinkedIn: ${profile.linkedin || 'n/a'}
${profile.resumeText ? `Resume excerpt:\n${profile.resumeText.slice(0, 2500)}` : ''}

Role: ${opportunity.title} at ${opportunity.company} (${opportunity.location})
Match rationale: ${opportunity.rationale}

Respond with ONLY the cover letter text (no JSON, no markdown fences).`;

  try {
    const letter = await runPrompt(prompt, { json: false, maxTokens: COVER_LETTER_MAX_TOKENS });
    if (letter.length > 80) return letter;
  } catch (err) {
    console.warn('[groq-agent] cover letter fallback:', err);
  }

  return opportunity.coverLetter;
}
