# Style Manual Check

A tool to check documents against the [Australian Government Style Manual](https://www.stylemanual.gov.au).

## Current status

The Microsoft Word add-in is complete and can be sideloaded for testing. A browser-based checker is also available at **[rjc27-sm.github.io/style-manual-check](https://rjc27-sm.github.io/style-manual-check/)** — no installation needed.

## Microsoft Word add-in

The Word add-in is located in the `StyleManualCheck/` directory. To use it:

1. Open Word and go to Insert → Add-ins → Upload My Add-in
2. Browse to `StyleManualCheck/dist/manifest.xml`
3. Click 'Check document' in the task pane to scan for style issues
4. Review and fix issues using the Accept, Ignore, and Go to issue buttons

## Browser checker

The easiest way to use the browser checker is the public URL — no installation or setup needed:

**[rjc27-sm.github.io/style-manual-check](https://rjc27-sm.github.io/style-manual-check/)**

Or to run it locally:

1. Serve `style-manual-check/` with a local web server (for example: `python -m http.server 8000`)
2. Open http://localhost:8000/demo.html
3. Edit or paste text in the left panel
4. Click 'Scan document' to check for style issues
5. Review suggestions in the right panel

## What it checks

### Spelling (US → Australian)
- -ize → -ise (organize → organise)
- -yze → -yse (analyze → analyse)  
- -or → -our (color → colour)
- -er → -re (center → centre)
- -ense → -ence (defense → defence)
- Doubled consonants (traveled → travelled)
- Other differences (gray → grey, aging → ageing)

### Common errors
- 'would of' → 'would have'
- 'irregardless' → 'regardless'
- 'deep-seeded' → 'deep-seated'
- 'mute point' → 'moot point'
- And more...

### Latin abbreviations
- e.g. → for example
- i.e. → that is
- etc. → and so on
- et al. → and others
- N.B. → Note

### Abbreviations
- Missing full stops (eg → e.g.)
- Extra full stops on contractions (Dr. → Dr, Mr. → Mr)
- Extra full stops on acronyms (NSW. → NSW)
- Spaced abbreviations (e. g. → e.g.)

### Punctuation
- Em dashes → spaced en dashes
- Double quotes → single quotes
- Double spaces after full stops
- Ampersands in body text
- Superscript ordinals (1ˢᵗ → 1st)

### Dates and times
- US date format (January 15, 2024 → 15 January 2024)
- Ambiguous numeric dates
- Time zone positioning (AEST 14:00 → 14:00 AEST)

### Headings
- Title case headings (prompts user to check and use sentence case)
- Full stops at end of headings
- All caps headings
- Long headings (over 8 words)

### Numbers and measurements
- Use words for zero and one (0 → zero, 1 → one)
- Use numerals for number words (two → 2, etc.)
- Use word forms for ordinals 1st–9th (1st → first)
- Percentages (85 per cent → 85%)
- Imperial units (warns to use metric)

### Lists
- No semicolons, commas, 'and' or 'or' at end of list items
- No 'etc.' at end of lists
- Consistent capitalisation and punctuation

## Project structure

```
style-manual-check/               # Root project directory
├── LICENSE                       # CC BY-NC 4.0
├── docs/                         # GitHub Pages browser checker
│   ├── index.html                # Browser checker
│   └── src/                      # Rule engine (73 rules)
├── style-manual-check/           # Browser demo source + documentation
│   ├── demo.html                 # Browser demo for local testing
│   ├── src/                      # Rule engine source (older copy)
│   ├── docs/                     # Technical documentation
│   ├── CLAUDE.md                 # Project context for Claude Code
│   └── README.md                 # This file
│
└── StyleManualCheck/             # Word add-in (Office.js)
    ├── dist/manifest.xml         # Add-in manifest for sideloading
    └── src/                      # Canonical rule engine source
```

## Development

This project is being developed with assistance from Claude. The `CLAUDE.md` file contains project context that helps Claude understand the codebase.

## Licence

[Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)](https://creativecommons.org/licenses/by-nc/4.0/)

Free to use and adapt with attribution; not for commercial purposes.

## Contact

[To be added]
