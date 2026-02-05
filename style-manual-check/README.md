# Style Manual Check

A tool to check documents against the [Australian Government Style Manual](https://www.stylemanual.gov.au).

## Current status

The Microsoft Word add-in is complete and can be sideloaded for testing. A browser-based demo is also available for testing rules without Word.

## Microsoft Word add-in

The Word add-in is located in the `StyleManualCheck/` directory. To use it:

1. Open Word and go to Insert → Add-ins → Upload My Add-in
2. Browse to `StyleManualCheck/dist/manifest.xml`
3. Click 'Check document' in the task pane to scan for style issues
4. Review and fix issues using the Accept, Ignore, and Go to issue buttons

## Browser demo

For quick testing without Word:

1. Open `demo.html` in a web browser
2. Edit or paste text in the left panel
3. Click 'Scan document' to check for style issues
4. Review suggestions in the right panel

Note: The demo needs to load the JavaScript files in `/src`, so you need to either:
- Open demo.html from a local web server, OR
- Use a browser that allows local file access (some browsers block this for security)

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
├── style-manual-check/           # Browser demo
│   ├── demo.html                 # Browser demo for testing
│   ├── src/
│   │   ├── rules.js              # Rule definitions (~68 rules)
│   │   └── spellings.js          # Word dictionaries
│   ├── docs/                     # Documentation
│   ├── CLAUDE.md                 # Project context for Claude Code
│   └── README.md                 # This file
│
└── StyleManualCheck/             # Word add-in
    ├── dist/manifest.xml         # Add-in manifest for sideloading
    └── src/                      # Source files
```

## Development

This project is being developed with assistance from Claude. The `CLAUDE.md` file contains project context that helps Claude understand the codebase.

## Licence

[To be determined]

## Contact

[To be added]
