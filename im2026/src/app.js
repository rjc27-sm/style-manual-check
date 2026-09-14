/**
 * Proof Positive (IM2026) - Check page logic
 * Adapted from the Style Manual Check app:
 *   1. Document check - upload a .docx, review issues, download the same
 *      document marked up: mechanical fixes as tracked changes, everything
 *      else as Word review comments (formatting preserved).
 *   2. Quick text check - paste plain text for an instant check.
 * Everything on this page runs entirely in the browser against the
 * deterministic rule engine - no model, no network, no calls to any AI
 * service. The document never leaves the browser.
 */

import { RULES } from '../../src/rules.js';
import { LIST_RULES } from '../../src/list-analysis.js';
import { loadDocx, annotateDocx } from '../../src/docx-annotate.js';
import { planTrackedChanges } from './track-plan.js';

const state = {
    mode: 'document',        // 'document' | 'text'
    loaded: null,            // result of loadDocx
    fileName: '',
    fileBuffer: null,
    issues: [],
    categoryFilter: 'all'
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
                "Check your list with Proof Positive's ";
            issue.noteLink = { text: "'Format a list' tool", url: LISTS_TOOL_URL };
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
        if (/^[•‣◦⁃∙–—\-\*\+]\s/.test(trimmed) ||
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
    return checkBuffer('sample-briefing.docx', async () => {
        const res = await fetch('assets/sample-briefing.docx');
        if (!res.ok) throw new Error('The sample could not be fetched (' + res.status + ').');
        return res.arrayBuffer();
    });
}

async function downloadAnnotated() {
    if (!state.loaded || state.issues.length === 0) return;
    setBusy(true, 'Marking up the document…');
    try {
        const loaded = await loadDocx(state.fileBuffer.slice(0));
        const issues = runRules(loaded.fullText, loaded);
        addListToolNotes(issues);
        planTrackedChanges(issues, loaded.fullText);
        const { zip, commentCount, changeCount, revisionsPresent } =
            await annotateDocx(loaded, issues, undefined,
                { author: 'Proof Positive', initials: 'PP', trackChanges: true });
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
        const parts = [];
        if (changeCount > 0) {
            parts.push(changeCount +
                (changeCount === 1 ? ' tracked change' : ' tracked changes'));
        }
        parts.push(commentCount +
            (commentCount === 1 ? ' comment' : ' comments'));
        $('download-note').textContent =
            (revisionsPresent
                ? 'Your document already contains tracked changes, so every issue was added as a comment instead. '
                : '') +
            parts.join(' and ') +
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
    'The Department of Unicorn Management will modernize signage at fifteen crossings, e.g. new rainbow palettes, following the review released on January 15, 2026.  Approx. 45 percent of sites failed the glitter-visibility test.\n\n' +
    'Key dates\n' +
    '• Round 1 opens: 15 January;\n' +
    '• round 2 opens: 1 July, and\n' +
    '• final report due: 30 June.';

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

function renderResults() {
    const section = $('results-section');
    const list = $('issue-list');
    const filtered = state.issues.filter(i =>
        state.categoryFilter === 'all' || i.rule.category === state.categoryFilter);

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
            '</div>' +
            '<p class="issue-found">‘' + escapeHtml(truncate(issue.found, 120)) + '’</p>' +
            (suggestion && suggestion !== issue.found
                ? '<p class="issue-suggestion">Suggested: ' +
                  (issue.autoFix === suggestion
                      ? '‘' + escapeHtml(truncate(suggestion, 120)) + '’'
                      : escapeHtml(truncate(suggestion, 120))) + '</p>' : '') +
            '<p class="issue-desc">' + escapeHtml(issue.description || rule.description) +
            (issue.note ? ' ' + escapeHtml(issue.note) : '') + '</p>' +
            '<div class="issue-links">' +
            (rule.link ? '<a class="learn-more" href="' + escapeHtml(rule.link) +
                '" target="_blank" rel="noopener">Style Manual guidance<span style="position:absolute;left:-9999px"> for ' +
                escapeHtml(rule.name) + ' (opens in a new tab)</span></a>' : '') +
            (rule.category === 'lists'
                ? '<a class="learn-more" href="lists.html">Fix it with the ‘Format a list’ tool</a>' : '') +
            '</div>' +
            '</article>';
    }).join('');

    const hasDownload = state.mode === 'document' && state.issues.length > 0;
    $('results-num').textContent = hasDownload ? '3' : '2';

    section.hidden = false;
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

    // ?sample in the URL runs the sample briefing check on arrival
    // (linked from the About page's toolkit card). Scroll to the sample
    // note so the description of what was checked stays in view above
    // step 2 and the results.
    if (new URLSearchParams(window.location.search).has('sample')) {
        Promise.resolve(checkSample()).then(() => {
            const note = document.querySelector('.sample-row');
            const results = $('results-section');
            const target = note || results;
            if (target && !target.hidden) target.scrollIntoView();
        });
    }
}

document.addEventListener('DOMContentLoaded', init);
