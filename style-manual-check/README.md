# Style Manual Check

A tool to check documents against the [Australian Government Style Manual](https://www.stylemanual.gov.au).

## Try it now — no installation needed

**[rjc27-sm.github.io/style-manual-check](https://rjc27-sm.github.io/style-manual-check/)**

Paste or type text in the left panel and click 'Scan document'. Issues appear in the right panel with suggestions, links to the Style Manual, and one-click fixes.

## Microsoft Word add-in

Sideloading to Word desktop now requires setting up a trusted shared folder catalogue as well as access to the Add-ins feature. Users must place the manifest file in a shared network folder, then configure Word to trust that folder via File → Options → Trust Center → Trust Center Settings → Trusted Add-in Catalogs. The add-in then appears under Home → Add-ins → Advanced → Shared Folder. Alternatively, for Word on the web, users can select Home → Add-ins → More Settings → Upload My Add-in. Both methods are suitable only for development and testing, not production deployment.

## What it checks

9 categories, 72 rules in the browser checker (73 in the Word add-in, which also checks for bold text that should have a heading style applied).

### Spelling (9 rules)
- US → Australian English: -ize → -ise (organize → organise), -yze → -yse (analyze → analyse)
- -or → -our (color → colour), -er → -re (center → centre), -ense → -ence (defense → defence)
- Doubled consonants (traveled → travelled, canceled → cancelled)
- Other differences (gray → grey, aging → ageing, program → programme in some contexts)
- Common errors: 'would of' → 'would have', 'irregardless' → 'regardless', 'deep-seeded' → 'deep-seated', 'mute point' → 'moot point'
- Spelling: 'judgement' (not 'judgment', except in legal contexts)

### Punctuation (11 rules)
- Em dashes → spaced en dashes (both spaced and unspaced em dashes)
- Unspaced en dashes in sentences → spaced
- Hyphens used as parenthetical dashes ( - ) → en dash ( – )
- Hyphens in date ranges (2020-21) → en dashes (2020–21)
- Double spaces after full stops
- Double quotation marks → single quotation marks
- Commas placed inside closing quotation marks
- Serial (Oxford) commas
- Ampersands in body text → 'and'
- Spaced forward slashes (and / or → and/or)
- Capital letters after colons

### Dates and time (11 rules)
- US date format (January 15, 2024 → 15 January 2024)
- Ambiguous numeric dates (12/03/2024)
- Ordinals in dates (1st May → 1 May)
- Apostrophes in decades (1980's → 1980s)
- Commas after day names (Thursday, 31 December → Thursday 31 December)
- Forward slashes in year spans (2018/19 → 2018–19)
- Time zone before the time (AEST 13:45 → 13:45 AEST)
- Ambiguous 12 am/pm (→ midnight/noon)
- Full stops in times (10.30 am → 10:30 am)
- Redundant am/pm qualifiers (8 am in the morning → 8 am)
- Confusing 'bi' time terms (bimonthly, biweekly, biannual → be specific)

### Headings (4–5 rules)
- Title case headings (→ sentence case)
- Full stops at end of headings
- All caps headings
- Headings over the recommended length
- Bold text without a heading style applied (Word add-in only)

### Abbreviations (11 rules)
- Latin abbreviations: e.g. → for example, i.e. → that is, etc. → and so on, et al. → and others, N.B. → Note
- Full stops in month/day abbreviations (Jan. → Jan, Mon. → Mon)
- Full stops in contractions, acronyms, and unit symbols (Dr. → Dr, NSW. → NSW, kg. → kg)
- Pluralised unit symbols (5 kgs → 5 kg)
- Apostrophes in abbreviation plurals (DVD's → DVDs)

### Government terms (6 rules)
- 'Commonwealth government' → 'Australian Government'
- 'Minister of [portfolio]' → 'Minister for'
- 'Secretary for [department]' → 'Secretary of'
- Generic capitalised references: 'the Department', 'the Minister', 'the Agency', 'the Board', 'the Commission' → lowercase when used generically

### Numbers and measurements (11 rules)
- Use words for zero and one (0 → zero, 1 → one)
- Number words two–ninety-nine → numerals
- Ordinals 1st–9th → word forms (first–ninth)
- Superscript ordinals (1ˢᵗ → 1st)
- 'per cent' or 'percent' with a numeral → % (85 per cent → 85%)
- Space before percentage sign (15 % → 15%)
- Missing leading zero (.5 → 0.5)
- Numeral at start of sentence
- Missing thousands comma (2500 → 2,500)
- Word number with unit symbol (five km → 5 km)
- Imperial units (miles, feet, pounds, etc.) → prompt to use metric

### Lists (6 rules)
- Semicolons at end of list items
- Commas at end of list items
- 'And' or 'or' at end of list items
- 'Etc.' in lists
- Inconsistent capitalisation across list items
- Inconsistent or incorrect punctuation across list items

### Readability (3 rules)
- Long sentences (over 25 words)
- Watch words — jargon and overused terms with plain language alternatives (for example: 'utilise' → 'use', 'endeavour' → 'try', 'facilitate' → 'help')
- Wordy phrases — multi-word phrases that can be simplified (for example: 'in order to' → 'to', 'prior to' → 'before')

## Project structure

```
style-manual-check/               # Root project directory
├── LICENSE                       # CC BY-NC 4.0
├── docs/                         # GitHub Pages browser checker (public)
│   ├── index.html                # Browser checker
│   └── src/
│       ├── rules.js              # 72 rules (all except heading-bold-not-styled)
│       └── spellings.js          # US → Australian English word lists
├── style-manual-check/           # Browser demo source + documentation
│   ├── CLAUDE.md                 # Project context for Claude Code
│   ├── README.md                 # This file
│   ├── SETUP_INSTRUCTIONS.md     # Beginner setup guide
│   ├── demo.html                 # Browser demo for local testing
│   └── docs/                     # Technical documentation
│
└── StyleManualCheck/             # Word add-in (Office.js)
    ├── dist/manifest.xml         # Add-in manifest for sideloading
    └── src/                      # Canonical rule engine (source of truth)
        ├── rules.js              # 73 rules
        ├── spellings.js          # US → Australian English word lists
        └── taskpane/             # Word add-in UI and Office.js integration
```

## Development

This project is being developed with assistance from Claude Code. The `CLAUDE.md` file contains project context that helps Claude understand the codebase.

To run the browser checker locally, serve the `docs/` folder with any static file server:

```
python -m http.server 8000
```

Then open http://localhost:8000.

To develop the Word add-in:

```
cd StyleManualCheck
npm install
npm start        # dev server on https://localhost:3000
npm run build    # production build to dist/
```

## Licence

[Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)](https://creativecommons.org/licenses/by-nc/4.0/)

Free to use and adapt with attribution; not for commercial purposes.

## Contact

Jen Robertson, Australian Institute of Health and Welfare (AIHW).
