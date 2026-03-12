# Style Manual Check

## Project overview

Style Manual Check is a Microsoft Word add-in that checks documents against the Australian Government Style Manual (https://www.stylemanual.gov.au). It helps government staff apply Style Manual rules consistently. It also has a browser-based checker hosted on GitHub Pages (https://rjc27-sm.github.io/style-manual-check/).

## Project structure

```
style-manual-check/              # Root project directory
├── LICENSE                      # CC BY-NC 4.0
├── docs/                        # GitHub Pages (served at rjc27-sm.github.io/style-manual-check/)
│   ├── .nojekyll                # Prevents Jekyll processing
│   ├── index.html               # Browser checker (from demo.html)
│   └── src/
│       ├── rules.js             # 73 rules (canonical minus heading-bold-not-styled)
│       └── spellings.js         # Word dictionaries
├── style-manual-check/          # Browser demo source
│   ├── CLAUDE.md                # This file - project context for Claude
│   ├── README.md                # User-facing documentation
│   ├── SETUP_INSTRUCTIONS.md    # Beginner setup guide for testers
│   ├── demo.html                # Browser demo for testing rules (local use)
│   ├── src/
│   │   ├── rules.js             # Rule definitions (older copy — not actively maintained; use StyleManualCheck/src/rules.js)
│   │   └── spellings.js         # Word dictionaries (US→AU, common errors)
│   └── docs/
│       ├── PROJECT_HISTORY.md   # Development log with key decisions
│       └── shared-architecture.md
│
└── StyleManualCheck/            # Word add-in (Office.js)
    ├── manifest.xml             # Add-in manifest for sideloading
    ├── src/
    │   ├── rules.js             # CANONICAL — 73 rules (source of truth)
    │   ├── spellings.js         # CANONICAL — word dictionaries (source of truth)
    │   └── taskpane/
    │       ├── taskpane.html    # Task pane UI
    │       ├── taskpane.css     # Styles
    │       └── taskpane.js      # Word API integration
    └── dist/                    # Built files for deployment
```

**Important:** `StyleManualCheck/src/rules.js` and `StyleManualCheck/src/spellings.js` are the canonical versions. When syncing to GitHub Pages, copy to `docs/src/` and remove `heading-bold-not-styled` (Word-only rule). The older copy in `style-manual-check/src/` is not actively maintained.

## Rule categories and counts

9 categories, 73 rules total (canonical: `StyleManualCheck/src/rules.js`):

| Category | Rules |
|---|---|
| Spelling | 9 |
| Punctuation | 11 |
| Dates and time | 11 |
| Headings | 5 |
| Abbreviations | 11 |
| Government terms | 6 |
| Readability | 3 |
| Numbers and measurements | 11 |
| Lists | 6 |

The `readability` category includes: sentence length, watch words, and wordy phrases.
The `abbreviations` category includes: Latin abbreviations (e.g., i.e., etc.), abbreviation stops rules, and unit/plural abbreviation rules.

Latin abbreviation rules were moved from their own category into `abbreviations` in the last refactor.
The `inclusive language` category was removed — those rules change too often to be prescriptive.

## Key Style Manual principles

- Australian English spellings (organise, colour, centre, program)
- Single quotation marks (double only for quotes within quotes)
- Commas/full stops outside closing quotes
- Sentence case for headings, not title case
- Avoid Latin abbreviations; use 'for example', 'that is', 'and so on'
- Dates as '15 January 2024', not 'January 15, 2024'
- Spaced en dashes, not em dashes
- Time zones after the time: '14:00 AEST'
- Sentences under 25 words
- 'Australian Government', not 'Commonwealth government'
- 'Minister for [portfolio]', not 'Minister of'
- Write 'zero' and 'one' as words; use numerals for 2 and above
- Number words (two–ninety-nine) should be numerals in general text
- 'per cent' (two words), not 'percent'
- Metric units, not imperial
- Minimal punctuation in lists (no semicolons, commas, 'and'/'or' at end of items, no 'etc.')
- Non-breaking spaces between numbers and units

## UI text requirements

The add-in's own interface text must follow Style Manual rules:
- Single quotes around words being set off
- 'for example', not 'e.g.'
- Sentence case throughout
- Non-breaking spaces to prevent awkward line breaks (for example, between 'for' and 'example')

## Browser checker implementation

**File:** `docs/index.html`

**Status:** Live at https://rjc27-sm.github.io/style-manual-check/ (served from `docs/` on master branch; GitHub Pro required for private repo + public Pages).

**Intentional limitation:** The browser checker uses a plain-text `<textarea>`. When users paste from Word, formatting (bold, italic, heading styles) is stripped. This is a browser constraint. There is no plan to add rich-text editing — the Word add-in is the correct tool for applying fixes to formatted documents with styles preserved. The browser checker is for quick checks of plain text.

**Scanning flow:**
1. User pastes text into the `<textarea>`
2. `buildHeuristicSets(text)` splits on `\n` and classifies each line:
   - Lines starting with a bullet or `\d+[.)]` → `listLines`
   - Lines ≤ 12 words, no trailing sentence punctuation, not all-caps → `headingLines`
3. `checkText(text, headingLines, listLines)` runs all rules (bold/italic/tableLines omitted — always undefined in browser mode)
4. Results are filtered by `ignoredGroups` (Set of group IDs from 'Ignore all') and `ignoredFingerprints` (Set of `ruleId:found` fingerprints from individual 'Ignore')
5. Each issue gets an `id` property (`'issue-N'`) for DOM targeting
6. `displayResults()` renders cards and rebuilds the filter dropdown

**Per-issue actions (data-action pattern):**
All buttons use `data-action` attributes — functions are NOT referenced in `onclick=` HTML attributes because module-scoped functions are not global. Each card's buttons are bound via `card.querySelectorAll('button[data-action]').forEach(btn => { btn.onclick = ... })`.

- `accept` — replaces the first occurrence of `issue.found` at `issue.position` in the textarea, increments `fixedCount`, calls `rescanAndDisplay()`
- `usereplacement` — same as accept but substitutes `issue.replacements[index]`
- `ignore` — adds `rule.id + ':' + found` fingerprint to `ignoredFingerprints`; removes card
- `goto` — calls `textarea.setSelectionRange(position, position + found.length)` and scrolls the textarea to show the selection
- `fixall` — replaces all issues of that rule ID in the current `allIssues` array
- `ignoreall` — adds `issue.groupId || issue.rule.id` to `ignoredGroups`; removes matching cards

**Ignore persistence:** Both `ignoredGroups` and `ignoredFingerprints` persist across rescans in the same browser session (they are not cleared when the user clicks 'Scan document' again).

**Filter dropdown:** Rebuilt dynamically after each scan to show only categories that have issues, with counts.

## Word add-in implementation

**File:** `StyleManualCheck/src/taskpane/taskpane.js`

**Scanning flow:**
1. Load all paragraphs with `text`, `style`, `isListItem`, `font.bold`, and `font.italic` properties (first sync)
2. Join paragraphs with `\n` to preserve boundaries
3. Build `headingLines`, `listLines`, `boldLines`, and `italicLines` Sets from the loaded properties
4. Detect table-cell paragraphs via `parentTableCellOrNullObject` (second sync) → build `tableLines` Set
5. Call `checkText(fullText, headingLines, listLines, boldLines, italicLines, tableLines)` to get issues
6. Filter out session-ignored issues: remove any issue whose `groupId || rule.id` is in `ignoredGroups`, or whose `rule.id + ':' + found` fingerprint is in `ignoredFingerprints`
7. Calculate `occurrenceIndex` for each issue (count of same text before that position in the full text); uses `\b` word-boundary pattern when `issue.matchWholeWord` is true
8. Render issue cards

**Per-issue actions:**
- `Accept` — search for `issue.searchText || issue.found` (with `matchWholeWord: issue.matchWholeWord`), replace the correct occurrence with `issue.autoFix`; optionally apply `Heading 2` style if `issue.applyHeadingStyle` is set; then auto-navigate to the next issue
- `Use '[word]'` — apply the first entry in `issue.replacements` (watch words / wordy phrases), preserving case (uses `matchWholeWord: issue.matchWholeWord`); then auto-navigate to the next issue
- `Ignore` — stores a fingerprint (`rule.id + ':' + found`) in `ignoredFingerprints` (persists across rescans); removes issue from list; auto-navigates to next issue
- `Go to issue` — search for `issue.searchText || issue.found` (with `matchWholeWord: issue.matchWholeWord`) and select the correct occurrence by index
- `Fix all N` — apply autofix for all issues of that rule ID; also applies `Heading 2` style if `issue.applyHeadingStyle` is set; then auto-navigate to the first remaining issue
- `Ignore all N` — add `issue.groupId || issue.rule.id` to `ignoredGroups` Set (persists across rescans); for watch-words this is `'watch-words:<word>'` so it suppresses only that word, not the whole category; auto-navigate to first remaining issue

**Rescan banner:** shown when `changesSinceLastScan >= 5` and issues remain, because occurrence indices drift as text changes.

## Rule engine: checkText()

**File:** `StyleManualCheck/src/rules.js`

`checkText(text, headingLines, listLines, boldLines, italicLines, tableLines)` — runs all rules and returns issues sorted by position.

Each rule object has:
- `id` — unique string (for example, `'spelling-ize'`)
- `name` — display label (sentence case)
- `category` — category key string
- `description` — explanation shown in the card
- `link` — URL to Style Manual page
- `check(text, headingLines, listLines, boldLines, italicLines, tableLines)` — returns array of issue objects

Each issue object has:
- `rule` — reference to the rule
- `found` — the text that triggered the rule
- `suggestion` — display text for the suggestion
- `position` — character offset in the full text
- `autoFix` — (optional) string to replace the searched text with; use `''` for deletions (not `undefined`)
- `replacements` — (optional) array of alternative words (watch words / wordy phrases)
- `description` — (optional) per-issue override of rule description
- `searchText` — (optional) full text used for the Word search and as the replace target; `found` is used as the short display text only. Used when `found` alone is too common to search safely (for example, list rules store the full list item here so the search is specific)
- `applyHeadingStyle` — (optional) boolean; if true, `acceptFix` also applies `Heading 2` style
- `matchWholeWord` — (optional) boolean; if true, Word searches use `matchWholeWord: true` and `occurrenceIndex` is counted with `\b` boundaries. Set by watch-words to prevent navigation landing on substrings (for example, 'require' within 'requirements')
- `groupId` — (optional) string grouping key for `Ignore all`; defaults to `rule.id` when absent. Watch-word issues set this to `'watch-words:<matched-word-lowercase>'` so each word is ignored independently

**Important:** `autoFix === undefined` means no autofix. `autoFix === ''` is a valid deletion fix. When `searchText` is set, `autoFix` replaces the full `searchText` match (not just `found`).

**Heading detection:** `headingLines` is a Set of paragraph indices with a Word heading/title/subtitle style. Rules use this to identify headings accurately rather than relying on heuristics alone. When a match is heuristic (not confirmed by style), the per-issue description prompts users to apply a heading style.

**List detection:** `listLines` is a Set of paragraph indices where `isListItem` is true (covers both Word-formatted bullets/numbered lists using `numPr` and `List Paragraph` style).

**Bold/italic detection:** `boldLines` and `italicLines` are Sets of paragraph indices where `font.bold === true` or `font.italic === true` (entire paragraph). Only populated in the Word add-in.

**Table detection:** `tableLines` is a Set of paragraph indices that are inside table cells (detected via `parentTableCellOrNullObject`). Only populated in the Word add-in.

**Heuristic heading detection (Word mode):** When `boldLines` is defined (Word mode), heuristic heading detection requires the paragraph to be entirely bold or italic AND not inside a table cell. This prevents false positives on body sentences and table content. In browser mode (`boldLines` undefined), the existing word-count/punctuation heuristic is used unchanged.

**`preserveCase(original, replacement)`** — helper that matches the case of `original` when building a replacement.

## Rule details and exceptions

### numbers-zero-one
Flags standalone `0` or `1` that should be written as words. Skips:
- Dates and ordinals (15 January, 21st)
- Year ranges and fiscal years (2018/19, 2024–25)
- Times (10:30, 12 pm)
- Decimal numbers (0.5)
- Comma-separated thousands (1,100)
- Ranges (1–5)
- Reference words (stage 1, phase 2, section 1, etc.)

### numbers-words-to-numerals
Flags written-out number words (two–ninety-nine) that should be numerals. Skips:
- Start of sentence
- Fractions (one-third)
- Figures of speech (one of a kind)
- Units (ten per cent)
- Multi-word numbers (two hundred, three million)

### numbers-ordinal-words
Flags numeric ordinals 1st–9th and suggests word forms (first–ninth). Skips:
- Centuries (21st century)
- Dates (1st January)
- Reference editions (1st edition)

### heading-full-stop
Skips indented bullets and sentence-ending list lead-ins (for example, 'Exceptions to this rule are:'). Autofix is available for potential headings.

### latin-eg
Always replaces with 'for example,' (including trailing comma).

### list-inconsistent-punctuation / list-inconsistent-caps
Both rules skip lines present in `headingLines` at the top of their line loop — the line breaks the current list block and is never treated as a list item. This prevents numbered headings such as `'11. Licensing and source code'` from being mistaken for a numbered list item (the `\d+[.)]` pattern in `bulletPattern` would otherwise match). `list-inconsistent-caps` also sets `searchText` (first 30 chars, no trailing `...`) on every issue so 'Go to issue' works reliably for items longer than 30 characters.

`list-inconsistent-punctuation` also detects the case where all items start with capitals and have no full stops, but the preceding line ends with `:`. Stand-alone lists (capitals, no full stops) are the only valid pattern for that combination, and stand-alone lists never have a lead-in sentence — so a colon lead-in definitively rules out stand-alone. The issue is flagged on the first item with a suggestion covering both possible corrections: add full stops to all items (sentence list) or start each item in lowercase and add a full stop to the last item only (fragment list).

### punct-capital-after-colon
Uses `[ \t]+` (not `\s+`) to prevent cross-line matches. Also skips:
- Label words before the colon (Step, Phase, Option, Note, etc.)
- CamelCase identifiers immediately after the word
- Matches within heading lines (`headingLines`)
- Colons at the very start of a paragraph (char before `:` is `\n`)
- Multi-word proper-noun phrases: if the character immediately after the flagged word is a space followed by another capital letter (for example, `': Style Manual'` → 'Manual' follows 'Style'), the match is skipped
- Question sentences: if the first sentence-ending character after the colon is `?`, the match is skipped (Style Manual allows a capital after a colon that introduces a question, for example, `'Ask yourself: Is this clear?'`). Detection scans from the colon position to the first `\n`, `.`, `!`, or `?` character.
The `suggestion` text includes a context snippet of up to 40 characters before the colon so the user can locate the match without clicking 'Go to issue'.

### watch-words
All issues carry `matchWholeWord: true` and `groupId: 'watch-words:<word-lowercase>'`. This means:
- Navigation (Go to issue, Accept, Use) will not land on substrings (for example, 'require' won't match inside 'requirements')
- 'Ignore all N' suppresses only that specific word for the session, not all watch-word issues
- 'currently' was removed from the WATCH_WORDS dictionary (triggered too often in normal writing)

### punct-em-dash
Catches both unspaced (`word—word`) and spaced (`word — word`) em dashes.

### numbers-start-sentence
Flags sentences that begin with a numeral. Skips lines in `tableLines` (table cells) to avoid false positives on data tables.

### govt-commonwealth-government
Fixes 'a Commonwealth government' → 'an Australian Government' (not 'a Australian').

## Known issues / limitations

**Word add-in:**
- **Office.js:** Speaker notes in PowerPoint are not accessible — this is a known API limitation
- **Occurrence drift:** After several fixes the document text changes, so occurrence indices become stale. The rescan banner appears after 5 changes to prompt a rescan
- **No paragraph-level iteration in fix-all:** `fixAllOfType` replaces all Word search results for each found text, not just the indexed occurrence

**Browser checker:**
- **Plain text only:** Pasting from Word strips all formatting (bold, italic, heading styles). This is intentional — the Word add-in is the correct tool for formatted documents
- **Heuristic heading detection:** `headingLines` is inferred from line length and punctuation, not from actual heading styles. Short lines without trailing punctuation may be misidentified as headings (false negatives) or body text may be treated as headings (false positives)
- **No bold/italic/table detection:** `boldLines`, `italicLines`, and `tableLines` are always undefined. Rules that depend on these (for example, `heading-bold-not-styled`) are not available or are less precise
- **`heading-bold-not-styled` excluded:** This rule is Word-only (requires bold paragraph detection) and is absent from `docs/src/rules.js`
- **No write-back:** The browser checker cannot apply fixes to a Word document. Users must manually make changes in Word based on the issues found

## Important links

- Style Manual: https://www.stylemanual.gov.au
- Spelling: https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/spelling
- Headings: https://www.stylemanual.gov.au/structuring-content/headings
- Quotation marks: https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/punctuation/quotation-marks
- Government terms: https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/names-and-terms/government-terms
- Numbers and measurements: https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements
- Lists: https://www.stylemanual.gov.au/structuring-content/lists

## Development

**Word add-in** (Webpack/Babel build):
```
cd StyleManualCheck
npm install
npm start        # dev server on https://localhost:3000
npm run build    # production build to dist/
```
The add-in is sideloaded into Word via `manifest.xml`. Point the dev server URL in the manifest to your hosted `dist/` for non-local testing.

**Browser checker** (no build step — plain HTML + vanilla JS with ES modules):
- Live: https://rjc27-sm.github.io/style-manual-check/ (served from `docs/` on master branch)
- Local testing: serve `docs/` with any static file server (ES modules require a server, not `file://`)
  ```
  cd docs
  python -m http.server 8000
  ```
  Then open http://localhost:8000/

**Syncing rules to browser checker:**
When updating `StyleManualCheck/src/rules.js`, copy to `docs/src/rules.js` and remove the `heading-bold-not-styled` rule (Word-only). The `export` statement must remain for ES module loading. The file in `style-manual-check/src/rules.js` is an older copy and not actively maintained — do not use it as a source of truth.

## Roadmap

**Word add-in**
1. Working group testing (now — March 2026)
2. Implement feedback from working group testing
3. IT review — Q2 2026 (APSC + AIHW)
4. Pilot agencies — Q3 2026
5. Broad release / AppSource — Q4 2026

**PowerPoint add-in**
The PowerPoint add-in will be built after the Word add-in working group feedback has been implemented. The plan is for the working group to then test the PowerPoint version.

Key considerations for the PowerPoint add-in:
- Use the same rule engine (`rules.js` / `spellings.js`) with no changes
- Access text via: Presentation → Slides → Shapes → TextFrame → TextRange (requires API 1.4+)
- Navigate by slide and shape rather than paragraph/occurrence
- Speaker notes are NOT accessible via Office.js — users must check these manually
- Must work on Windows, Mac, and PowerPoint Online

Proposed owner: APSC. Maintenance: approximately 1–2 days/month.

## End-of-session task

At the end of every session (when work is complete), update the file `style-manual-check/docs/rules-list.md` with a current list of all rules grouped by category. For each rule include its `id`, `name`, and a brief note of what it checks. Generate this from `StyleManualCheck/src/rules.js` as the source of truth.
