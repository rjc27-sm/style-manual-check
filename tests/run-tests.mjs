/**
 * End-to-end test for the Style Manual Check pipeline (Node).
 *
 * Usage:  npm install && node tests/run-tests.mjs tests/sample.docx
 *
 * 1. Loads the docx, extracts text and structure
 * 2. Runs all rules
 * 3. Annotates the document with Word comments
 * 4. Writes output next to the input as '<name> - annotated.docx'
 * 5. Verifies: body text unchanged, comment markers balanced,
 *    comments part well formed
 */
import fs from 'node:fs';
import JSZip from 'jszip';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { RULES } from '../src/rules.js';
import { loadDocx, annotateDocx } from '../src/docx-annotate.js';

const env = { DOMParser, XMLSerializer, JSZip };

function runRules(text, ctx) {
    const issues = [];
    for (const rule of RULES) {
        issues.push(...rule.check(
            text, ctx.headingLines, ctx.listLines, ctx.boldLines,
            ctx.italicLines, ctx.tableLines));
    }
    issues.sort((a, b) => a.position - b.position);
    return issues;
}

async function extractBodyText(buffer) {
    const zip = await JSZip.loadAsync(buffer);
    const xml = await zip.file('word/document.xml').async('string');
    const matches = xml.match(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g) || [];
    return matches.map(m => m.replace(/<[^>]+>/g, ''))
        .join('')
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&apos;/g, "'");
}

const input = process.argv[2];
if (!input) { console.error('Usage: node tests/run-tests.mjs <file.docx>'); process.exit(1); }

const buffer = fs.readFileSync(input);
const before = await extractBodyText(buffer);

const loaded = await loadDocx(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength), env);
console.log('Paragraphs:', loaded.paragraphs.length);
console.log('Headings:', [...loaded.headingLines].join(','));
console.log('Lists:', [...loaded.listLines].join(','));
console.log('Bold:', [...loaded.boldLines].join(','));
console.log('Tables:', [...loaded.tableLines].join(','));

const issues = runRules(loaded.fullText, loaded);
console.log('Issues found:', issues.length);
for (const i of issues.slice(0, 50)) {
    console.log('  -', i.rule.id, '|', JSON.stringify(i.found.slice(0, 60)),
        '->', JSON.stringify((i.suggestion || i.autoFix || '').slice(0, 60)));
}

const { zip, commentCount } = await annotateDocx(loaded, issues, env);
const out = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
const outPath = input.replace(/\.docx$/i, '') + ' - annotated.docx';
fs.writeFileSync(outPath, out);
console.log('Comments inserted:', commentCount);
console.log('Wrote:', outPath);

// ---- Verification (counts assume the input had no comments already) ----
let failures = 0;
function check(name, ok, detail) {
    console.log((ok ? 'PASS' : 'FAIL') + ' - ' + name + (detail && !ok ? ' :: ' + detail : ''));
    if (!ok) failures++;
}

const after = await extractBodyText(out);
check('body text unchanged', before === after,
    'before len ' + before.length + ', after len ' + after.length);

const outZip = await JSZip.loadAsync(out);
const docXml = await outZip.file('word/document.xml').async('string');
const starts = (docXml.match(/<w:commentRangeStart /g) || []).length;
const ends = (docXml.match(/<w:commentRangeEnd /g) || []).length;
const refs = (docXml.match(/<w:commentReference /g) || []).length;
check('comment markers balanced', starts === ends && ends === refs,
    starts + '/' + ends + '/' + refs);

const commentsXml = await outZip.file('word/comments.xml')?.async('string');
check('comments.xml exists', !!commentsXml);
if (commentsXml) {
    const parsed = new DOMParser().parseFromString(commentsXml, 'application/xml');
    const ids = Array.from(parsed.getElementsByTagName('w:comment'))
        .map(c => c.getAttribute('w:id'));
    check('comment ids unique', new Set(ids).size === ids.length);
}
const ct = await outZip.file('[Content_Types].xml').async('string');
check('content type registered', ct.includes('word/comments.xml'));
const rels = await outZip.file('word/_rels/document.xml.rels').async('string');
check('relationship registered', rels.includes('relationships/comments'));

let wellFormed = true;
try {
    new DOMParser({ onError: () => { wellFormed = false; } })
        .parseFromString(docXml, 'application/xml');
} catch { wellFormed = false; }
check('document.xml well formed', wellFormed);

process.exit(failures ? 1 : 0);
