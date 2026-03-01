# Style Manual Check

## Project overview

Style Manual Check is a Microsoft Word add-in that checks documents against the Australian Government Style Manual (https://www.stylemanual.gov.au). It helps government staff apply Style Manual rules consistently. It also has a browser-based demo for testing.

## Project structure

```
style-manual-check/              # Root project directory
├── style-manual-check/          # Browser demo
│   ├── CLAUDE.md                # This file - project context for Claude
│   ├── README.md                # User-facing documentation
│   ├── SETUP_INSTRUCTIONS.md    # Beginner setup guide for testers
│   ├── demo.html                # Browser demo for testing rules
│   ├── src/
│   │   ├── rules.js             # Rule definitions (72 rules)
│   │   └── spellings.js         # Word dictionaries (US→AU, common errors)
│   └── docs/
│       ├── PROJECT_HISTORY.md   # Development log with key decisions
│       └── shared-architecture.md
│
└── StyleManualCheck/            # Word add-in (Office.js)
    ├── manifest.xml             # Add-in manifest for sideloading
    ├── src/
    │   ├── rules.js             # Rule definitions (copy of demo version)
    │   ├── spellings.js         # Word dictionaries (copy of demo version)
    │   └── taskpane/
    │       ├── taskpane.html    # Task pane UI
    │       ├── taskpane.css     # Styles
    │       └── taskpane.js      # Word API integration
    └── dist/                    # Built files for deployment
```

**Important:** `StyleManualCheck/src/rules.js` and `StyleManualCheck/src/spellings.js` are the canonical versions. The copies in `style-manual-check/src/` should be kept in sync.

## Rule categories and counts

9 categories, 72 rules total:

| Category | Rules |
|---|---|
| Spelling | 9 |
| Punctuation | 11 |
| Dates and time | 11 |
| Headings | 4 |
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

## Word add-in implementation

**File:** `StyleManualCheck/src/taskpane/taskpane.js`

**Scanning flow:**
1. Load all paragraphs with `text`, `style`, and `isListItem` properties
2. Join paragraphs with `\n` to preserve boundaries
3. Build `headingLines` (Set of indices with heading/title/subtitle styles) and `listLines` (Set of indices with `isListItem`)
4. Call `checkText(fullText, headingLines, listLines)` to get issues
5. Filter out session-ignored rule IDs
6. Calculate `occurrenceIndex` for each issue (count of same text before that position)
7. Render issue cards

**Per-issue actions:**
- `Accept` — search for `issue.searchText || issue.found`, replace the correct occurrence with `issue.autoFix`; optionally apply `Heading 2` style if `issue.applyHeadingStyle` is set; then auto-navigate to the next issue
- `Use '[word]'` — apply the first entry in `issue.replacements` (watch words / wordy phrases), preserving case; then auto-navigate to the next issue
- `Ignore` — remove the single issue from the list; auto-navigate to the next issue
- `Go to issue` — search for `issue.searchText || issue.found` and select the correct occurrence by index
- `Fix all N` — apply autofix for all issues of that rule ID; then auto-navigate to the first remaining issue
- `Ignore all N` — add rule ID to `ignoredRuleIds` Set (persists for the session, including after rescan); auto-navigate to first remaining issue

**Rescan banner:** shown when `changesSinceLastScan >= 5` and issues remain, because occurrence indices drift as text changes.

## Rule engine: checkText()

**File:** `StyleManualCheck/src/rules.js`

`checkText(text, headingLines, listLines, boldLines)` — runs all rules and returns issues sorted by position.

Each rule object has:
- `id` — unique string (for example, `'spelling-ize'`)
- `name` — display label (sentence case)
- `category` — category key string
- `description` — explanation shown in the card
- `link` — URL to Style Manual page
- `check(text, headingLines, listLines, boldLines)` — returns array of issue objects

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

**Important:** `autoFix === undefined` means no autofix. `autoFix === ''` is a valid deletion fix. When `searchText` is set, `autoFix` replaces the full `searchText` match (not just `found`).

**Heading detection:** `headingLines` is a Set of paragraph indices with a Word heading/title/subtitle style. Rules use this to identify headings accurately rather than relying on heuristics alone. When a match is heuristic (not confirmed by style), the per-issue description prompts users to apply a heading style.

**List detection:** `listLines` is a Set of paragraph indices where `isListItem` is true (covers both Word-formatted bullets/numbered lists using `numPr` and `List Paragraph` style).

**Bold detection:** `boldLines` is a Set of paragraph indices where `font.bold === true` (entire paragraph is bold). Used by `heading-bold-not-styled`. Only populated in the Word add-in.

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
Use `searchText` on all issues so 'Go to issue' works.

### punct-capital-after-colon
Skips cross-line matches (list lead-ins) and label words (Step, Phase, Note, etc.).

### govt-commonwealth-government
Fixes 'a Commonwealth government' → 'an Australian Government' (not 'a Australian').

## Known issues / limitations

- **Office.js:** Speaker notes in PowerPoint are not accessible — this is a known API limitation
- **Occurrence drift:** After several fixes the document text changes, so occurrence indices become stale. The rescan banner appears after 5 changes to prompt a rescan
- **No paragraph-level iteration in fix-all:** `fixAllOfType` replaces all Word search results for each found text, not just the indexed occurrence

## Important links

- Style Manual: https://www.stylemanual.gov.au
- Spelling: https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/spelling
- Headings: https://www.stylemanual.gov.au/structuring-content/headings
- Quotation marks: https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/punctuation/quotation-marks
- Government terms: https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/names-and-terms/government-terms
- Numbers and measurements: https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements
- Lists: https://www.stylemanual.gov.au/structuring-content/lists

## Development

The Word add-in uses a Webpack/Babel build:
```
cd StyleManualCheck
npm install
npm start        # dev server on https://localhost:3000
npm run build    # production build to dist/
```

For the browser demo, serve `style-manual-check/` with any static file server:
```
python -m http.server 8000
```
Then open http://localhost:8000/demo.html.

The add-in is sideloaded into Word via `manifest.xml`. Point the dev server URL in the manifest to your hosted `dist/` for non-local testing.

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
