# Style Manual Check

## Project overview

Style Manual Check is a Microsoft Word add-in that checks documents against the Australian Government Style Manual (https://www.stylemanual.gov.au). The goal is to help government staff apply Style Manual rules consistently.

## Current status

**Completed:**
- Core rule engine with 27 rules across 7 categories
- Browser-based demo (demo.html) for testing rules
- Comprehensive word lists in src/spellings.js
- Rule definitions in src/rules.js
- Complete word list documentation (can be regenerated)

**Next phase:**
- Convert to a working Microsoft Word add-in (Office.js)
- Package for sideloading and testing
- Eventually publish to AppSource or internal distribution

## Project structure

```
style-manual-check/
├── CLAUDE.md           # This file - project context for Claude
├── README.md           # User-facing documentation
├── demo.html           # Browser demo for testing rules
├── src/
│   ├── rules.js        # Rule definitions (24 rules)
│   └── spellings.js    # Word dictionaries (US→AU, common errors)
└── docs/
    └── (documentation files)
```

## Rule categories

1. **Spelling** (7 rules) - US to Australian English conversions (-ize→-ise, -or→-our, etc.)
2. **Common errors** (2 rules) - Always-wrong phrases (would of, irregardless, etc.)
3. **Latin abbreviations** (5 rules) - e.g.→for example, i.e.→that is, etc.
4. **Punctuation** (7 rules) - Dashes, quotes, ampersands, superscript ordinals
5. **Dates** (3 rules) - US date format, ambiguous dates, time zone positioning
6. **Capitalisation** (1 rule) - Title case heading detection
7. **Readability** (1 rule) - Sentence length over 25 words

## Key Style Manual principles to follow

- Use Australian English spellings (organise, colour, centre)
- Use single quotation marks, not double
- Use sentence case for headings, not title case
- Avoid Latin abbreviations in general content
- Write dates as '15 January 2024' not 'January 15, 2024'
- Use spaced en dashes, not em dashes
- Use 'program' not 'programme' (Australian Government preference)
- Time zones come after the time: '14:00 AEST' not 'AEST 14:00'
- Keep sentences under 25 words for readability

## UI text requirements

The add-in's own interface text must follow Style Manual rules:
- Use single quotes around words being set off
- Use 'for example' not 'e.g.'
- Use sentence case

## Important links

- Style Manual: https://www.stylemanual.gov.au
- Spelling: https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/spelling
- Headings: https://www.stylemanual.gov.au/structuring-content/headings

## Technical notes

- The demo.html loads src/spellings.js and src/rules.js as separate script files
- Rules use regex patterns for detection
- The checkText() function in rules.js runs all rules and returns issues sorted by position
- Each rule has: id, name, category, description, link, check function
- The preserveCase() helper maintains capitalisation when suggesting replacements

## Word add-in requirements (for next phase)

- Must work with Word on Windows, Mac, and Word Online
- Use Office.js API to access document content
- Implement as a task pane add-in
- Support checking selected text or full document
- Allow users to accept, ignore, or fix all instances of each issue
- Must detect both styled headings AND manually formatted headings for title case rule
