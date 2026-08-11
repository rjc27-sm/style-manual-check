/**
 * Proof Positive (IM2026) – AI client
 * Talks to the Cloudflare Worker proxy (see ../worker/). The Worker holds the
 * API key, enforces rate limits and forwards requests to the Claude API.
 * If WORKER_URL is empty, all AI features show as 'not configured' and the
 * deterministic tools keep working normally.
 */

// Set this to your deployed Worker URL, for example:
// export const WORKER_URL = 'https://im2026-proof-positive.jcr27.workers.dev';
export const WORKER_URL = 'https://im2026-proof-positive.jcr27.workers.dev';

export const AI_ENABLED = WORKER_URL !== '';

export const AI_NOTICE =
    'AI features send the text you choose (and nothing else) to the Claude ' +
    'API for processing. Do not enter classified, sensitive or personal information. ' +
    'AI suggestions can be wrong. Review them before use.';

class AiError extends Error {
    constructor(message, kind) { super(message); this.kind = kind; }
}

async function callWorker(path, body) {
    if (!AI_ENABLED) {
        throw new AiError('AI features are not configured on this copy of the tool.', 'config');
    }
    let res;
    try {
        res = await fetch(WORKER_URL + path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    } catch (err) {
        throw new AiError('Could not reach the AI service. Check your connection and try again.', 'network');
    }
    if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        throw new AiError(data.error ||
            'The daily AI usage limit has been reached. The rule-based tools still work; try the AI features again tomorrow.', 'limit');
    }
    if (res.status === 413) {
        throw new AiError('That text is too long for the AI service. Try a shorter passage.', 'toolong');
    }
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new AiError(data.error || 'The AI service returned an error (' + res.status + '). Try again shortly.', 'server');
    }
    return res.json();
}

/**
 * Rewrite a passage to fix a specific style issue.
 * Returns { rewrite: string }
 */
export function aiFix({ passage, ruleName, ruleDescription, guidance }) {
    return callWorker('/api/fix', { passage, ruleName, ruleDescription, guidance });
}

/**
 * Parse a messy pasted reference into structured citation fields.
 * Returns { sourceType: string, fields: object, confidence: string }
 */
export function aiParseCitation({ reference }) {
    return callWorker('/api/citation-parse', { reference });
}

/**
 * Ask a question about the Style Manual.
 * history: [{ role: 'user'|'assistant', content: string }]
 * Returns { answer: string, sources: { url: pageTitle, ... } }
 */
export function aiAsk({ question, history }) {
    return callWorker('/api/ask', { question, history: history || [] });
}

/**
 * Rewrite a passage into Style Manual plain English.
 * `changes` holds short user-facing notes on what the rewrite changed; an
 * older Worker returns none, so treat it as optional.
 * Returns { rewrite: string, changes: string[] }
 */
export function aiPlain({ passage }) {
    return callWorker('/api/plain', { passage });
}

/**
 * Decide a list's type, rewrite its items into parallel form and report the
 * changes. A deterministic formatter then applies markers and punctuation.
 * For a multilevel list, pass `levels` (one 0/1/2 per item); the answer then
 * carries a matching `levels` array.
 * Returns { type: 'sentence'|'fragment'|'standAlone', leadIn, items: string[],
 *           levels: number[]|null, changes: string[], coherent, note }
 */
export function aiListFormat({ leadIn, items, levels, forcedType }) {
    return callWorker('/api/list-format', { leadIn, items, levels, forcedType });
}
