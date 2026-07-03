/**
 * Proof Positive (IM2026) - Cloudflare Worker proxy
 *
 * Sits between the static site and the Claude API. It:
 *   - holds the API key (Worker secret - never in the browser or the repo)
 *   - enforces per-IP and global daily request limits (KV counters)
 *   - caps input length per request
 *   - restricts which origins may call it (CORS)
 *   - forwards to the Claude API with a small, fixed max_tokens
 *
 * Secrets / bindings (see wrangler.toml and DEPLOY.md):
 *   ANTHROPIC_API_KEY  - secret
 *   RATE_KV            - KV namespace for rate counters
 * Vars (optional overrides):
 *   ALLOWED_ORIGINS    - comma-separated list of allowed page origins
 *   MODEL              - Claude model id
 *   IP_DAILY_LIMIT     - requests per IP per day (default 40)
 *   GLOBAL_DAILY_LIMIT - requests across all users per day (default 500)
 */

import { PAGE_INDEX } from './pages-index.js';

const DEFAULTS = {
    MODEL: 'claude-haiku-4-5',
    ASK_MODEL: 'claude-sonnet-5',
    PAGES_BASE_URL: 'https://rjc27-sm.github.io/style-manual-check/im2026/pages/',
    IP_DAILY_LIMIT: 40,
    GLOBAL_DAILY_LIMIT: 500,
    MAX_TOKENS: 1024
};

// ---------------- retrieval over the scraped Style Manual ----------------
// The Ask feature answers from the actual scraped page content, not model
// memory. pages-index.js holds a keyword index of the 146 scraped pages; the
// page text itself is served as static files alongside the site and fetched
// (with edge caching) per question.

const STOPWORDS = new Set(('a an and are as at be but by for from has have how in is it its of on or ' +
    'that the this to was we what when where which who will with you your not do does don can i use ' +
    'should would could writing write written when using style manual australian government').split(' '));

// Short tokens that matter for style questions despite the length filter.
const KEEP_SHORT = new Set(['am', 'pm', 'en', 'em', 'e.g', 'ie', 'eg', 'vs']);

// Query expansion: common phrasings that the page keywords don't contain.
const EXPANSIONS = [
    [/\b(am|pm|\d(?::\d\d)?\s*(?:am|pm)|o'?clock|time of day|midnight|noon)\b/i, 'dates time'],
    [/\bdata (is|are|was|were)\b|\bsingular or plural\b|\bplural or singular\b/i, 'nouns singular plural'],
    [/\bbullet(s| point| list)?\b|\bdot point\b/i, 'lists'],
    [/\b(reference|referencing|cite|citation|bibliography)\b/i, 'author date referencing'],
    [/\bacronym|initialism\b/i, 'abbreviations shortened'],
    [/\b(aboriginal|indigenous|torres strait)\b/i, 'aboriginal torres strait islander peoples'],
    [/\bcapital(s|isation| letters)?\b/i, 'capitalisation punctuation'],
    [/\bheadings?\b/i, 'headings'],
    [/\bnumbers? (as )?(words?|numerals?)\b/i, 'choosing numerals words'],
    [/\b(e\.?g\.?|i\.?e\.?|etc\.?|et al|latin)\b/i, 'latin shortened forms'],
    [/\b(minister|senator|premier|title of|dr|professor|honourable|excellency)\b/i, 'titles honours forms address'],
    [/\bampersands?\b|\s&\s/i, 'ampersands'],
    [/\bitalics?\b|\bitalicis/i, 'italics']
];

function tokenise(s) {
    return s.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ')
        .split(/[\s-]+/)
        .filter(w => (w.length > 2 || KEEP_SHORT.has(w)) && !STOPWORDS.has(w));
}

function expandQuery(question) {
    let extra = '';
    for (const [pattern, terms] of EXPANSIONS) {
        if (pattern.test(question)) extra += ' ' + terms;
    }
    return question + extra;
}

function retrievePages(question, n) {
    const q = [...new Set(tokenise(expandQuery(question)))];
    const scored = [];
    for (const p of PAGE_INDEX) {
        const title = p.t.toLowerCase();
        let score = 0;
        for (const w of q) {
            if (title.includes(w)) score += 4;
            if (p.u.includes(w)) score += 2;
            if (p.k.includes(w)) score += 1;
        }
        if (score >= 3) scored.push([score, p]);
    }
    scored.sort((a, b) => b[0] - a[0]);
    return scored.slice(0, n).map(x => x[1]);
}

async function fetchPageText(env, slug) {
    const base = env.PAGES_BASE_URL || DEFAULTS.PAGES_BASE_URL;
    try {
        const res = await fetch(base + slug + '.md',
            { cf: { cacheTtl: 86400, cacheEverything: true } });
        if (!res.ok) return null;
        return await res.text();
    } catch { return null; }
}

const AU_STYLE_CORE = `You write in Australian Government Style Manual style:
Australian English spelling (organise, colour, program); sentences of 25 words
or fewer where possible; active voice; plain everyday words; minimal capitals
(proper nouns only); numerals for 2 and above, words for zero and one; dates as
day month year (15 October 2023); times like 3:30 pm; spaced en dashes for
parenthetical phrases, never unspaced em dashes; single quotation marks; no
serial comma unless needed for clarity; '%' with no space; 'per cent' only as
a noun phrase where required. Never use 'e.g.', 'i.e.' or 'etc.' - write
'for example', 'that is' and 'and so on'. Never use emojis.`;

const PROMPTS = {
    fix: {
        system: `You are the rewrite assistant inside 'Proof Positive', a rule-based
Australian Government Style Manual checker. A deterministic rule engine found a
style issue it cannot fix mechanically. Rewrite the passage to fix that issue.
${AU_STYLE_CORE}
Rules:
- Change as little as possible. Keep the author's meaning and terminology.
- Fix the named issue; also fix any other clear Style Manual breaches you see.
- Your output will be re-checked by the deterministic rule engine.
- Reply with the rewritten passage only. No preamble, no quotation marks
  around the whole answer, no explanation.`,
        build(body) {
            return `Style issue: ${body.ruleName}\nWhat the rule checks: ${body.ruleDescription}\n` +
                (body.guidance ? `Extra guidance: ${body.guidance}\n` : '') +
                `Passage to rewrite:\n${body.passage}`;
        },
        maxChars: 3500,
        shape: r => ({ rewrite: r.trim() })
    },

    'list-parallel': {
        system: `You rewrite bullet-list items into parallel grammatical form for
'Proof Positive', an Australian Government Style Manual tool.
${AU_STYLE_CORE}
Rules:
- Make every item the same grammatical form. If a lead-in is given, each item
  must continue the lead-in naturally and the whole must read as grammatical.
- Prefer the form most items already use; change as little as possible.
- Do not add or remove items. Do not add markers, numbering or punctuation at
  the ends of items - a deterministic formatter handles punctuation.
- Reply with one item per line and nothing else.`,
        build(body) {
            return (body.listType ? `List type: ${body.listType}\n` : '') +
                (body.leadIn ? `Lead-in: ${body.leadIn}\n` : '') +
                `Items:\n${body.items.join('\n')}`;
        },
        maxChars: 4000,
        shape: r => ({
            items: r.split('\n').map(s => s.replace(/^[-•*\d.)\s]+/, '').trim()).filter(Boolean)
        })
    },

    'citation-parse': {
        system: `You extract structured citation data for 'Proof Positive', an
Australian Government Style Manual citation tool. The user pastes a messy or
incomplete reference. Identify the source type and extract the fields. A
deterministic formatter builds the final citation - you only extract.
sourceType must be exactly one of: journal, book, chapter, website, report,
newspaper, dataset, mediarelease, conferencepaper, thesis, legislation.
Reply with a single JSON object and nothing else, using only these keys:
{"sourceType": "...", "confidence": "high|medium|low", "fields": {
 "authors": [{"given": "...", "family": "..."}] for people, or
 [{"org": "Full Organisation Name", "abbrev": "ABC"}] for an organisation,
 "editors": [{"given": "...", "family": "..."}] (chapters only),
 "title": "...", "chapterTitle": "...", "bookTitle": "...",
 "journalName": "...", "year": "...", "volume": "...", "issue": "...",
 "pages": "...", "doi": "...", "url": "...", "edition": "...",
 "publisher": "...", "place": "...", "websiteName": "...", "series": "...",
 "governmentName": "...", "publicationName": "...", "fullDate": "...",
 "organisation": "...", "conference": "...", "university": "...",
 "thesisType": "...", "jurisdiction": "...", "accessDate": "..."}}
Field notes: for chapters use chapterTitle + bookTitle (not title); for
newspaper use publicationName and fullDate ('24 May 2018'); for legislation,
title includes the year ('Major Bank Levy Act 2017') and jurisdiction is Cth,
ACT, NSW, NT, Qld, SA, Tas, Vic or WA; accessDate format is '20 January 2025';
pages format is '172-188'.
Only include fields actually present in the reference. Never invent a DOI,
URL, date or page numbers. If unsure of the type, choose the most likely and
set confidence to low.`,
        build(body) { return `Reference:\n${body.reference}`; },
        maxChars: 2500,
        shape(r) {
            const match = r.match(/\{[\s\S]*\}/);
            if (!match) throw new Error('no-json');
            const parsed = JSON.parse(match[0]);
            return {
                sourceType: String(parsed.sourceType || 'website'),
                confidence: String(parsed.confidence || 'low'),
                fields: parsed.fields || {}
            };
        }
    },

    plain: {
        system: `You rewrite dense, bureaucratic or complex text into plain English
for 'Proof Positive', an Australian Government Style Manual tool.
${AU_STYLE_CORE}
Rules:
- Keep every fact, obligation and nuance. Simplify the language, not the
  meaning. Never add information that is not in the original.
- Short sentences of 25 words or fewer. Active voice. Everyday words.
- One idea per paragraph. Front-load the key information.
- Replace jargon with plain terms, or briefly explain a technical term the
  first time if it must stay.
- Use a '- ' dash list only where a list genuinely helps the reader.
- Your output will be re-checked by a deterministic rule engine.
- Reply with the rewritten text only. No preamble, no explanation.`,
        build(body) { return body.passage; },
        maxChars: 6000,
        shape: r => ({ rewrite: r.trim() })
    },

    ask: {
        // The extracts are appended to this system prompt per request - see
        // the ask-specific handling in fetch() below.
        system: `You are a friendly assistant answering questions about the Australian
Government Style Manual, as part of an Innovation Month 2026 (IM2026)
Bureaucrat Bot. You are not an official government service.
${AU_STYLE_CORE}
Rules for answers:
- Answer only questions about Australian Government writing style, editing,
  the Style Manual, plain language, referencing or accessibility of content.
  For anything else, briefly say it is outside what you cover.
- Answer USING ONLY the Style Manual extracts provided below. Quote or
  paraphrase the extracts - do not rely on your own memory of style rules,
  which may drift towards American conventions.
- Be concise: a short direct answer first, then a brief example if useful.
- Format simply: short paragraphs, '- ' for any list items, **bold** only for
  the key term or correct form. No headings, no tables, no nested lists.
- End with 'Read more:' followed by the Source URL of every extract you
  relied on - each URL on its own line. Cite one URL if only one extract was
  relevant, more if several were. Never cite any URL that is not in the
  extracts.
- If the extracts do not answer the question, say plainly that you could not
  find specific guidance on it, do not guess, and suggest searching
  https://www.stylemanual.gov.au directly.`,
        build(body) { return body.question; },
        maxChars: 1200,
        history: true,
        retrieval: true,
        shape: r => ({ answer: r.trim() })
    }
};

// ---------------- helpers ----------------

function corsHeaders(origin, env) {
    const allowed = (env.ALLOWED_ORIGINS || '')
        .split(',').map(s => s.trim()).filter(Boolean);
    const ok = allowed.length === 0 || allowed.includes(origin);
    return {
        'Access-Control-Allow-Origin': ok && origin ? origin : (allowed[0] || '*'),
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin'
    };
}

function json(data, status, extra) {
    return new Response(JSON.stringify(data), {
        status: status || 200,
        headers: Object.assign({ 'Content-Type': 'application/json' }, extra || {})
    });
}

async function bumpCounter(env, key, limit) {
    // KV counters are approximate under heavy concurrency - fine for this
    // purpose: the hard cost ceiling is the prepaid API credit, not this.
    const raw = await env.RATE_KV.get(key);
    const count = raw ? parseInt(raw, 10) : 0;
    if (count >= limit) return false;
    await env.RATE_KV.put(key, String(count + 1), { expirationTtl: 90000 });
    return true;
}

// ---------------- main ----------------

export default {
    async fetch(request, env) {
        const origin = request.headers.get('Origin') || '';
        const cors = corsHeaders(origin, env);

        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: cors });
        }
        if (request.method !== 'POST') {
            return json({ error: 'POST only.' }, 405, cors);
        }

        const url = new URL(request.url);
        const endpoint = url.pathname.replace(/^\/api\//, '');
        const spec = PROMPTS[endpoint];
        if (!spec) return json({ error: 'Unknown endpoint.' }, 404, cors);

        // ---- rate limits ----
        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
        const day = new Date().toISOString().slice(0, 10);
        const ipLimit = parseInt(env.IP_DAILY_LIMIT || DEFAULTS.IP_DAILY_LIMIT, 10);
        const globalLimit = parseInt(env.GLOBAL_DAILY_LIMIT || DEFAULTS.GLOBAL_DAILY_LIMIT, 10);

        if (!(await bumpCounter(env, `g:${day}`, globalLimit))) {
            return json({ error: 'The daily AI usage limit for this tool has been reached. The rule-based features still work - try AI again tomorrow.' }, 429, cors);
        }
        if (!(await bumpCounter(env, `ip:${ip}:${day}`, ipLimit))) {
            return json({ error: 'You have reached today’s AI usage limit (' + ipLimit + ' requests). The rule-based features still work - try AI again tomorrow.' }, 429, cors);
        }

        // ---- input validation ----
        let body;
        try { body = await request.json(); } catch {
            return json({ error: 'Invalid request.' }, 400, cors);
        }
        if (endpoint === 'list-parallel' && !Array.isArray(body.items)) {
            return json({ error: 'Invalid request.' }, 400, cors);
        }
        let userMsg;
        try { userMsg = spec.build(body); } catch {
            return json({ error: 'Invalid request.' }, 400, cors);
        }
        if (!userMsg || !userMsg.trim()) return json({ error: 'Nothing to process.' }, 400, cors);
        if (userMsg.length > spec.maxChars) {
            return json({ error: 'Input too long.' }, 413, cors);
        }

        // ---- build messages ----
        const messages = [];
        if (spec.history && Array.isArray(body.history)) {
            for (const m of body.history.slice(-6)) {
                if ((m.role === 'user' || m.role === 'assistant') &&
                    typeof m.content === 'string' && m.content.length < 2000) {
                    messages.push({ role: m.role, content: m.content });
                }
            }
        }
        messages.push({ role: 'user', content: userMsg });

        // ---- retrieval (Ask endpoint): ground the answer in scraped pages ----
        let system = spec.system;
        let model = env.MODEL || DEFAULTS.MODEL;
        let sources = null;
        if (spec.retrieval) {
            model = env.ASK_MODEL || DEFAULTS.ASK_MODEL;
            const pages = retrievePages(userMsg, 3);
            sources = {};
            for (const p of pages) sources[p.u] = p.t;
            const texts = await Promise.all(pages.map(p => fetchPageText(env, p.s)));
            const extracts = texts.filter(Boolean);
            if (extracts.length > 0) {
                system += '\n\n==== STYLE MANUAL EXTRACTS ====\n\n' +
                    extracts.join('\n\n==== NEXT EXTRACT ====\n\n');
            } else {
                system += '\n\nNo Style Manual extracts matched this question. ' +
                    'Tell the user you could not find specific guidance, do not ' +
                    'answer from memory, and suggest searching ' +
                    'https://www.stylemanual.gov.au directly.';
            }
        }

        // ---- call Claude ----
        let apiRes;
        try {
            apiRes = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'x-api-key': env.ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    model,
                    max_tokens: DEFAULTS.MAX_TOKENS,
                    system,
                    messages
                })
            });
        } catch {
            return json({ error: 'Could not reach the AI service.' }, 502, cors);
        }

        if (apiRes.status === 429 || apiRes.status === 529) {
            return json({ error: 'The AI service is busy. Try again in a minute.' }, 429, cors);
        }
        if (!apiRes.ok) {
            return json({ error: 'AI service error (' + apiRes.status + ').' }, 502, cors);
        }

        const data = await apiRes.json();
        const text = (data.content || [])
            .filter(b => b.type === 'text').map(b => b.text).join('');
        if (!text) return json({ error: 'The AI returned an empty answer. Try again.' }, 502, cors);

        try {
            const result = spec.shape(text);
            if (sources) result.sources = sources;
            return json(result, 200, cors);
        } catch {
            return json({ error: 'The AI answer could not be processed. Try again.' }, 502, cors);
        }
    }
};
