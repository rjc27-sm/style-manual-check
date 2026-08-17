/**
 * Ask retrieval tests.
 *
 * The section index (im2026/worker/pages-index.js) stores only a chunk NUMBER
 * per entry. The worker re-derives chunks from the page markdown at request
 * time, so build_pages_index.py and worker.js chunkPage() must cut pages
 * identically. If they drift, the worker quietly serves the wrong text under
 * the right heading - no error, just a confidently wrong answer.
 *
 * These tests check that agreement, and that the questions from the 17 August
 * 2026 bug report retrieve the section that actually answers them.
 *
 * Run: node tests/retrieval.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..');

const toUrl = p => 'file:///' + p.split('\\').join('/');

// pages-index.js and pages-content.js are deliberately NOT in the repository:
// they hold Style Manual content, which is Crown copyright with no open
// licence. On a fresh clone they are absent, so skip rather than fail.
const generated = ['im2026/worker/pages-index.js', 'im2026/worker/pages-content.js'];
if (!generated.every(f => existsSync(join(repo, f)))) {
    console.log('Ask retrieval sources not built - skipping retrieval tests.');
    console.log('Build them with: python scrape_stylemanual.py && python build_pages_index.py');
    process.exit(0);
}

const { SECTION_INDEX } = await import(toUrl(join(repo, generated[0])));
const { PAGES } = await import(toUrl(join(repo, generated[1])));

// Pull the retrieval internals straight out of worker.js so the test cannot
// drift from the deployed logic.
const src = readFileSync(join(repo, 'im2026/worker/worker.js'), 'utf8');
const slice = (from, to) => src.slice(src.indexOf(from), src.indexOf(to));
const worker = await import('data:text/javascript;base64,' + Buffer.from(
    `export const SECTION_INDEX = ${JSON.stringify(SECTION_INDEX)};\n` +
    slice('const RETRIEVAL', '// The page text is bundled') +
    slice('const SPLIT_LIMIT', 'function buildExtracts') +
    '\nexport { retrieveSections, scoreSections, sliceSection, chunkPage, RETRIEVAL };'
).toString('base64'));

for (const name of ['retrieveSections', 'sliceSection', 'chunkPage']) {
    if (typeof worker[name] !== 'function') {
        console.log(`Could not extract ${name}() from worker.js - the slice markers ` +
            'in this test no longer match the source. Fix the markers, do not ' +
            'assume the retrieval logic is broken.');
        process.exit(1);
    }
}

let failures = 0;
const fail = msg => { console.log('  FAIL ' + msg); failures++; };
const pass = msg => console.log('  ok   ' + msg);

// ---- 1. every index entry resolves to a chunk whose heading matches ----
console.log('\nIndex and bundled content agree on chunk boundaries');
let checked = 0, missingPages = new Set();
for (const sec of SECTION_INDEX) {
    const md = PAGES[sec.s];
    if (!md) { missingPages.add(sec.s); continue; }
    const text = worker.sliceSection(md, sec.i);
    checked++;
    if (!text) { fail(`${sec.s}#${sec.i} (${sec.h}) sliced to nothing`); continue; }
    if (!sec.h) continue;                       // preamble has no heading to match
    // The stored heading is the H2, or 'H2 - H3' for a split block.
    const last = sec.h.split(' - ').pop();
    const firstLine = text.split('\n')[0].replace(/^#+\s*/, '').trim();
    if (firstLine !== last) {
        fail(`${sec.s}#${sec.i}: index says "${last}", page has "${firstLine}"`);
    }
}
if (missingPages.size) {
    fail(`${missingPages.size} indexed pages missing from pages-content.js`);
}
if (!failures) {
    pass(`${checked} chunks resolve to the heading the index recorded`);
    pass(`${Object.keys(PAGES).length} pages bundled, ` +
        `${Object.values(PAGES).reduce((n, p) => n + p.length, 0).toLocaleString()} chars`);
}

// ---- 2. the bug-report questions reach the right section ----
console.log('\nReported questions retrieve the section that answers them');
const CASES = [
    ['How do I style a nickname?', /nicknames/i],
    ['How do I reference a book?', /particulars for books/i],
    ['How do I show an act of parliament?', /Act titles is title case/i],
    ['What is plain language?', /plain language/i]
];
for (const [question, want] of CASES) {
    const picked = worker.retrieveSections(question);
    const hit = picked.findIndex(s => want.test(s.h));
    if (hit === -1) {
        fail(`"${question}" did not retrieve ${want} (got: ` +
            picked.slice(0, 3).map(s => s.h || '(intro)').join(' | ') + ')');
    } else {
        pass(`"${question}" -> ${picked[hit].h} (rank ${hit + 1} of ${picked.length})`);
    }
}

// ---- 3. the context budget is respected ----
console.log('\nContext budget');
for (const [question] of CASES) {
    const picked = worker.retrieveSections(question);
    const total = picked.reduce((n, s) => n + s.n, 0);
    if (picked.length > worker.RETRIEVAL.MAX_SECTIONS) {
        fail(`"${question}" returned ${picked.length} sections`);
    } else if (total > worker.RETRIEVAL.CHAR_BUDGET) {
        fail(`"${question}" totalled ${total} chars`);
    } else {
        pass(`"${question}": ${picked.length} sections, ${total.toLocaleString()} chars`);
    }
}

console.log(failures ? `\n${failures} failure(s)` : '\nAll retrieval tests passed');
process.exit(failures ? 1 : 0);
