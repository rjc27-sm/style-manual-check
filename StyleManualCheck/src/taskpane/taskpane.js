/*
 * Style Manual Check - Word Add-in
 * Checks documents against the Australian Government Style Manual
 */

/* global document, Office, Word */

import { checkText, getCategories } from '../rules.js';

// State
let allIssues = [];
let fixedCount = 0;
let currentFilter = 'all';

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

        // Show app, hide loading
        elements.sideloadMsg.style.display = 'none';
        elements.appBody.style.display = 'block';

        // Set up event handlers
        elements.scanBtn.onclick = scanDocument;
        elements.categoryFilter.onchange = () => {
            currentFilter = elements.categoryFilter.value;
            displayResults();
        };

        // Initial status
        elements.status.textContent = 'Click "Check document" to scan for style issues.';
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
            // Get all text from the document body
            const body = context.document.body;
            body.load('text');
            await context.sync();

            const text = body.text;

            // Run style checks
            allIssues = checkText(text);

            // Assign IDs to issues
            allIssues.forEach((issue, i) => {
                issue.id = 'issue-' + i;
            });

            // Reset fixed count for new scan
            fixedCount = 0;

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
        'latin-abbreviations': 'Latin abbreviations',
        'dates-and-time': 'Dates and time',
        'headings': 'Headings',
        'government-terms': 'Government terms',
        'watch-words': 'Watch words',
        'readability': 'Readability',
        'numbers-and-measurements': 'Numbers and measurements',
        'lists': 'Lists'
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
        elements.status.textContent = 'No issues found.';
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
    card.className = 'issue-card';
    card.id = issue.id;

    // Check if this issue has autoFix
    const canAutoFix = issue.autoFix !== undefined;

    // Build card HTML
    let html = `
        <div class="issue-header">
            <span class="issue-rule">${escapeHtml(issue.rule.name)}</span>
        </div>
        <div class="issue-found">
            <span class="found-label">Found:</span>
            <span class="found-text">'${escapeHtml(issue.found)}'</span>
        </div>
        <div class="issue-suggestion">
            <span class="suggestion-label">Suggestion:</span>
            <span class="suggestion-text">${escapeHtml(issue.suggestion)}</span>
        </div>
        <div class="issue-description">${escapeHtml(issue.rule.description)}</div>
        <div class="issue-actions">
    `;

    if (canAutoFix) {
        html += `<button class="btn btn-accept" data-action="accept" data-id="${issue.id}">Accept</button>`;
    }
    html += `<button class="btn btn-ignore" data-action="ignore" data-id="${issue.id}">Ignore</button>`;
    html += `<button class="btn btn-goto" data-action="goto" data-id="${issue.id}">Go to issue</button>`;

    if (issue.rule.link) {
        html += `<a class="btn btn-learn" href="${issue.rule.link}" target="_blank">Learn more</a>`;
    }

    html += '</div>';
    card.innerHTML = html;

    // Attach event handlers
    card.querySelectorAll('button[data-action]').forEach(btn => {
        btn.onclick = () => handleAction(btn.dataset.action, btn.dataset.id);
    });

    return card;
}

// Handle button actions
async function handleAction(action, issueId) {
    const issue = allIssues.find(i => i.id === issueId);
    if (!issue) return;

    switch (action) {
        case 'accept':
            await acceptFix(issue);
            break;
        case 'ignore':
            ignoreIssue(issue);
            break;
        case 'goto':
            await goToIssue(issue);
            break;
    }
}

// Accept a fix and apply it to the document
async function acceptFix(issue) {
    if (issue.autoFix === undefined) return;

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
                // Replace the first occurrence
                // Note: In a more sophisticated version, we'd track exact positions
                searchResults.items[0].insertText(issue.autoFix, Word.InsertLocation.replace);
                await context.sync();

                // Remove from issues and update display
                allIssues = allIssues.filter(i => i.id !== issue.id);
                fixedCount++;
                displayResults();
            }
        });
    } catch (error) {
        console.error('Error applying fix:', error);
        elements.status.textContent = 'Error applying fix: ' + error.message;
        elements.status.className = 'status error';
    }
}

// Ignore an issue (remove from list)
function ignoreIssue(issue) {
    allIssues = allIssues.filter(i => i.id !== issue.id);
    displayResults();
}

// Navigate to an issue in the document
async function goToIssue(issue) {
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
                // Select the first occurrence
                searchResults.items[0].select();
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
