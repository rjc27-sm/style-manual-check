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

import { SECTION_INDEX } from './pages-index.js';
import { PAGES } from './pages-content.js';

const DEFAULTS = {
    MODEL: 'claude-haiku-4-5',
    // Stronger model for endpoints that need real language judgement (Ask, and
    // the list formatter's type/parallel/coherence calls). ASK_MODEL is kept as
    // a backward-compatible alias.
    STRONG_MODEL: 'claude-sonnet-5',
    ASK_MODEL: 'claude-sonnet-5',
    IP_DAILY_LIMIT: 40,
    GLOBAL_DAILY_LIMIT: 500,
    MAX_TOKENS: 1024
};

// ---------------- retrieval over the scraped Style Manual ----------------
// The Ask feature answers from the actual scraped page content, not model
// memory. pages-index.js holds a keyword index of SECTIONS (H2 blocks) of the
// scraped pages; the page text itself is served as static files alongside the
// site and fetched (with edge caching) per question, then sliced.
//
// This was page-level until 17 August 2026. Two user-reported faults came from
// that: asked how to reference a book, the model read the whole Author-date
// page and said it held no book example (it has a section of them); and 'how
// do I style a nickname?' retrieved nothing, because a word that appeared only
// in a page's body scored 1 against a threshold of 3 and could never pull the
// page in on its own. Sections are small enough to send several, and a section
// heading is a much sharper match than a page title.

const RETRIEVAL = {
    MAX_SECTIONS: 10,     // most sections sent for one question
    CHAR_BUDGET: 45000,   // total extract characters per question
    MIN_SCORE: 8,         // below this, a section is not relevant enough to send
    HINT_WEIGHT: 0.4      // weight of query-expansion terms against the asked words
};

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
    [/\bitalics?\b|\bitalicis/i, 'italics'],
    // 'that' versus 'which'. Both words are STOPWORDS, and so are 'when', 'do',
    // 'i', 'use' and 'and' - so 'When do I use which and when do I use that?'
    // tokenised to NOTHING, scored nothing, and Ask said the guidance did not
    // exist (reported 17 August 2026). The expansion runs on the raw question,
    // before tokenising, so it can still see the words the tokeniser drops.
    [/\bthat\b(?=[\s\S]*\bwhich\b)|\bwhich\b(?=[\s\S]*\bthat\b)|\b(?:non-?essential|restrictive|defining) clause/i,
        'commas essential non-essential clauses relative pronouns'],
    // Ordinals: a question phrased as '1st' or 'first' never contains the word
    // the pages actually use, and 'first' on its own ranks First Nations and
    // 'family name first' far above it.
    [/\b\d+(?:st|nd|rd|th)\b|\bordinals?\b/i, 'ordinal numbers']
];

function tokenise(s) {
    return s.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ')
        .split(/[\s-]+/)
        .filter(w => (w.length > 2 || KEEP_SHORT.has(w)) && !STOPWORDS.has(w));
}

// The expansion terms are a hint about the topic, not part of the question, so
// they are returned separately and scored lower. Mixing them in at full weight
// buried the answer: 'How do I reference a book?' expands to 'author date
// referencing', and every section with 'author' or 'date' in its heading then
// outranked 'Give particulars for books ...', which is the section holding the
// book examples. It came 16th.
function expandQuery(question) {
    let extra = '';
    for (const [pattern, terms] of EXPANSIONS) {
        if (pattern.test(question)) extra += ' ' + terms;
    }
    return extra.trim();
}

// Match whole words, not substrings. Substring matching made 'act' hit
// 'practice', 'contact' and 'characters', so the word was everywhere, counted
// for nothing, and a question about Acts of parliament was answered from the
// forms-of-address pages. Simple plurals still match, so 'book' finds 'books'.
function matches(tokens, word) {
    return tokens.has(word) || tokens.has(word + 's') || tokens.has(word + 'es') ||
        (word.endsWith('s') && tokens.has(word.slice(0, -1)));
}

const tokenCache = new WeakMap();
function fieldTokens(sec) {
    let fields = tokenCache.get(sec);
    if (!fields) {
        fields = {
            h: new Set(tokenise(sec.h)),
            t: new Set(tokenise(sec.t)),
            k: new Set(sec.k.split(' '))
        };
        tokenCache.set(sec, fields);
    }
    return fields;
}

// How discriminating a word is, measured over the index we already hold in
// memory. Without this, a question's common words drown its rare ones: 'How do
// I reference a book?' put 'reference' (in 43 section headings) on equal terms
// with 'book' (in 7), and the section of book examples came 11th - just outside
// the cut, which is exactly the answer the user was told did not exist.
const dfCache = new Map();
function docFreq(word) {
    let df = dfCache.get(word);
    if (df === undefined) {
        df = 0;
        for (const sec of SECTION_INDEX) {
            const fields = fieldTokens(sec);
            if (matches(fields.h, word) || matches(fields.k, word)) df++;
        }
        dfCache.set(word, df);
    }
    return df;
}

function idf(word) {
    return Math.log(SECTION_INDEX.length / (1 + docFreq(word)));
}

function scoreSections(question) {
    const asked = new Set(tokenise(question));
    const hinted = new Set();
    for (const w of tokenise(expandQuery(question))) {
        if (!asked.has(w)) hinted.add(w);
    }
    // Hints are normally kept subordinate so they cannot bury the asked words.
    // When the question tokenises to NOTHING - every word a stopword, as in
    // 'When do I use which and when do I use that?' - there are no asked words
    // to bury, and holding the hints at 0.4 just leaves the question scoring
    // nothing at all. So they carry full weight in that case.
    const hintWeight = asked.size ? RETRIEVAL.HINT_WEIGHT : 1;
    const terms = [...[...asked].map(w => [w, 1]),
                   ...[...hinted].map(w => [w, hintWeight])]
        .map(([w, weight]) => [w, weight * Math.max(idf(w), 0.2)]);

    const scored = [];
    for (const sec of SECTION_INDEX) {
        const fields = fieldTokens(sec);
        let score = 0;
        for (const [w, weight] of terms) {
            // The keyword blob now holds only terms that are rare across the
            // corpus, so a keyword hit is real evidence rather than noise.
            let field = 0;
            if (matches(fields.h, w)) field += 5;
            if (matches(fields.k, w)) field += 3;
            if (matches(fields.t, w)) field += 2;
            if (sec.u.includes(w)) field += 1;
            score += field * weight;
        }
        if (score >= RETRIEVAL.MIN_SCORE) scored.push([score, sec]);
    }
    scored.sort((a, b) => b[0] - a[0]);
    return scored;
}

// Known limit: an off-topic question still retrieves its least-bad matches,
// because its filler words hit something ('best' appears in 18 headings). A
// score threshold was tried and dropped - genuine questions score 38 to 107 and
// off-topic ones 27 to 33, too close to separate without refusing real
// questions. The Ask prompt already handles it: it answers only style questions
// and says plainly when the extracts do not cover what was asked.
function retrieveSections(question) {
    const scored = scoreSections(question);
    const picked = [];
    let used = 0;
    for (const [, sec] of scored) {
        if (picked.length >= RETRIEVAL.MAX_SECTIONS) break;
        if (used + sec.n > RETRIEVAL.CHAR_BUDGET && picked.length) continue;
        picked.push(sec);
        used += sec.n;
    }
    return picked;
}

// The page text is bundled into the Worker (pages-content.js). It used to be
// fetched from the published im2026/pages/ folder, which made the public repo
// a browsable copy of the Style Manual. The manual carries no open licence, so
// on 17 August 2026 the corpus moved in here: still used to answer questions,
// no longer republished. It also removes a failure mode, since the index and
// the text it numbers can no longer be deployed out of step.
function pageText(slug) {
    return PAGES[slug] || null;
}

// Cut a page into the same flat list of chunks that build_pages_index.py
// numbered: chunk 0 is the preamble, then each H2 block, with any H2 block over
// SPLIT_LIMIT split again at its H3 headings. The two must agree exactly - the
// index stores only a chunk number, so a mismatch silently serves the wrong
// text. tests/retrieval.test.mjs checks them against each other.
const SPLIT_LIMIT = 6000;

function chunkPage(md) {
    const start = md.indexOf('\n# ');
    const body = start === -1 ? md : md.slice(start + 3);
    const parts = body.split(/^## /m);
    const chunks = [parts[0]];
    for (let i = 1; i < parts.length; i++) {
        const text = '## ' + parts[i];
        if (text.length <= SPLIT_LIMIT) { chunks.push(text); continue; }
        const subs = text.split(/^### /m);
        chunks.push(subs[0]);
        for (let j = 1; j < subs.length; j++) chunks.push('### ' + subs[j]);
    }
    return chunks;
}

function sliceSection(md, i) {
    const chunk = chunkPage(md)[i];
    return chunk ? chunk.trim() : null;
}

function buildExtracts(sections) {
    const out = [];
    for (const sec of sections) {
        const md = pageText(sec.s);
        if (!md) continue;
        const text = sliceSection(md, sec.i);
        if (!text) continue;
        out.push(`Page: ${sec.t}\nSection: ${sec.h || '(introduction)'}\n` +
            `Source: ${sec.u}\n\n${text}`);
    }
    return out;
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

// Shared by the 'plain' and 'ask' prompts, which both write lists in their
// answers. It was duplicated in both and drifted; one constant keeps them
// in step. Expanded 17 August 2026 after a user reported fragment lists
// coming back with a full stop on every item - the rule was already stated
// and the model was not following it, so it now names the mistake and shows
// a worked example, including the proper-noun case that broke the nickname
// answer ('Blocker' keeps its capital but still takes no full stop).
const LIST_CONVENTIONS = `- Follow the Style Manual's own list conventions in every list you write.
  Write the lead-in as a plain line ending in a colon. Before punctuating a
  list, DECIDE which of the two kinds it is, then apply that kind to EVERY
  item in it. Never mix them.
  Decide like this: would each item read as a complete sentence on its own?
  An instruction or a command counts as a complete sentence, because the
  subject 'you' is implied. 'Start each item with a capital letter' and
  'Capitalise proper nouns' are complete sentences, not fragments.
  1. SENTENCE list - every item is a complete sentence, including any
     instruction, rule or step. Start each item with a capital letter and end
     EVERY item with a full stop. That capital is sentence capitalisation, so
     it applies whatever the first word is - an ordinary noun, a term you are
     defining, or a term you are putting in bold. The 'minimal capitals' rule
     governs words INSIDE a sentence, never the first letter of one:
         - Start each item with a capital letter.
         - End every item with a full stop.
         - **Essential** information still takes a capital, despite the bold.
  2. FRAGMENT list - the items are phrases that could not stand alone as
     sentences. Start each item with a lower-case letter and put a full stop
     after the LAST item only, with no punctuation on any other item:
         - state and territory governments
         - local councils
         - non-government organisations.
     An item beginning with a proper noun keeps its capital, but that does
     NOT change the punctuation:
         - 'Big Australia' (a population policy)
         - 'the Lucky Country' (a book by Donald Horne)
         - 'the Top End' (northern Australia).
  3. STAND-ALONE list - the items are words or short phrases sitting under a
     heading or a label such as 'Examples:', and they do not complete it
     grammatically. Start each item with a capital letter and use NO full
     stop on any item, not even the last one:
         - Canberra
         - Melbourne
         - Perth
  Check for all three of these mistakes before you answer: a full stop on
  every item of a fragment list; a single closing full stop on a list whose
  items are really sentences or instructions; and a fragment list left with
  no closing full stop at all.`;

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

    'list-format': {
        system: `You prepare list items for 'Proof Positive', an Australian Government
Style Manual tool. The user gives a lead-in (or heading) and some rough list
items. You decide the list type, rewrite the items so they read well and are
parallel, and report what you changed. A deterministic formatter then applies
the markers, capitals and full stops - so you must NOT add bullets, numbers or
end punctuation yourself.
${AU_STYLE_CORE}

DECIDE THE TYPE - look at the ITEMS first, then the lead-in:
- Decide the type from the items AS THE USER TYPED THEM, before you rewrite
  anything. Then rewrite the items to suit the type you chose. Never rewrite
  items into a different grammatical form in order to justify a different
  type, and never level a list DOWN to phrases to match its least complete
  item - bring the weaker items UP instead. If one item is a bare noun phrase
  ('Budget review') among commands, add the verb it is missing.
- The first line's punctuation decides NOTHING about the type. A first line
  with no colon and no full stop is usually just a lead-in whose colon the
  user did not type. Never read it as a heading in order to choose
  "standAlone".
- If each item is (or should be) a complete sentence, the type is "sentence" -
  whether the first line is a sentence lead-in, a phrase lead-in or just a
  plain heading. Complete sentences are always a sentence list.
- In Style Manual style, a phrase lead-in ending in a colon is fully compatible
  with a sentence list. Never convert complete sentences into fragments merely
  to match a phrase lead-in. First check whether every item is a complete
  sentence - if it is, the type is "sentence", and you format it as one.
- Instructions and commands to the reader ("Choose the days...", "Enter your
  name") are complete imperative sentences - the subject "you" is implied. So
  a list of steps, instructions or rules is a sentence list; do NOT apply the
  fragment test to it. EXCEPTION: if the lead-in names who acts ("Participants
  will:", "You must:"), the items complete that lead-in and are fragments.
- If the items are fragments (phrases that are not complete sentences):
  - If there is a lead-in they complete, apply the fragment test: attach each
    item to the lead-in; if the result is a complete, grammatical sentence, the
    type is "fragment".
  - If there is only a heading and nothing for the fragments to complete, the
    type is "standAlone".
- Use "standAlone" ONLY when the items AS TYPED are all words or short noun
  phrases with no verb doing work - a list of names, places, categories,
  documents or reference types. If any item as typed is a sentence or a
  command, the list is not "standAlone".

REWRITE THE ITEMS:
- Make every item follow the same grammatical pattern: the same word type to
  start, the same tense, the same kind of phrase or sentence. Prefer the form
  most items already use, and change as little as possible.
- Keep the author's meaning and terminology. Never invent facts, names or
  detail that are not in the items.
- If the same word or words start every item, move them into the lead-in
  instead, so long as the lead-in still reads naturally.
- Capitalisation is your judgement call. For a "fragment" list, start each item
  with a lower-case letter UNLESS it begins with a proper noun (a name, place,
  organisation, program or title), which keeps its capital. For "sentence" and
  "standAlone" lists the formatter will capitalise the first letter, so case
  does not matter there.
- Do not add a full stop, semicolon, comma, bullet or number to any item.

MULTILEVEL LISTS:
- The user message may mark each item with its level: "0:" for a first-level
  item, "1:" for a sub-item, "2:" for a rare third level.
- Keep every item at its given level and in its given order. Do not merge,
  split, promote or demote items - return exactly one rewritten item per
  input item.
- Make the items at each level parallel with their siblings at that level.
- A first-level item that introduces sub-items may end in a colon; keep it.
- When levels are given, reply with items as objects:
  "items":[{"text":"rewritten item","level":0}, ...]

COHERENCE:
- If the items do not belong together as one list, are nonsense, or cannot be
  made parallel without inventing content, set "coherent" to false and explain
  plainly in "note" what the problem is. Still return your best-effort items.
- Otherwise set "coherent" to true and "note" to "".

Reply with ONE JSON object and nothing else:
{"type":"sentence|fragment|standAlone","leadIn":"the cleaned lead-in or heading",
"items":["rewritten item","..."],"changes":["short plain-English note of each
change you made"],"coherent":true,"note":""}
Keep "changes" short and user-facing (for example "Made every item start with a
verb" or "Moved 'the committee will' into the lead-in"). Use an empty array if
you changed nothing.`,
        build(body) {
            const items = (body.items || []).map(s => String(s)).filter(s => s.trim());
            const levels = Array.isArray(body.levels) && body.levels.length ? body.levels : null;
            const itemLines = levels
                ? items.map((s, i) =>
                    `${Math.max(0, Math.min(2, parseInt(levels[i], 10) || 0))}: ${s}`)
                : items;
            return (body.forcedType ? `Requested type: ${body.forcedType}\n` : '') +
                `Lead-in or heading: ${body.leadIn || '(none given)'}\n` +
                `Items${levels ? ' (each marked with its level)' : ''}:\n${itemLines.join('\n')}`;
        },
        maxChars: 4000,
        // Multilevel answers return every item as a {text, level} object plus
        // change notes - roughly double a flat answer. 1,500 tokens truncated
        // the JSON on long lists (AEC list, 28 July 2026), which surfaced as
        // 'AI briefly unavailable' after the shape() parse failed.
        maxTokens: 3500,
        strong: true,
        shape(r) {
            const match = r.match(/\{[\s\S]*\}/);
            if (!match) throw new Error('no-json');
            const p = JSON.parse(match[0]);
            const raw = Array.isArray(p.items) ? p.items : [];
            // Multilevel answers carry items as {text, level} objects; flat
            // answers as plain strings. Normalise to items + optional levels.
            let items, levels = null;
            if (raw.length && typeof raw[0] === 'object' && raw[0] !== null) {
                const objs = raw
                    .map(o => ({
                        text: String((o && o.text) || '').trim(),
                        level: Math.max(0, Math.min(2, parseInt(o && o.level, 10) || 0))
                    }))
                    .filter(o => o.text);
                items = objs.map(o => o.text);
                levels = objs.map(o => o.level);
            } else {
                items = raw.map(s => String(s).trim()).filter(Boolean);
            }
            if (!items.length) throw new Error('no-items');
            const type = ['sentence', 'fragment', 'standAlone'].includes(p.type)
                ? p.type : 'sentence';
            return {
                type,
                leadIn: String(p.leadIn || ''),
                items,
                levels,
                changes: Array.isArray(p.changes)
                    ? p.changes.map(s => String(s).trim()).filter(Boolean) : [],
                coherent: p.coherent !== false,
                note: String(p.note || '')
            };
        }
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
pages format is '172–188'.
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
- Keep the structure the input already has. If the input has headings, keep
  them as '## heading text'. If it has bullet points, keep them as '- item'
  lines. Preserve any bold ('**text**'), italics ('*text*') and links
  ('[text](https://...)') that the input contains.
- Do not invent structure that was not there: do not add headings, bullets,
  bold, italics or links to plain prose that had none. Prose stays as
  paragraphs.
- Use a '- ' dash list only where the input already used a list, or where a
  list genuinely helps the reader.
${LIST_CONVENTIONS}
  No nested lists.
- Your output will be re-checked by a deterministic rule engine.
- Reply with the rewritten text only, in this markdown. No preamble, no
  explanation.
- Then write a line containing exactly ---WHAT CHANGED--- and, after it, 3 to
  5 short notes on what you changed about the wording, one per line, each
  starting '- '. Write them for the person who pasted the text: name the
  change, not the rule. For example '- Replaced 'pursuant to' with 'under''
  or '- Split a 42-word sentence into three'. Always put wording you are
  quoting from the original inside single quotation marks. Keep each note to
  one line.`,
        build(body) { return body.passage; },
        // 900 words of dense government prose is about 7,300 characters before
        // any markup, and pasted Word content adds links and bold on top. At
        // 6,000 the page refused passages well inside the 900 words it
        // advertises (reported 17 August 2026). Keep this equal to
        // PLAIN_MAX_CHARS in plain.html.
        maxChars: 9000,
        // The rewrite of a 900-word passage plus its change notes runs well past
        // the 1,024-token default, which truncated long rewrites mid-sentence.
        maxTokens: 3000,
        // The notes come after a sentinel line rather than inside JSON: a long
        // rewrite that outgrew a JSON envelope would fail to parse and surface as
        // 'AI briefly unavailable' (the list-format trap, 28 July 2026). A missing
        // sentinel just means no notes.
        shape(r) {
            const parts = r.split(/^\s*-{2,}\s*WHAT CHANGED\s*-{2,}\s*$/mi);
            return {
                rewrite: (parts[0] || r).trim(),
                changes: (parts[1] || '').split('\n')
                    .map(l => l.replace(/^\s*[-•*]\s*/, '').trim())
                    .filter(Boolean).slice(0, 5)
            };
        }
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
- Format simply: short paragraphs and '- ' for list items. No headings, no
  tables, no nested lists. Use **bold** only for the key term or correct
  form - never bold a list lead-in, a label or a whole line.
${LIST_CONVENTIONS}
- Prefer one simple list with a colon lead-in. Do not split an answer into
  several sub-headed groups of bullets; if grouping is unavoidable, each
  group is a complete list in its own right - punctuate its items by the
  same rules above (a group of instructions or rules is a sentence list, so
  every item ends with a full stop).
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
        strong: true,
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

        // Check the per-IP cap FIRST: a caller who is over their own limit
        // must not keep draining the shared global budget with refused requests.
        if (!(await bumpCounter(env, `ip:${ip}:${day}`, ipLimit))) {
            return json({ error: 'You have reached today’s AI usage limit (' + ipLimit + ' requests). The rule-based features still work; try AI again tomorrow.' }, 429, cors);
        }
        if (!(await bumpCounter(env, `g:${day}`, globalLimit))) {
            return json({ error: 'The daily AI usage limit for this tool has been reached. The rule-based features still work; try AI again tomorrow.' }, 429, cors);
        }

        // ---- input validation ----
        let body;
        try { body = await request.json(); } catch {
            return json({ error: 'Invalid request.' }, 400, cors);
        }
        if (endpoint === 'list-format' && !Array.isArray(body.items)) {
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
        // Judgement-heavy endpoints (spec.strong) use the stronger model; the
        // rest use the cheaper default.
        let model = spec.strong
            ? (env.STRONG_MODEL || env.ASK_MODEL || DEFAULTS.STRONG_MODEL)
            : (env.MODEL || DEFAULTS.MODEL);
        let sources = null;
        if (spec.retrieval) {
            const sections = retrieveSections(userMsg);
            sources = {};
            for (const s of sections) sources[s.u] = s.t;
            const extracts = buildExtracts(sections);
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
                    max_tokens: spec.maxTokens || DEFAULTS.MAX_TOKENS,
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
