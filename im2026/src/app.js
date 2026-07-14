/**
 * Proof Positive (IM2026) - Check page logic
 * Adapted from the Style Manual Check app:
 *   1. Document check - upload a .docx, review issues, download the same
 *      document with Word review comments added (formatting preserved).
 *   2. Quick text check - paste plain text for an instant check.
 * Rule checks happen entirely in the browser.
 * New here: 'Fix with AI' on judgement-call issues. Claude drafts a rewrite,
 * then the deterministic rule engine verifies it before it is shown as clean.
 */

import { RULES } from '../../src/rules.js';
import { LIST_RULES } from '../../src/list-analysis.js';
import { loadDocx, annotateDocx } from '../../src/docx-annotate.js';
import { aiFix, AI_ENABLED, AI_NOTICE } from './ai.js';
import { verifyText, verifySummary } from './verify.js';

const state = {
    mode: 'document',        // 'document' | 'text'
    loaded: null,            // result of loadDocx
    fileName: '',
    fileBuffer: null,
    issues: [],
    categoryFilter: 'all',
    rendered: []             // issues currently rendered, index-aligned with cards
};

const $ = id => document.getElementById(id);

// ---------------- Rule running ----------------

function activeRules() {
    return RULES.concat(LIST_RULES);
}

function runRules(text, ctx) {
    const issues = [];
    for (const rule of activeRules()) {
        try {
            issues.push(...rule.check(
                text, ctx.headingLines, ctx.listLines, ctx.boldLines,
                ctx.italicLines, ctx.tableLines, ctx));
        } catch (err) {
            console.error('Rule failed: ' + rule.id, err);
        }
    }
    issues.sort((a, b) => a.position - b.position);
    return issues;
}

/** Point list issues at the Format a list tool (used in docx comments). */
const LISTS_TOOL_URL = 'https://rjc27-sm.github.io/style-manual-check/im2026/lists.html';
function addListToolNotes(issues) {
    for (const issue of issues) {
        if (issue.rule.category === 'lists') {
            issue.note = (issue.note ? issue.note + ' ' : '') +
                "You can fix the list automatically with Proof Positive's " +
                "'Format a list' tool: " + LISTS_TOOL_URL;
        }
    }
}

// Heuristic structure detection for pasted plain text
function buildHeuristicSets(text) {
    const lines = text.split('\n');
    const headingLines = new Set();
    const listLines = new Set();
    for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (!trimmed) continue;
        if (/^[•‣◦⁃∙\-\*\+]\s/.test(trimmed) ||
            /^\d+[\.\)]\s/.test(trimmed)) {
            listLines.add(i);
            continue;
        }
        const words = trimmed.split(/\s+/);
        const endsWithPunct = /[.?!;,]$/.test(trimmed);
        const isAllCaps = trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);
        if (words.length <= 12 && !endsWithPunct && !isAllCaps) {
            headingLines.add(i);
        }
    }
    return { headingLines, listLines };
}

// ---------------- Document mode ----------------

async function handleFile(file) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.docx')) {
        showError('Please choose a Word document (.docx). Older .doc files are not supported – save as .docx first.');
        return;
    }
    await checkBuffer(file.name, () => file.arrayBuffer());
}

/** Shared document pipeline: uploaded file and fetched sample both land here. */
async function checkBuffer(name, getBuffer) {
    showError('');
    $('file-name').textContent = name;
    $('results-section').hidden = true;
    $('download-section').hidden = true;
    setBusy(true, 'Reading document…');
    try {
        state.fileBuffer = await getBuffer();
        state.fileName = name;
        state.loaded = await loadDocx(state.fileBuffer.slice(0));
        state.issues = runRules(state.loaded.fullText, state.loaded);
        renderResults();
        $('download-section').hidden = state.issues.length === 0;
    } catch (err) {
        console.error(err);
        showError('Could not read that file. ' + (err.message || ''));
    } finally {
        setBusy(false);
    }
}

/** The bundled sample: a fictional briefing seeded with style issues. */
function checkSample() {
    checkBuffer('sample-briefing.docx', async () => {
        const res = await fetch('assets/sample-briefing.docx');
        if (!res.ok) throw new Error('The sample could not be fetched (' + res.status + ').');
        return res.arrayBuffer();
    });
}

async function downloadAnnotated() {
    if (!state.loaded || state.issues.length === 0) return;
    setBusy(true, 'Adding comments…');
    try {
        const loaded = await loadDocx(state.fileBuffer.slice(0));
        const issues = runRules(loaded.fullText, loaded);
        addListToolNotes(issues);
        const { zip, commentCount } = await annotateDocx(loaded, issues, undefined,
            { author: 'Proof Positive', initials: 'PP' });
        const blob = await zip.generateAsync({
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            compression: 'DEFLATE'
        });
        const outName = state.fileName.replace(/\.docx$/i, '') + ' - style check.docx';
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = outName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
        $('download-note').textContent =
            commentCount + (commentCount === 1 ? ' comment' : ' comments') +
            ' added. Open the file in Word and use the Review pane.';
    } catch (err) {
        console.error(err);
        showError('Could not create the marked-up document. ' + (err.message || ''));
    } finally {
        setBusy(false);
    }
}

// ---------------- Text mode ----------------

// Example passage for the paste tab (same fictional department as the
// sample document, trimmed to a handful of planted issues).
// Paragraphs stay on single lines: the plain-text heuristics treat each
// line as a paragraph, so a hard-wrapped line would read as a heading.
const EXAMPLE_TEXT =
    'Unicorn crossing upgrade – progress note\n\n' +
    'The Department of Unicorn Management will modernize signage at fifteen crossings, e.g. new rainbow palettes, following the review released January 15, 2026.  Approx. 45 percent of sites failed the glitter-visibility test.\n\n' +
    'Key dates\n' +
    '• Round 1 opens: 15 January;\n' +
    '• round 2 opens: 1 July, and\n' +
    '• final report due: 30 June etc.';

function loadExampleText() {
    $('text-input').value = EXAMPLE_TEXT;
    checkPastedText();
}

function checkPastedText() {
    const text = $('text-input').value;
    if (!text.trim()) {
        state.issues = [];
        renderResults();
        return;
    }
    const { headingLines, listLines } = buildHeuristicSets(text);
    state.issues = runRules(text, { headingLines, listLines });
    renderResults();
}

// ---------------- Rendering ----------------

function lineOf(text, position) {
    let line = 0;
    for (let i = 0; i < position && i < text.length; i++) {
        if (text[i] === '\n') line++;
    }
    return line;
}

function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function sourceText() {
    return state.mode === 'document'
        ? (state.loaded ? state.loaded.fullText : '')
        : $('text-input').value;
}

/** The paragraph (line) containing an issue - context for the AI rewrite. */
function passageFor(issue) {
    const text = sourceText();
    const start = text.lastIndexOf('\n', Math.max(0, issue.position - 1)) + 1;
    let end = text.indexOf('\n', issue.position);
    if (end === -1) end = text.length;
    let passage = text.slice(start, end).trim();
    if (passage.length > 800) {
        // Cap very long paragraphs around the issue itself
        const rel = issue.position - start;
        const from = Math.max(0, rel - 300);
        passage = (from > 0 ? '…' : '') +
            passage.slice(from, Math.min(passage.length, rel + 500)) +
            (rel + 500 < passage.length ? '…' : '');
    }
    return passage;
}

/** AI help is offered where there is no mechanical fix - the judgement calls. */
function aiEligible(issue) {
    return AI_ENABLED && !issue.autoFix && passageFor(issue).length >= 20;
}

function renderResults() {
    const section = $('results-section');
    const list = $('issue-list');
    const filtered = state.issues.filter(i =>
        state.categoryFilter === 'all' || i.rule.category === state.categoryFilter);
    state.rendered = filtered;

    const counts = {};
    for (const i of state.issues) {
        counts[i.rule.category] = (counts[i.rule.category] || 0) + 1;
    }
    const select = $('category-filter');
    const current = state.categoryFilter;
    select.innerHTML = '<option value="all">All categories (' +
        state.issues.length + ')</option>' +
        Object.keys(counts).sort().map(c =>
            '<option value="' + c + '">' + escapeHtml(categoryLabel(c)) +
            ' (' + counts[c] + ')</option>').join('');
    select.value = counts[current] || current === 'all' ? current : 'all';

    $('summary-line').textContent = state.issues.length === 0
        ? 'No issues found. The document follows the rules this tool checks.'
        : state.issues.length + (state.issues.length === 1 ? ' issue' : ' issues') +
          ' found across ' + Object.keys(counts).length +
          (Object.keys(counts).length === 1 ? ' category' : ' categories') + '.';

    const src = sourceText();

    list.innerHTML = filtered.map((issue, idx) => {
        const rule = issue.rule;
        const suggestion = issue.suggestion || issue.autoFix;
        const para = lineOf(src, issue.position) + 1;
        return '<article class="issue-card cat-' + escapeHtml(rule.category) + '">' +
            '<div class="issue-head">' +
            '<span class="badge">' + escapeHtml(categoryLabel(rule.category)) + '</span>' +
            '<span class="para-ref">paragraph ' + para + '</span>' +
            (aiEligible(issue) ? '<span class="ai-tag">✦ AI can draft a fix</span>' : '') +
            '</div>' +
            '<p class="issue-found">‘' + escapeHtml(truncate(issue.found, 120)) + '’</p>' +
            (suggestion && suggestion !== issue.found
                ? '<p class="issue-suggestion">Suggested: ' +
                  (issue.autoFix === suggestion
                      ? '‘' + escapeHtml(truncate(suggestion, 120)) + '’'
                      : escapeHtml(truncate(suggestion, 120))) + '</p>' : '') +
            '<p class="issue-desc">' + escapeHtml(rule.description) +
            (issue.note ? ' ' + escapeHtml(issue.note) : '') + '</p>' +
            '<div class="issue-links">' +
            (rule.link ? '<a class="learn-more" href="' + escapeHtml(rule.link) +
                '" target="_blank" rel="noopener">Style Manual guidance<span style="position:absolute;left:-9999px"> for ' +
                escapeHtml(rule.name) + ' (opens in a new tab)</span></a>' : '') +
            (rule.category === 'lists'
                ? '<a class="learn-more" href="lists.html">Fix it with the ‘Format a list’ tool</a>' : '') +
            (aiEligible(issue)
                ? '<button type="button" class="ai-ghost-btn" data-ai-fix="' + idx +
                  '">✦ Fix with AI</button>' : '') +
            '</div>' +
            '<div class="ai-slot" data-ai-slot="' + idx + '"></div>' +
            '</article>';
    }).join('');

    const hasDownload = state.mode === 'document' && state.issues.length > 0;
    $('results-num').textContent = hasDownload ? '3' : '2';

    section.hidden = false;
}

// ---------------- Fix with AI ----------------

async function handleAiFix(idx, extraGuidance) {
    const issue = state.rendered[idx];
    const slot = document.querySelector('[data-ai-slot="' + idx + '"]');
    const btn = document.querySelector('[data-ai-fix="' + idx + '"]');
    if (!issue || !slot) return;
    if (btn) btn.disabled = true;
    slot.innerHTML = '<p class="ai-busy" role="status"><span class="ai-busy-star" aria-hidden="true">✦</span> Asking Claude for a rewrite…</p>';
    try {
        const { rewrite } = await aiFix({
            passage: passageFor(issue),
            ruleName: issue.rule.name,
            ruleDescription: issue.rule.description,
            guidance: extraGuidance || ''
        });
        const check = verifyText(rewrite);
        slot.innerHTML =
            '<div class="ai-panel">' +
            '<p class="ai-panel-head">✦ AI-drafted rewrite, checked by the rule engine</p>' +
            '<div class="ai-result-text">' + escapeHtml(rewrite) + '</div>' +
            (check.clean
                ? '<p class="ai-verified" role="status">✔ ' + escapeHtml(verifySummary(check)) + '</p>'
                : '<p class="ai-reflagged" role="status">⚠ ' + escapeHtml(verifySummary(check)) + '</p>' +
                  '<ul style="margin:6px 0 0 18px;font-size:13px;color:#555a5e">' +
                  check.issues.slice(0, 5).map(i =>
                      '<li>' + escapeHtml(i.rule.name) + ': ‘' +
                      escapeHtml(truncate(i.found, 60)) + '’</li>').join('') +
                  '</ul>') +
            '<div class="ai-actions">' +
            '<button type="button" class="ai-ghost-btn" data-ai-copy="' + idx + '">Copy rewrite</button>' +
            (!check.clean
                ? '<button type="button" class="ai-ghost-btn" data-ai-revise="' + idx + '">✦ Ask AI to fix the flagged issues too</button>'
                : '<button type="button" class="ai-ghost-btn" data-ai-retry="' + idx + '">✦ Try another version</button>') +
            '</div>' +
            '<p class="ai-disclaimer">' + escapeHtml(AI_NOTICE) + '</p>' +
            '</div>';
        const copyBtn = slot.querySelector('[data-ai-copy]');
        if (copyBtn) copyBtn.addEventListener('click', async () => {
            await navigator.clipboard.writeText(rewrite);
            copyBtn.textContent = 'Copied';
            setTimeout(() => { copyBtn.textContent = 'Copy rewrite'; }, 1600);
        });
        const reviseBtn = slot.querySelector('[data-ai-revise]');
        if (reviseBtn) reviseBtn.addEventListener('click', () => {
            const flagged = check.issues.slice(0, 5).map(i =>
                i.rule.name + ' (found: "' + i.found + '")').join('; ');
            handleAiFix(idx, 'Your previous rewrite was: "' + rewrite +
                '". The rule engine flagged these remaining issues - fix them as well: ' + flagged);
        });
        const retryBtn = slot.querySelector('[data-ai-retry]');
        if (retryBtn) retryBtn.addEventListener('click', () =>
            handleAiFix(idx, 'Offer a different rewrite from: "' + rewrite + '".'));
    } catch (err) {
        slot.innerHTML = '<p class="ai-error" role="alert">' + escapeHtml(err.message) + '</p>';
    } finally {
        if (btn) btn.disabled = false;
    }
}

function categoryLabel(c) {
    const labels = {
        'spelling': 'Spelling',
        'punctuation': 'Punctuation',
        'dates-and-time': 'Dates and time',
        'headings': 'Headings',
        'abbreviations': 'Abbreviations',
        'government-terms': 'Government terms',
        'readability': 'Readability',
        'numbers-and-measurements': 'Numbers and measurements',
        'lists': 'Lists',
        'inclusive-language': 'Inclusive language',
        'accessibility': 'Accessibility',
        'links': 'Links'
    };
    return labels[c] || c.charAt(0).toUpperCase() + c.slice(1);
}

function truncate(s, n) {
    return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

function showError(msg) {
    const el = $('error-box');
    el.textContent = msg;
    el.hidden = !msg;
}

function setBusy(busy, label) {
    $('busy').hidden = !busy;
    if (label) $('busy-label').textContent = label;
}

// ---------------- Wiring ----------------

function switchMode(mode, focusTab) {
    state.mode = mode;
    const tabs = { document: $('tab-document'), text: $('tab-text') };
    for (const [m, tab] of Object.entries(tabs)) {
        tab.setAttribute('aria-selected', m === mode);
        // Roving tabindex: only the selected tab sits in the tab order;
        // arrow keys move between tabs (WAI-ARIA tabs pattern).
        tab.tabIndex = m === mode ? 0 : -1;
    }
    $('panel-document').hidden = mode !== 'document';
    $('panel-text').hidden = mode !== 'text';
    $('results-section').hidden = true;
    $('download-section').hidden = true;
    state.issues = [];
    if (focusTab) tabs[mode].focus();
}

function init() {
    switchMode('document');
    $('tab-document').addEventListener('click', () => switchMode('document'));
    $('tab-text').addEventListener('click', () => switchMode('text'));
    document.querySelector('[role="tablist"]').addEventListener('keydown', e => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
        e.preventDefault();
        const other = state.mode === 'document' ? 'text' : 'document';
        if (e.key === 'Home') switchMode('document', true);
        else if (e.key === 'End') switchMode('text', true);
        else switchMode(other, true);
    });

    const drop = $('drop-zone');
    const fileInput = $('file-input');
    drop.addEventListener('click', () => fileInput.click());
    drop.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
    });
    fileInput.addEventListener('change', () => handleFile(fileInput.files[0]));
    drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('drag'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('drag'));
    drop.addEventListener('drop', e => {
        e.preventDefault();
        drop.classList.remove('drag');
        handleFile(e.dataTransfer.files[0]);
    });

    $('sample-btn').addEventListener('click', checkSample);
    $('example-text-btn').addEventListener('click', loadExampleText);
    $('download-btn').addEventListener('click', downloadAnnotated);
    $('check-text-btn').addEventListener('click', checkPastedText);

    $('category-filter').addEventListener('change', e => {
        state.categoryFilter = e.target.value;
        renderResults();
    });

    // Delegated handler for the per-issue 'Fix with AI' buttons
    $('issue-list').addEventListener('click', e => {
        const btn = e.target.closest('[data-ai-fix]');
        if (btn) handleAiFix(Number(btn.getAttribute('data-ai-fix')));
    });
}

document.addEventListener('DOMContentLoaded', init);
