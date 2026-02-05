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

## 2025-01-29: PowerPoint add-in research and shared architecture

### Research findings

Investigated the feasibility of creating a PowerPoint add-in alongside the planned Word add-in.

**PowerPoint Office.js API capabilities:**
- Mature API with 10 requirement set versions (1.1 through 1.10)
- Full support on Office Web, Windows (Microsoft 365), and Mac
- Text access via Slide → Shape → TextFrame → TextRange hierarchy
- Requires API 1.4+ for text frame access

**Key limitation discovered:**
- Speaker notes (presenter notes) are NOT accessible via Office.js
- This is a known feature request that Microsoft has not implemented
- Users will need to check speaker notes manually

### Architecture decision

Designed a shared architecture to support both Word and PowerPoint add-ins with maximum code reuse. Key design:

1. **Adapter pattern** - Abstract document access behind a common interface (`DocumentAdapter`)
2. **Layered structure**:
   - Layer 1: Core rule engine (100% shared)
   - Layer 2: Document adapters (app-specific)
   - Layer 3: Shared UI
   - Layer 4: App entry points

3. **Code reuse estimates**:
   - Rule engine: 100%
   - UI code: ~90%
   - Only adapters and manifests are app-specific

### Files created
- docs/shared-architecture.md - Comprehensive architecture document with code examples

### Next steps
- Phase 1: Refactor existing code into layered structure
- Phase 2: Build Word add-in with WordAdapter
- Phase 3: Build PowerPoint add-in with PowerPointAdapter

## 2025-01-30: UI improvements and bug fixes

### UI enhancements

1. **Alphabetised filter dropdown** - Rule categories in the 'Issues found' dropdown are now in alphabetical order

2. **'Go to issue' button for advisory rules** - Advisory rules (those without autofix) now show 'Ignore' and 'Go to issue' buttons. 'Go to issue' navigates to and selects the issue text in the document

3. **Watch word replacement buttons** - Watch words now show a 'Use [suggested word]' button that applies the first suggested replacement. If multiple alternatives exist, 'Go to issue' is also shown for manual selection

### Bug fixes

4. **numbers-zero-one false positives** - Completely rewrote the rule to fix incorrect replacements in:
   - Dates (15 January → not changed)
   - Years and decades (1980s → not changed)
   - Times (10.30 am, 12 pm → not changed)
   - Ordinals (21st → not changed)
   - Fiscal years (2018/19 → not changed)
   - Ranges (1-5 → not changed)
   - Added exceptions for: stage, phase, section, chapter, step, part, level, tier, grade, version, volume, appendix, annex, figure, table, item, option, priority, round, wave, track

5. **latin-etc period preservation** - When 'etc.' appears at end of sentence, replacement now correctly preserves the period ('and so on.')

6. **heading-full-stop bullet point fix** - Rule no longer triggers on list items (lines starting with bullet markers)

7. **Watch word replacement bug** - Fixed issue where replacements corrupted text due to stale position tracking. Now uses string matching and rescans after each replacement

### Rule updates

8. **list-and-or autofix** - Added autofix capability to remove 'and'/'or' from end of list items

9. **list-inconsistent-caps** - Updated 'Learn more' link to quick-guide-lists page; simplified suggestion text

### Watch words list changes

10. **Removed**: 'deliver', 'drive' (vague suggestions)
11. **Added**: 'commencing' → 'starting'

### Demo text updated

Revised demo text to better test edge cases and avoid confusing the checker with multiple heading issues in sequence

## 2026-01-31: Bug report fixes

### Rule fixes

1. **numbers-start-sentence** - Now skips dates (15 August) to avoid false positives

2. **numbers-zero-one** - Now skips digits in date context (January 15)

3. **numbers-percent-spelling** - Now suggests % with numerals (85%) rather than 'per cent'

4. **list-etc** - Now detects 'etc.' after semicolon, not just at end of line

5. **list-inconsistent-periods** - Replaced with improved version that uses capitalisation to identify list type and gives better guidance

### Bug fix

6. **autoFix check** - Fixed bug where empty string was incorrectly treated as no autofix (empty string is valid for deletions)

## 2026-02-01: Word add-in

### Word add-in created

Built a Microsoft Word add-in (StyleManualCheck/) using Office.js:
- Generated Office Add-in project using Yeoman
- Integrated rules.js and spellings.js as ES modules
- Built task pane UI matching browser demo
- Uses Word JavaScript API for document access and manipulation

### Demo bug fixes

1. **Position-based replacement** - Fixed acceptFix, useReplacement, and fixAllOfType to use correct positions (was replacing first occurrence)

2. **Superscript ordinal detection** - Fixed numbers-zero-one rule to properly detect superscript ordinals (1ˢᵗ)

3. **numbers-start-sentence** - Now skips numbers after comma (Thursday, 15)

4. **List punctuation rules** - Made semicolon, comma, and/or rules advisory-only (no autofix)

### Feb 2026 bug report: UI improvements

5. **Ribbon button** - Updated to 'Style check' in 'Aus Gov' group

6. **Task pane** - Removed initial info message for cleaner UI

7. **Watch words** - Added 'Use [replacement]' button

8. **Learn more links** - Moved inside description area

9. **Rule labels** - Changed to sentence case throughout

10. **Ignore button** - Styled with red background for visibility

11. **Typography** - Reduced found/suggestion font sizes; made arrow black

12. **Icon assets** - Updated to new design

### Feb 2026 bug report: Rule fixes

13. **heading-full-stop** - Skip indented bullets, detect sentence lists, removed autofix to let user decide

14. **numbers-start-sentence** - Skip year ranges (2025-26) and 4-digit years

## 2026-02-04: Heading styles and number rules

### Heading style detection

Heading rules now detect paragraphs with Word heading/title/subtitle styles applied, not just lines matching text pattern heuristics. This improves accuracy when checking documents with proper heading styles.

The headingLines parameter was added to checkText() to pass styled line indices from the Word add-in.

### New rules

1. **numbers-words-to-numerals** - Flags number words (two through ninety-nine) that should be numerals per Style Manual. Exceptions:
   - Start of sentence
   - Fractions (one-third)
   - Figures of speech (one of a kind)
   - Measurement units (ten per cent)
   - Complex multi-word numbers (two hundred, three million)

2. **numbers-ordinal-words** - Flags 1st–9th and suggests word forms (first–ninth). Exceptions:
   - Centuries (21st century)
   - Dates (1st January)
   - Reference editions (1st edition)

### Rule updates

3. **Superscript ordinal rule** - Now suggests word forms for 1st–9th directly, and plain numerals for 10th+

### Bug fixes from bug report

4. **Ordinal rule ordering** - Reordered so word suggestion appears before superscript fix

5. **Compound number words** - Fixed twenty-three etc. being split when en-dash used instead of hyphen (expanded dash character class)

6. **numbers-start-sentence prepositions** - Added preposition check to reduce date false positives (for example, 'from 15 January')

7. **judgement spelling rule** - Added 'Use judgement' replacement button

8. **Heuristic heading descriptions** - Per-issue descriptions now prompt users to apply heading styles when matches are heuristic

9. **Double space rule** - Updated description text for clarity
