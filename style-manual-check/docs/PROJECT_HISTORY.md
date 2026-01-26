# Project history

This file documents key decisions and changes made during development.

## 2025-01-24: Initial development

### Rules implemented
- 24 rules across 6 categories
- Comprehensive US→AU spelling dictionaries with auto-generated verb forms
- Common errors list based on Style Manual misspellings page

### Key decisions

1. **Tool name**: 'Style Manual Check' chosen to clearly indicate it checks against the Australian Government Style Manual specifically

2. **'via' rule removed**: The latin-via rule was removed as 'via' is not flagged by the Style Manual

3. **'program' not 'programme'**: The Style Manual specifically recommends 'program' for Australian Government use, contrary to some other Australian style guides

4. **Judgment exception**: 'judgment' is flagged with a note that it's correct for legal judgments (court decisions)

5. **Title case detection**: Rather than auto-correcting headings (which would require knowing proper nouns), the tool prompts users to check if the text is a heading and use sentence case

6. **UI text follows Style Manual**: All interface text uses single quotes, 'for example' not 'e.g.', sentence case, etc.

### Links verified
All 'Learn more' links point to correct Style Manual pages:
- Latin abbreviations: /shortened-words-and-phrases/latin-shortened-forms
- Ordinal numbers: /numbers-and-measurements/ordinal-numbers
- Double spaces: /punctuation/punctuation-and-capitalisation

### Files created
- src/rules.js - 24 rule definitions
- src/spellings.js - Word dictionaries (US_TO_AU_SPELLINGS, COMMON_ERRORS)
- demo.html - Browser-based testing interface

### Next steps planned
- Convert to Microsoft Word add-in using Office.js
- Support both styled headings and manually formatted headings
- Package for sideloading/testing
