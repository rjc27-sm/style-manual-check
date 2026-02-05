# Style Manual Check

## Project overview

Style Manual Check is a tool that checks documents against the Australian Government Style Manual (https://www.stylemanual.gov.au). The goal is to help government staff apply Style Manual rules consistently. It will be available as both a Microsoft Word add-in and a PowerPoint add-in, sharing a common rule engine.

## Current status

**Development approach:** We are building this in phases:
1. **Phase 1 (complete):** Build and test all style rules using the browser-based demo
2. **Phase 2 (complete):** Build Word add-in using Office.js
3. **Phase 3 (planned):** Build PowerPoint add-in using the same architecture

**Completed:**
- Core rule engine with ~68 rules across 12 categories
- Microsoft Word add-in (StyleManualCheck/) - fully functional
- Browser-based demo (demo.html) for testing rules
- Comprehensive word lists in src/spellings.js
- Rule definitions in src/rules.js
- Heading detection via Word paragraph styles (heading, title, subtitle)
- List item detection via Word isListItem property
- Occurrence-based navigation for accurate 'Go to issue' functionality

**Next phase (PowerPoint add-in):**
- Build PowerPointAdapter using similar architecture
- Note: Speaker notes are NOT accessible via Office.js (known API limitation)

## Project structure

```
style-manual-check/           # Root project directory
├── style-manual-check/       # Browser demo
│   ├── CLAUDE.md             # This file - project context for Claude
│   ├── README.md             # User-facing documentation
│   ├── demo.html             # Browser demo for testing rules
│   ├── src/
│   │   ├── rules.js          # Rule definitions (~68 rules)
│   │   └── spellings.js      # Word dictionaries (US→AU, common errors)
│   └── docs/
│       ├── PROJECT_HISTORY.md
│       └── shared-architecture.md
│
└── StyleManualCheck/         # Word add-in (Office.js)
    ├── manifest.xml          # Add-in manifest for sideloading
    ├── src/
    │   ├── rules.js          # Rule definitions (copy of demo version)
    │   ├── spellings.js      # Word dictionaries (copy of demo version)
    │   └── taskpane/
    │       ├── taskpane.html # Task pane UI
    │       ├── taskpane.css  # Styles
    │       └── taskpane.js   # Word API integration
    └── dist/                 # Built files for deployment
```

## Rule categories

1. **Spelling** (7 rules) - US to Australian English conversions (-ize→-ise, -or→-our, etc.)
2. **Common errors** (2 rules) - Always-wrong phrases (would of, irregardless, etc.)
3. **Latin abbreviations** (5 rules) - e.g.→for example, i.e.→that is, etc.
4. **Abbreviations** (3 rules) - Missing/extra full stops, spaced abbreviations
5. **Punctuation** (10 rules) - Dashes, quotes, serial comma, ampersands
6. **Dates and time** (11 rules) - Date formats, time formats, decades, year spans, ordinals in dates
7. **Headings** (4 rules) - Title case, length, full stops, all caps
8. **Government terms** (6 rules) - Australian Government, minister/secretary prepositions, generic references
9. **Watch words** (1 rule) - Plain language alternatives for jargon and complex phrases
10. **Readability** (1 rule) - Sentence length over 25 words
11. **Numbers and measurements** (11 rules) - Zero/one as words, number words, ordinals, percentages, decimals, units, imperial warnings
12. **Lists** (6 rules) - No semicolons/commas/and/or at end of items, no 'etc.', consistent capitalisation and punctuation

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

## Word add-in implementation

The Word add-in (StyleManualCheck/) uses Office.js to integrate with Word:

**Key features:**
- Task pane UI for reviewing and fixing issues
- Accept, Ignore, Go to issue, and Fix all buttons
- Category filtering dropdown
- Detects Word heading styles (heading, title, subtitle)
- Detects Word list items to avoid false positives
- Occurrence-based navigation for accurate issue selection

**Technical approach:**
- Loads paragraphs with text, style, and isListItem properties
- Passes headingLines and listLines Sets to checkText()
- Uses searchText field for navigation when found text is truncated
- Calculates occurrenceIndex during scan for accurate 'Go to issue'

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
