/**
 * Tracked-changes test for the Check a document download (15 Jul 2026).
 * Runs the real modules against im2026/assets/sample-briefing.docx and
 * asserts the OOXML revision invariants:
 *   - well-formed document.xml, unique revision ids, author and ISO date
 *   - w:del holds only w:delText (xml:space preserved)
 *   - rejecting every revision reconstructs the original text exactly
 *   - accepting every revision applies every planned fix exactly
 *   - comments stay consistent and every issue is accounted for
 *   - the comments-only path (no trackChanges option) adds no revisions
 *   - input that already contains revisions falls back to comments
 *
 * Run: node tests/tracked-changes.mjs   (also part of npm test)
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import JSZip from 'jszip';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const { RULES } = await import(new URL('../src/rules.js', import.meta.url));
const { LIST_RULES } = await import(new URL('../src/list-analysis.js', import.meta.url));
const { loadDocx, annotateDocx } = await import(new URL('../src/docx-annotate.js', import.meta.url));
const { planTrackedChanges } = await import(new URL('../im2026/src/track-plan.js', import.meta.url));

const env = { DOMParser, XMLSerializer, JSZip };

let failures = 0;
function assert(cond, label) {
    if (cond) { console.log('PASS - ' + label); }
    else { failures++; console.log('FAIL - ' + label); }
}

function runRules(text, ctx) {
    const issues = [];
    for (const rule of RULES.concat(LIST_RULES)) {
        issues.push(...rule.check(
            text, ctx.headingLines, ctx.listLines, ctx.boldLines,
            ctx.italicLines, ctx.tableLines, ctx));
    }
    issues.sort((a, b) => a.position - b.position);
    return issues;
}

const localName = n => n.localName || n.nodeName.split(':').pop();

/** Paragraph texts under accept-all, reject-all or plain reading. */
function paragraphTexts(xml, mode /* 'accept' | 'reject' | 'plain' */) {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    const allP = [];
    (function collect(node) {
        for (let c = node.firstChild; c; c = c.nextSibling) {
            if (c.nodeType !== 1) continue;
            if (localName(c) === 'p') { allP.push(c); continue; }
            collect(c);
        }
    })(doc.documentElement);
    return allP.map(p => {
        let text = '';
        (function walk(node) {
            for (let c = node.firstChild; c; c = c.nextSibling) {
                if (c.nodeType !== 1) continue;
                const n = localName(c);
                if (n === 'pPr' || n === 'Fallback' || n === 'commentReference') continue;
                if (n === 'ins' && mode === 'reject') continue;
                if (n === 'del' && (mode === 'accept' || mode === 'plain')) continue;
                if (n === 't') { text += c.textContent || ''; continue; }
                if (n === 'delText') {
                    if (mode === 'reject') text += c.textContent || '';
                    continue;
                }
                if (n === 'tab' || n === 'br' || n === 'cr' || n === 'noBreakHyphen') {
                    text += (n === 'tab') ? '\t' : ' ';
                    continue;
                }
                walk(c);
            }
        })(p);
        return text;
    });
}

function elems(xml, tag) {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    const live = doc.getElementsByTagName(tag);
    const out = [];
    for (let i = 0; i < live.length; i++) out.push(live.item(i));
    return out;
}

async function annotateBuffer(buffer, options) {
    const loaded = await loadDocx(buffer.slice(0), env);
    const issues = runRules(loaded.fullText, loaded);
    if (options && options.trackChanges) {
        planTrackedChanges(issues, loaded.fullText);
    }
    const result = await annotateDocx(loaded, issues, env,
        Object.assign({ author: 'Proof Positive', initials: 'PP' }, options));
    const outBuffer = await result.zip.generateAsync({ type: 'nodebuffer' });
    return { loaded, issues, result, outBuffer };
}

const samplePath = join(ROOT, 'im2026', 'assets', 'sample-briefing.docx');
console.log('== tracked changes: ' + samplePath + ' ==');
const sample = readFileSync(samplePath);

const origZip = await JSZip.loadAsync(sample);
const origDocXml = await origZip.file('word/document.xml').async('string');

const { loaded, issues, result, outBuffer } =
    await annotateBuffer(sample, { trackChanges: true });
console.log('issues: ' + issues.length + ', tracked: ' + result.changeCount +
    ', comments: ' + result.commentCount);

const outZip = await JSZip.loadAsync(outBuffer);
const outDocXml = await outZip.file('word/document.xml').async('string');

let parseErr = null;
try {
    new DOMParser({ onError: (level, msg) => {
        if (level === 'fatalError' || level === 'error') parseErr = msg;
    } }).parseFromString(outDocXml, 'application/xml');
} catch (e) { parseErr = String(e); }
assert(!parseErr, 'document.xml well formed');

const dels = elems(outDocXml, 'w:del');
const inses = elems(outDocXml, 'w:ins');
assert(dels.length > 0 && result.changeCount === dels.length,
    'w:del count matches changeCount (' + dels.length + ')');
const revs = dels.concat(inses);
const ids = revs.map(el => el.getAttribute('w:id'));
assert(new Set(ids).size === ids.length, 'revision ids unique');
assert(revs.every(el => el.getAttribute('w:author') === 'Proof Positive'),
    'revision author set');
assert(revs.every(el => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(
    el.getAttribute('w:date') || '')), 'revision dates ISO');
assert(dels.every(d => d.getElementsByTagName('w:t').length === 0),
    'no w:t inside w:del');
assert(dels.every(d => {
    const dts = d.getElementsByTagName('w:delText');
    for (let i = 0; i < dts.length; i++) {
        if (dts.item(i).getAttribute('xml:space') !== 'preserve') return false;
    }
    return dts.length > 0;
}), 'w:delText carries xml:space');

const originalParas = paragraphTexts(origDocXml, 'plain');
const rejectParas = paragraphTexts(outDocXml, 'reject');
assert(originalParas.length === rejectParas.length &&
    originalParas.every((t, i) => t === rejectParas[i]),
    'reject-all reconstructs the original text');

const applied = issues.filter(i => i.trackApplied);
assert(applied.length === result.changeCount, 'trackApplied matches changeCount');
let expected = loaded.fullText;
for (const i of applied.slice().sort((a, b) => b.trackPlan.start - a.trackPlan.start)) {
    const p = i.trackPlan;
    expected = expected.slice(0, p.start) + p.insertText +
        expected.slice(p.start + p.deleteText.length);
}
assert(paragraphTexts(outDocXml, 'accept').join('\n') === expected,
    'accept-all applies every fix');

const commentsXml = await outZip.file('word/comments.xml').async('string');
const commentIds = elems(commentsXml, 'w:comment').map(c => c.getAttribute('w:id'));
const refIds = elems(outDocXml, 'w:commentReference').map(r => r.getAttribute('w:id'));
assert(commentIds.length === result.commentCount &&
    commentIds.length === refIds.length,
    'comments consistent (' + commentIds.length + ')');
const mergedBlocks = (commentsXml.match(/Also flagged in this text:/g) || []).length;
assert(result.changeCount + result.commentCount + mergedBlocks === issues.length,
    'every issue accounted for');

const plain = await annotateBuffer(sample, {});
const plainXml = await (await JSZip.loadAsync(plain.outBuffer))
    .file('word/document.xml').async('string');
assert(elems(plainXml, 'w:del').length === 0 &&
    elems(plainXml, 'w:ins').length === 0 && plain.result.changeCount === 0,
    'comments-only path adds no revisions');

const again = await annotateBuffer(outBuffer, { trackChanges: true });
assert(again.result.revisionsPresent === true && again.result.changeCount === 0,
    'already-tracked input falls back to comments');
const againXml = await (await JSZip.loadAsync(again.outBuffer))
    .file('word/document.xml').async('string');
assert(elems(againXml, 'w:del').length === dels.length &&
    elems(againXml, 'w:ins').length === inses.length,
    'existing revisions left untouched');

console.log(failures === 0 ? 'ALL TRACKED-CHANGES TESTS PASSED'
    : failures + ' TEST(S) FAILED');
process.exit(failures === 0 ? 0 : 1);
