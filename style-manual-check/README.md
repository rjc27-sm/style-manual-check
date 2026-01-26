# Style Manual Check

A tool to check documents against the [Australian Government Style Manual](https://www.stylemanual.gov.au).

## Current status

This project is in active development. The rule engine is complete and can be tested via the browser demo. The next phase is converting it to a Microsoft Word add-in.

## Quick start (browser demo)

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

### Capitalisation
- Title case headings (prompts user to check and use sentence case)

## Project structure

```
style-manual-check/
├── demo.html           # Browser demo for testing
├── src/
│   ├── rules.js        # Rule definitions
│   └── spellings.js    # Word dictionaries
├── docs/               # Documentation
├── CLAUDE.md           # Project context for Claude Code
└── README.md           # This file
```

## Development

This project is being developed with assistance from Claude. The `CLAUDE.md` file contains project context that helps Claude understand the codebase.

## Licence

[To be determined]

## Contact

[To be added]
