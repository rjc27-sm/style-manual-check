/**
 * Proof Positive (IM2026) – AI client
 * Talks to the Cloudflare Worker proxy (see ../worker/). The Worker holds the
 * API key, enforces rate limits and forwards requests to the Claude API.
 * If WORKER_URL is empty, all AI features show as 'not configured' and the
 * deterministic tools keep working normally.
 */

// Set this to your deployed Worker URL, for example:
// export const WORKER_URL = 'https://im2026-proof-positive.YOURNAME.workers.dev';
export const WORKER_URL = '';

export const AI_ENABLED = WORKER_URL !== '';

export const AI_NOTICE =
    'AI features send the text you choose (and nothing else) to the Claude ' +
    'API for processing. Do not use sensitive or personal information. ' +
    'AI suggestions can be wrong - review them before use.';

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
            'The daily AI usage limit has been reached. The rule-based tools still work - try the AI features again tomorrow.', 'limit');
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
 * Rewrite list items in parallel form.
 * Returns { items: string[] }
 */
export function aiParallelList({ leadIn, items, listType }) {
    return callWorker('/api/list-parallel', { leadIn, items, listType });
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
 * Returns { answer: string }
 */
export function aiAsk({ question, history }) {
    return callWorker('/api/ask', { question, history: history || [] });
}
