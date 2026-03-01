/*
 * Style Manual Check - Word Add-in
 * Checks documents against the Australian Government Style Manual
 */

/* global document, Office, Word */

import { checkText, getCategories } from '../rules.js';

// State
let allIssues = [];
let fixedCount = 0;
let changesSinceLastScan = 0;
let currentFilter = 'all';
let ignoredRuleIds = new Set(); // Rule IDs the user has chosen to ignore for this session

// DOM elements cache
const elements = {};

// Initialise when Office is ready
Office.onReady((info) => {
    if (info.host === Office.HostType.Word) {
        // Cache DOM elements
        elements.sideloadMsg = document.getElementById('sideload-msg');
        elements.appBody = document.getElementById('app-body');
        elements.scanBtn = document.getElementById('scan-btn');
        elements.status = document.getElementById('status');
        elements.summary = document.getElementById('summary');
        elements.issuesCount = document.getElementById('issues-count');
        elements.fixedCount = document.getElementById('fixed-count');
        elements.filterContainer = document.getElementById('filter-container');
        elements.categoryFilter = document.getElementById('category-filter');
        elements.issuesList = document.getElementById('issues-list');
        elements.rescanBanner = document.getElementById('rescan-banner');

        // Show app, hide loading
        elements.sideloadMsg.style.display = 'none';
        elements.appBody.style.display = 'block';

        // Set up event handlers
        elements.scanBtn.onclick = scanDocument;
        elements.categoryFilter.onchange = () => {
            currentFilter = elements.categoryFilter.value;
            displayResults();
        };

        // Hide status initially (no message needed)
        elements.status.style.display = 'none';
    }
});

// Scan the document for style issues
async function scanDocument() {
    elements.scanBtn.disabled = true;
    elements.scanBtn.textContent = 'Checking...';
    elements.status.textContent = 'Scanning document...';
    elements.status.className = 'status';

    try {
        await Word.run(async (context) => {
            // Get all paragraphs from the document to preserve paragraph boundaries
            const paragraphs = context.document.body.paragraphs;
            paragraphs.load('items');
            await context.sync();

            // Load text, style, and list info for each paragraph
            let fullText = '';
            for (let i = 0; i < paragraphs.items.length; i++) {
                paragraphs.items[i].load('text,style,isListItem');
            }
            await context.sync();

            // Join paragraphs with newlines to preserve boundaries
            const paragraphTexts = paragraphs.items.map(p => p.text);
            fullText = paragraphTexts.join('\n');

            // Build a set of line indices that have a Word heading style applied
            const headingLines = new Set();
            // Build a set of line indices that are list items (bullets/numbered)
            const listLines = new Set();
            for (let i = 0; i < paragraphs.items.length; i++) {
                const para = paragraphs.items[i];
                const style = (para.style || '').toLowerCase();
                if (style.startsWith('heading') || style.startsWith('title') || style.startsWith('subtitle')) {
                    headingLines.add(i);
                }
                // Check if paragraph is a list item
                if (para.isListItem) {
                    listLines.add(i);
                }
            }

            // Run style checks
            allIssues = checkText(fullText, headingLines, listLines);

            // Filter out rules the user has chosen to ignore for this session
            if (ignoredRuleIds.size > 0) {
                allIssues = allIssues.filter(i => !ignoredRuleIds.has(i.rule.id));
            }

            // Assign IDs and calculate occurrence indices for navigation
            allIssues.forEach((issue, i) => {
                issue.id = 'issue-' + i;
                // Count how many times the search text appears before this position
                // This tells us which occurrence to select in goToIssue
                // Use searchText if available (for long text), otherwise found
                const textToFind = issue.searchText || issue.found;
                const textBefore = fullText.substring(0, issue.position);
                const escapedFound = textToFind.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const matches = textBefore.match(new RegExp(escapedFound, 'gi'));
                issue.occurrenceIndex = matches ? matches.length : 0;
            });

            // Reset counts for new scan
            fixedCount = 0;
            changesSinceLastScan = 0;

            // Update UI
            populateFilterDropdown();
            displayResults();
        });
    } catch (error) {
        elements.status.textContent = 'Error: ' + error.message;
        elements.status.className = 'status error';
        console.error('Scan error:', error);
    }

    elements.scanBtn.disabled = false;
    elements.scanBtn.textContent = 'Check document';
}

// Populate the category filter dropdown
function populateFilterDropdown() {
    const categories = getCategories();
    const categoryNames = {
        'spelling': 'Spelling',
        'punctuation': 'Punctuation',
        'dates-and-time': 'Dates and time',
        'headings': 'Headings',
        'government-terms': 'Government terms',
        'readability': 'Readability',
        'numbers-and-measurements': 'Numbers and measurements',
        'lists': 'Lists',
        'abbreviations': 'Abbreviations'
    };

    // Clear existing options except 'All issues'
    elements.categoryFilter.innerHTML = '<option value="all">All issues</option>';

    // Add category options (alphabetised)
    const sortedCategories = categories.sort((a, b) => {
        const nameA = categoryNames[a] || a;
        const nameB = categoryNames[b] || b;
        return nameA.localeCompare(nameB);
    });

    for (const cat of sortedCategories) {
        const issuesInCat = allIssues.filter(i => i.rule.category === cat).length;
        if (issuesInCat > 0) {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = (categoryNames[cat] || cat) + ' (' + issuesInCat + ')';
            elements.categoryFilter.appendChild(option);
        }
    }
}

// Display results in the UI
function displayResults() {
    // Filter issues
    const filteredIssues = currentFilter === 'all'
        ? allIssues
        : allIssues.filter(i => i.rule.category === currentFilter);

    // Update status
    if (allIssues.length === 0) {
        elements.status.textContent = 'Check complete.';
        elements.status.className = 'status success';
        elements.summary.style.display = 'none';
        elements.filterContainer.style.display = 'none';
    } else {
        elements.status.textContent = allIssues.length + ' issue' + (allIssues.length !== 1 ? 's' : '') + ' found.';
        elements.status.className = 'status';
        elements.summary.style.display = 'flex';
        elements.filterContainer.style.display = 'flex';
    }

    // Update counts
    elements.issuesCount.textContent = allIssues.length;
    elements.fixedCount.textContent = fixedCount;

    // Show rescan banner after 3+ fixes since last scan
    if (changesSinceLastScan >= 5 && allIssues.length > 0) {
        elements.rescanBanner.style.display = 'block';
    } else {
        elements.rescanBanner.style.display = 'none';
    }

    // Render issue cards
    elements.issuesList.innerHTML = '';

    for (const issue of filteredIssues) {
        const card = createIssueCard(issue);
        elements.issuesList.appendChild(card);
    }
}

// Create an issue card element
function createIssueCard(issue) {
    const card = document.createElement('div');
    card.className = 'issue-card ' + issue.rule.category;
    card.id = issue.id;

    // Check if this issue has autoFix
    const canAutoFix = issue.autoFix !== undefined;

    // Check for watch word replacements (suggestion contains alternatives)
    const hasReplacements = issue.replacements && issue.replacements.length > 0;

    // Count how many fixable issues of the same type exist (for Fix all)
    const fixableOfType = allIssues.filter(i => i.rule.id === issue.rule.id && i.autoFix !== undefined);
    const sameTypeCount = fixableOfType.length;
    // Count all issues of this type (for Ignore all)
    const totalOfType = allIssues.filter(i => i.rule.id === issue.rule.id).length;

    // Build card HTML
    let html = `
        <div class="issue-header">
            <span class="issue-rule">${escapeHtml(issue.rule.name)}</span>
        </div>
        <div class="issue-text">
            <span class="found-text">${escapeHtml(issue.found)}</span>
            <span class="issue-arrow">\u2192</span>
            <span class="suggestion-text">${escapeHtml(issue.suggestion)}</span>
        </div>
        <div class="issue-description">
            ${escapeHtml(issue.description || issue.rule.description)}
            ${issue.rule.link ? `<button class="link-learn" data-action="openlink" data-url="${issue.rule.link}">Learn more \u2192</button>` : ''}
        </div>
        <div class="issue-actions">
    `;

    if (canAutoFix) {
        html += `<button class="btn btn-accept" data-action="accept" data-id="${issue.id}">Accept</button>`;
    } else if (hasReplacements) {
        // For watch words, add "Use [first option]" button
        html += `<button class="btn btn-accept" data-action="usereplacement" data-id="${issue.id}" data-index="0">Use '${escapeHtml(issue.replacements[0])}'</button>`;
    }
    html += `<button class="btn btn-ignore" data-action="ignore" data-id="${issue.id}">Ignore</button>`;
    html += `<button class="btn btn-goto" data-action="goto" data-id="${issue.id}">Go to issue</button>`;

    // Add "Fix all" button if there are multiple fixable instances of this rule type
    if (canAutoFix && sameTypeCount > 1) {
        html += `<button class="btn btn-fix-all" data-action="fixall" data-ruleid="${issue.rule.id}">Fix all ${sameTypeCount}</button>`;
    }
    // Add "Ignore all" button if there are multiple instances of this rule type
    if (totalOfType > 1) {
        html += `<button class="btn btn-ignore-all" data-action="ignoreall" data-ruleid="${issue.rule.id}">Ignore all ${totalOfType}</button>`;
    }

    html += '</div>';
    card.innerHTML = html;

    // Attach event handlers
    card.querySelectorAll('button[data-action]').forEach(btn => {
        btn.onclick = () => handleAction(btn.dataset.action, btn.dataset.id, btn.dataset.ruleid, btn.dataset.index, btn.dataset.url);
    });

    return card;
}

// Handle button actions
async function handleAction(action, issueId, ruleId, replacementIndex, url) {
    switch (action) {
        case 'accept':
            const issue = allIssues.find(i => i.id === issueId);
            if (issue) await acceptFix(issue);
            break;
        case 'usereplacement':
            const replIssue = allIssues.find(i => i.id === issueId);
            if (replIssue) await useReplacement(replIssue, parseInt(replacementIndex || '0'));
            break;
        case 'ignore':
            ignoreIssue(issueId);
            break;
        case 'goto':
            const goToIssue2 = allIssues.find(i => i.id === issueId);
            if (goToIssue2) await goToIssue(goToIssue2);
            break;
        case 'fixall':
            await fixAllOfType(ruleId);
            break;
        case 'ignoreall':
            ignoreAllOfType(ruleId);
            break;
        case 'openlink':
            if (url) Office.context.ui.openBrowserWindow(url);
            break;
    }
}

// Find the next issue to navigate to after removing the given issue IDs from the visible list
function getNextIssue(removedIds) {
    const idSet = new Set(Array.isArray(removedIds) ? removedIds : [removedIds]);
    const filtered = currentFilter === 'all'
        ? allIssues
        : allIssues.filter(i => i.rule.category === currentFilter);
    const currentIndex = filtered.findIndex(i => idSet.has(i.id));
    const remaining = filtered.filter(i => !idSet.has(i.id));
    if (remaining.length === 0) return null;
    return remaining[Math.min(Math.max(currentIndex, 0), remaining.length - 1)];
}

// Accept a fix and apply it to the document
async function acceptFix(issue) {
    if (issue.autoFix === undefined) return;

    const nextIssue = getNextIssue(issue.id);

    try {
        await Word.run(async (context) => {
            // Search for the found text
            const searchResults = context.document.body.search(issue.found, {
                matchCase: true,
                matchWholeWord: false
            });
            searchResults.load('items');
            await context.sync();

            if (searchResults.items.length > 0) {
                // Replace the correct occurrence based on stored index
                const idx = issue.occurrenceIndex || 0;
                const targetIdx = Math.min(idx, searchResults.items.length - 1);
                const targetRange = searchResults.items[targetIdx];

                if (issue.applyHeadingStyle) {
                    // Load the paragraph so we can apply a heading style after the text fix
                    const paras = targetRange.paragraphs;
                    paras.load('items');
                    await context.sync();

                    targetRange.insertText(issue.autoFix, Word.InsertLocation.replace);
                    paras.items[0].style = 'Heading 2';
                } else {
                    targetRange.insertText(issue.autoFix, Word.InsertLocation.replace);
                }
                await context.sync();

                // Remove from issues and update display
                allIssues = allIssues.filter(i => i.id !== issue.id);
                fixedCount++;
                changesSinceLastScan++;
                displayResults();
            }
        });
    } catch (error) {
        console.error('Error applying fix:', error);
        elements.status.textContent = 'Error applying fix: ' + error.message;
        elements.status.className = 'status error';
    }

    // Auto-navigate to the next issue if the fix was applied
    if (nextIssue && !allIssues.some(i => i.id === issue.id)) {
        await goToIssue(nextIssue);
    }
}

// Use a replacement from watch words
async function useReplacement(issue, replacementIndex) {
    if (!issue.replacements || !issue.replacements[replacementIndex]) return;

    const replacement = issue.replacements[replacementIndex];
    const nextIssue = getNextIssue(issue.id);

    // Preserve the case of the original word
    let fixedReplacement = replacement;
    if (issue.found.charAt(0) === issue.found.charAt(0).toUpperCase()) {
        fixedReplacement = replacement.charAt(0).toUpperCase() + replacement.slice(1);
    }

    try {
        await Word.run(async (context) => {
            const searchResults = context.document.body.search(issue.found, {
                matchCase: true,
                matchWholeWord: false
            });
            searchResults.load('items');
            await context.sync();

            if (searchResults.items.length > 0) {
                // Replace the correct occurrence based on stored index
                const idx = issue.occurrenceIndex || 0;
                const targetIdx = Math.min(idx, searchResults.items.length - 1);
                searchResults.items[targetIdx].insertText(fixedReplacement, Word.InsertLocation.replace);
                await context.sync();

                allIssues = allIssues.filter(i => i.id !== issue.id);
                fixedCount++;
                changesSinceLastScan++;
                displayResults();
            }
        });
    } catch (error) {
        console.error('Error applying replacement:', error);
        elements.status.textContent = 'Error applying replacement: ' + error.message;
        elements.status.className = 'status error';
    }

    if (nextIssue && !allIssues.some(i => i.id === issue.id)) {
        await goToIssue(nextIssue);
    }
}

// Fix all issues of a specific rule type
async function fixAllOfType(ruleId) {
    const toFix = allIssues.filter(i => i.rule.id === ruleId && i.autoFix !== undefined);
    if (toFix.length === 0) return;

    const nextIssue = getNextIssue(toFix.map(i => i.id));

    try {
        await Word.run(async (context) => {
            // Process each issue
            for (const issue of toFix) {
                const searchResults = context.document.body.search(issue.found, {
                    matchCase: true,
                    matchWholeWord: false
                });
                searchResults.load('items');
                await context.sync();

                // Replace all occurrences
                for (const item of searchResults.items) {
                    item.insertText(issue.autoFix, Word.InsertLocation.replace);
                }
                await context.sync();
            }

            // Remove fixed issues and update display
            const fixedIds = new Set(toFix.map(i => i.id));
            allIssues = allIssues.filter(i => !fixedIds.has(i.id));
            fixedCount += toFix.length;
            changesSinceLastScan += toFix.length;
            displayResults();
        });
    } catch (error) {
        console.error('Error applying fixes:', error);
        elements.status.textContent = 'Error applying fixes: ' + error.message;
        elements.status.className = 'status error';
    }

    if (nextIssue && !allIssues.some(i => i.rule.id === ruleId)) {
        await goToIssue(nextIssue);
    }
}

// Ignore an issue (remove from list)
function ignoreIssue(issueId) {
    const nextIssue = getNextIssue(issueId);
    allIssues = allIssues.filter(i => i.id !== issueId);
    displayResults();
    if (nextIssue) goToIssue(nextIssue);
}

// Ignore all issues of a rule type, persisting across rescans for this session
function ignoreAllOfType(ruleId) {
    const nextIssue = getNextIssue(allIssues.filter(i => i.rule.id === ruleId).map(i => i.id));
    ignoredRuleIds.add(ruleId);
    allIssues = allIssues.filter(i => i.rule.id !== ruleId);
    displayResults();
    if (nextIssue) goToIssue(nextIssue);
}

// Navigate to an issue in the document
async function goToIssue(issue) {
    try {
        await Word.run(async (context) => {
            // Use searchText if available (for long text like sentences), otherwise found
            const textToFind = issue.searchText || issue.found;
            const searchResults = context.document.body.search(textToFind, {
                matchCase: true,
                matchWholeWord: false
            });
            searchResults.load('items');
            await context.sync();

            if (searchResults.items.length > 0) {
                // Select the correct occurrence based on stored index
                const idx = issue.occurrenceIndex || 0;
                const targetIdx = Math.min(idx, searchResults.items.length - 1);
                searchResults.items[targetIdx].select();
                await context.sync();
            }
        });
    } catch (error) {
        console.error('Error navigating to issue:', error);
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
