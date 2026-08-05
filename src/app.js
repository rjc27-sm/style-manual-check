/**
 * Style Manual Check - app logic
 * Two modes:
 *   1. Document check - upload a .docx, review issues, download the same
 *      document with Word review comments added (formatting preserved).
 *   2. Quick text check - paste plain text for an instant check.
 * All processing happens in the browser. No data leaves the device.
 */

import { RULES, getCategories } from './rules.js';
import { AIHW_RULES } from './packs/aihw.js';
import { LIST_RULES } from './list-analysis.js';
import { loadDocx, annotateDocx } from './docx-annotate.js';

const state = {
    mode: 'document',        // 'document' | 'text'
    loaded: null,            // result of loadDocx
    fileName: '',
    fileBuffer: null,
    issues: [],
    categoryFilter: 'all',
    aihwEnabled: false
};

const $ = id => document.getElementById(id);

// ---------------- Rule running ----------------

function activeRules() {
    const base = RULES.concat(LIST_RULES);
    return state.aihwEnabled ? base.concat(AIHW_RULES) : base;
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

// Heuristic structure detection for pasted plain text
// (mirrors the behaviour of the earlier browser checker)
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
        showError('Please choose a Word document (.docx). Older .doc files are not supported - save as .docx first.');
        return;
    }
    showError('');
    $('file-name').textContent = file.name;
    $('results-section').hidden = true;
    $('download-section').hidden = true;
    setBusy(true, 'Reading document…');
    try {
        state.fileBuffer = await file.arrayBuffer();
        state.fileName = file.name;
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

async function downloadAnnotated() {
    if (!state.loaded || state.issues.length === 0) return;
    setBusy(true, 'Adding comments…');
    try {
        // Re-load from the original buffer so repeated downloads are clean
        const loaded = await loadDocx(state.fileBuffer.slice(0));
        const issues = runRules(loaded.fullText, loaded);
        const { zip, commentCount } = await annotateDocx(loaded, issues);
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

function renderResults() {
    const section = $('results-section');
    const list = $('issue-list');
    const filtered = state.issues.filter(i =>
        state.categoryFilter === 'all' || i.rule.category === state.categoryFilter);

    // Category filter options with counts
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

    const sourceText = state.mode === 'document'
        ? (state.loaded ? state.loaded.fullText : '')
        : $('text-input').value;

    list.innerHTML = filtered.map(issue => {
        const rule = issue.rule;
        const suggestion = issue.suggestion || issue.autoFix;
        const para = lineOf(sourceText, issue.position) + 1;
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
            (rule.link ? '<a class="learn-more" href="' + escapeHtml(rule.link) +
                '" target="_blank" rel="noopener">Style Manual guidance</a>' : '') +
            '</article>';
    }).join('');

    // Step numbering: the download step only exists for documents with issues
    const hasDownload = state.mode === 'document' && state.issues.length > 0;
    $('results-num').textContent = hasDownload ? '3' : '2';

    section.hidden = false;
}

function categoryLabel(c) {
    const labels = {
        'spelling': 'Spelling',
        'punctuation': 'Punctuation',
        'dates': 'Dates and time',
        'headings': 'Headings',
        'abbreviations': 'Abbreviations',
        'government': 'Government terms',
        'readability': 'Readability',
        'numbers': 'Numbers and measurements',
        'lists': 'Lists',
        'aihw': 'AIHW house style'
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

function switchMode(mode) {
    state.mode = mode;
    $('tab-document').setAttribute('aria-selected', mode === 'document');
    $('tab-text').setAttribute('aria-selected', mode === 'text');
    $('panel-document').hidden = mode !== 'document';
    $('panel-text').hidden = mode !== 'text';
    $('results-section').hidden = true;
    $('download-section').hidden = true;
    state.issues = [];
}

function init() {
    switchMode('document');
    $('tab-document').addEventListener('click', () => switchMode('document'));
    $('tab-text').addEventListener('click', () => switchMode('text'));

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

    $('download-btn').addEventListener('click', downloadAnnotated);
    $('check-text-btn').addEventListener('click', checkPastedText);

    $('category-filter').addEventListener('change', e => {
        state.categoryFilter = e.target.value;
        renderResults();
    });

    const aihwToggle = $('aihw-toggle');
    aihwToggle.addEventListener('change', () => {
        state.aihwEnabled = aihwToggle.checked;
        if (state.mode === 'document' && state.loaded) {
            state.issues = runRules(state.loaded.fullText, state.loaded);
            renderResults();
        } else if (state.mode === 'text') {
            checkPastedText();
        }
    });
    if (AIHW_RULES.length === 0) {
        aihwToggle.disabled = true;
        $('aihw-label').textContent = 'AIHW house style pack (coming soon)';
    }
}

document.addEventListener('DOMContentLoaded', init);
