# Style Manual Check

## Project overview

Style Manual Check is a tool that checks documents against the Australian Government Style Manual (https://www.stylemanual.gov.au). The goal is to help government staff apply Style Manual rules consistently. It will be available as both a Microsoft Word add-in and a PowerPoint add-in, sharing a common rule engine.

## Current status

**Development approach:** We are building this in phases:
1. **Phase 1 (complete):** Build and test all style rules using the browser-based demo
2. **Phase 2 (next):** Refactor into shared architecture, then build Word add-in
3. **Phase 3 (planned):** Build PowerPoint add-in using the same architecture

**Completed:**
- Core rule engine with 62 rules across 11 categories
- Browser-based demo (demo.html) for testing rules
- Comprehensive word lists in src/spellings.js
- Rule definitions in src/rules.js
- Complete word list documentation (can be regenerated)
- Shared architecture design for Word + PowerPoint (see docs/shared-architecture.md)

**Next phase (shared architecture + Word add-in):**
1. Refactor code into layered structure with adapter pattern
2. Build WordAdapter for Office.js integration
3. Package Word add-in for sideloading and testing

**Future phase (PowerPoint add-in):**
- Build PowerPointAdapter using same architecture
- Note: Speaker notes are NOT accessible via Office.js (known API limitation)

## Project structure

**Current structure:**
```
style-manual-check/
├── CLAUDE.md           # This file - project context for Claude
├── README.md           # User-facing documentation
├── demo.html           # Browser demo for testing rules
├── src/
│   ├── rules.js        # Rule definitions (62 rules)
│   └── spellings.js    # Word dictionaries (US→AU, common errors)
└── docs/
    ├── PROJECT_HISTORY.md
    ├── shared-architecture.md   # Architecture for Word + PowerPoint
    └── word-addin-plan.txt
```

**Planned structure after refactoring (see docs/shared-architecture.md):**
```
style-manual-check/
├── src/
│   ├── core/                    # Shared rule engine (100% reusable)
│   │   ├── rules.js
│   │   ├── spellings.js
│   │   └── checker.js           # checkText() extracted here
│   ├── adapters/                # Document access abstraction
│   │   ├── document-adapter.js  # Interface definition
│   │   ├── word-adapter.js      # Word Office.js implementation
│   │   ├── powerpoint-adapter.js# PowerPoint Office.js implementation
│   │   └── demo-adapter.js      # Browser demo (textarea)
│   ├── ui/                      # Shared UI components
│   │   ├── taskpane.html
│   │   ├── taskpane.css
│   │   └── taskpane.js
│   └── app/                     # Entry points per application
│       ├── word/
│       ├── powerpoint/
│       └── demo/
└── manifests/
    ├── word-manifest.xml
    └── powerpoint-manifest.xml
```

## Rule categories

1. **Spelling** (7 rules) - US to Australian English conversions (-ize→-ise, -or→-our, etc.)
2. **Common errors** (2 rules) - Always-wrong phrases (would of, irregardless, etc.)
3. **Latin abbreviations** (5 rules) - e.g.→for example, i.e.→that is, etc.
4. **Punctuation** (10 rules) - Dashes, quotes, serial comma, ampersands
5. **Dates and time** (11 rules) - Date formats, time formats, decades, year spans, ordinals in dates
6. **Headings** (4 rules) - Title case, length, full stops, all caps
7. **Government terms** (6 rules) - Commonwealth government, minister/secretary prepositions, generic references
8. **Watch words** (1 rule) - Plain language alternatives for jargon and complex phrases
9. **Readability** (1 rule) - Sentence length over 25 words
10. **Numbers and measurements** (9 rules) - Zero/one as words, percentages, decimals, units, imperial warnings
11. **Lists** (6 rules) - No semicolons/commas/and/or at end of items, no 'etc.', consistent capitalisation and punctuation

## Key Style Manual principles to follow

- Use Australian English spellings (organise, colour, centre)
- Use single quotation marks, not double (double only for quotes within quotes)
- Place commas/full stops outside closing quotes unless part of quoted material
- Use sentence case for headings, not title case
- Avoid Latin abbreviations in general content
- Write dates as '15 January 2024' not 'January 15, 2024'
- Use spaced en dashes, not em dashes
- Use 'program' not 'programme' (Australian Government preference)
- Time zones come after the time: '14:00 AEST' not 'AEST 14:00'
- Keep sentences under 25 words for readability
- Use 'Australian Government', not 'Commonwealth government'
- Use 'Minister for [portfolio]', not 'Minister of [portfolio]'
- Write 'zero' and 'one' as words, use numerals for 2 and above
- Use 'per cent' (two words) not 'percent'
- Use metric units, not imperial
- Use minimal punctuation in lists (no semicolons, commas, 'and' or 'or' at end of items)
- Don't use 'etc.' at the end of lists

## UI text requirements

The add-in's own interface text must follow Style Manual rules:
- Use single quotes around words being set off
- Use 'for example' not 'e.g.'
- Use sentence case

## Important links

- Style Manual: https://www.stylemanual.gov.au
- Spelling: https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/spelling
- Headings: https://www.stylemanual.gov.au/structuring-content/headings
- Quotation marks: https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/punctuation/quotation-marks
- Government terms: https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/names-and-terms/government-terms
- Numbers and measurements: https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements
- Lists: https://www.stylemanual.gov.au/structuring-content/lists

## Technical notes

- The demo.html loads src/spellings.js and src/rules.js as separate script files
- Rules use regex patterns for detection
- The checkText() function in rules.js runs all rules and returns issues sorted by position
- Each rule has: id, name, category, description, link, check function
- The preserveCase() helper maintains capitalisation when suggesting replacements

## Shared architecture approach

The Word and PowerPoint add-ins share a common architecture using the adapter pattern:

- **Core rule engine** (100% shared) - rules.js, spellings.js, checker.js
- **Document adapters** (app-specific) - Abstract Office.js differences behind a common interface
- **Shared UI** (~90% shared) - Task pane HTML/CSS/JS works for both apps
- **Entry points** (app-specific) - Initialise correct adapter per application

Key adapter interface methods:
- `getTextBlocks()` - Extract all text from document/presentation
- `replaceInBlock(blockId, oldText, newText)` - Apply a fix
- `navigateToBlock(blockId)` - Jump to location in document
- `getLocationString(block)` - Human-readable location (e.g. 'Slide 3, Title')

See docs/shared-architecture.md for complete implementation details.

## Word add-in requirements

- Must work with Word on Windows, Mac, and Word Online
- Use Office.js API to access document content
- Implement as a task pane add-in
- Support checking selected text or full document
- Allow users to accept, ignore, or fix all instances of each issue
- Must detect both styled headings AND manually formatted headings for title case rule

## PowerPoint add-in requirements

- Must work with PowerPoint on Windows, Mac, and PowerPoint Online
- Requires PowerPoint API 1.4+ (for TextFrame access)
- Access text via: Presentation → Slides → Shapes → TextFrame → TextRange
- Navigate by slide and shape rather than paragraph

**Known limitations (Office.js API):**
- Speaker notes are NOT accessible - users must check these manually
- No native find/replace - must replace entire textRange.text
- No paragraph-level iteration within shapes
- iPad support is minimal (API 1.1 only, no text frame access)
