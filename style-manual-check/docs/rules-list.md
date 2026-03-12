# Style Manual Check – Rules list

73 rules across 9 categories. Source of truth: `StyleManualCheck/src/rules.js`.

---

## Abbreviations (11 rules)

| ID | Name | Checks for |
|---|---|---|
| `latin-eg` | Latin abbreviation: e.g. | 'e.g.' → 'for example,' |
| `latin-ie` | Latin abbreviation: i.e. | 'i.e.' → 'that is' |
| `latin-etc` | Latin abbreviation: etc. | 'etc.' → 'and so on' |
| `latin-etal` | Latin abbreviation: et al. | 'et al.' → 'and others' |
| `latin-nb` | Latin abbreviation: N.B. | 'N.B.' → 'note' |
| `abbrev-month-full-stop` | Full stop in month abbreviation | 'Jan.' → 'Jan' |
| `abbrev-day-full-stop` | Full stop in day abbreviation | 'Mon.' → 'Mon' |
| `abbrev-common-full-stop` | Full stop in common abbreviation | contractions/acronyms/units with unnecessary stops |
| `abbrev-unit-full-stop` | Full stop after unit symbol | 'kg.' → 'kg' |
| `abbrev-unit-plural` | Pluralised unit symbol | '5 kgs' → '5 kg' |
| `abbrev-plural-apostrophe` | Apostrophe in abbreviation plural | 'DVD\'s' → 'DVDs' |

---

## Dates and time (11 rules)

| ID | Name | Checks for |
|---|---|---|
| `date-us-format` | US date format | 'January 15, 2024' → '15 January 2024' |
| `date-numeric-ambiguous` | Ambiguous numeric date | '12/03/2024' → write date in full |
| `date-ordinal-in-date` | Ordinal number in date | '1st May' → '1 May' |
| `date-decade-apostrophe` | Apostrophe in decade | '1980\'s' → '1980s' |
| `date-comma-after-day` | Comma after day name | 'Thursday, 31 December' → 'Thursday 31 December' |
| `date-slash-year-span` | Forward slash in year span | '2018/19' → '2018–19' |
| `date-timezone-position` | Time zone before time | 'AEST 13:45' → '13:45 AEST' |
| `time-12-ambiguous` | 12 am or 12 pm | '12 am'/'12 pm' → 'midnight'/'noon' |
| `time-full-stop` | Full stop in time | '10.30 am' → '10:30 am' |
| `time-redundant-ampm` | Redundant am/pm qualifier | '8 am in the morning' → '8 am' |
| `time-confusing-bi` | Confusing 'bi' time term | 'bimonthly', 'biweekly', 'biannual' → be specific |

---

## Government terms (6 rules)

| ID | Name | Checks for |
|---|---|---|
| `govt-commonwealth-government` | Commonwealth government | 'Commonwealth government' → 'Australian Government' |
| `govt-minister-preposition` | Minister of (wrong preposition) | 'Minister of [portfolio]' → 'Minister for' |
| `govt-secretary-preposition` | Secretary for (wrong preposition) | 'Secretary for [dept]' → 'Secretary of' |
| `govt-generic-department` | Generic department reference | 'the Department' (generic) → 'the department' |
| `govt-generic-minister` | Generic minister reference | 'the Minister' (generic) → 'the minister' |
| `govt-generic-agency` | Generic government body reference | 'the Agency/Board/Commission' (generic) → lowercase |

---

## Headings (5 rules)

| ID | Name | Checks for |
|---|---|---|
| `heading-title-case` | Title case heading | Title Case headings → sentence case |
| `heading-too-long` | Heading too long | headings over recommended length |
| `heading-full-stop` | Full stop at end of heading | headings ending with a full stop |
| `heading-all-caps` | All caps heading | ALL CAPS headings |
| `heading-bold-not-styled` | Bold text without heading style | entirely-bold paragraphs that look like headings but have no heading style applied (Word add-in only) |

---

## Lists (6 rules)

| ID | Name | Checks for |
|---|---|---|
| `list-semicolon` | Semicolon at end of list item | list items ending with ';' — autofix removes trailing ';' |
| `list-trailing-comma` | Comma at end of list item | list items ending with ',' — autofix removes trailing ',' |
| `list-and-or` | 'And' or 'or' at end of list item | list items ending with 'and'/'or' — autofix removes trailing word (and any preceding comma/semicolon) |
| `list-etc` | 'Etc.' in list | 'etc.' at end of a list item (advisory only) |
| `list-inconsistent-caps` | Inconsistent capitalisation in list | mixed upper/lowercase list item starts (advisory only); skips heading lines; uses searchText for reliable navigation |
| `list-inconsistent-punctuation` | Inconsistent or incorrect punctuation in list | mixed full stop usage across list items (advisory only); skips heading lines; also flags lists where all items start with capitals and have no full stops but the preceding line ends with ':' (cannot be a stand-alone list) |

---

## Numbers and measurements (11 rules)

| ID | Name | Checks for |
|---|---|---|
| `numbers-zero-one` | Use words for zero and one | '0'/'1' as numerals → 'zero'/'one' |
| `numbers-words-to-numerals` | Choosing numerals or words | number words two–ninety-nine → numerals |
| `numbers-ordinal-words` | Ordinal numeral instead of word | '1st'–'9th' → 'first'–'ninth' |
| `punct-superscript-ordinal` | Superscript ordinal | superscript ordinal suffixes → plain text |
| `numbers-percent-spelling` | Percent with numeral | '85 per cent' / '85 percent' → '85%' |
| `numbers-percent-space` | Space before percentage sign | '15 %' → '15%' |
| `numbers-leading-zero` | Missing leading zero | '.5' → '0.5' |
| `numbers-start-sentence` | Numeral at start of sentence | sentence starting with a numeral; skips table cells |
| `numbers-comma-thousands` | Missing comma in large number | '2500' → '2,500' |
| `numbers-measurement-words` | Word number with unit symbol | 'five km' → '5 km' |
| `numbers-imperial-units` | Imperial units | miles, feet, pounds, etc. → metric alternatives |

---

## Punctuation (11 rules)

| ID | Name | Checks for |
|---|---|---|
| `punct-em-dash` | Em dash to spaced en dash | '—' → ' – ' |
| `punct-en-dash-space` | Unspaced en dash in sentences | 'word–word' in sentences → 'word – word' |
| `punct-hyphen-date-range` | Hyphen in date range | '2020-21' → '2020–21' |
| `punct-hyphen-parenthetical` | Hyphen as parenthetical dash | ' - ' → ' – ' |
| `punct-double-space` | Double space after full stop | double spaces → single space |
| `punct-spaced-slash` | Spaced forward slash | 'and / or' → 'and/or' |
| `punct-double-quotes` | Double quotation marks | "double quotes" → 'single quotes' (incl. curly) |
| `punct-comma-inside-quotes` | Comma inside closing quotation mark | comma placed incorrectly inside quotes |
| `punct-serial-comma` | Serial comma (Oxford comma) | unnecessary Oxford commas |
| `punct-ampersand` | Ampersand in body text | '&' in body text → 'and' |
| `punct-capital-after-colon` | Capital letter after colon | 'word: Capital' → 'word: lowercase'; skips heading lines, paragraph-initial colons, multi-word proper-noun phrases (for example, ': Style Manual'), and question sentences (for example, 'Ask yourself: Is this clear?') |

---

## Readability (3 rules)

| ID | Name | Checks for |
|---|---|---|
| `readability-sentence-length` | Long sentence | sentences over 25 words |
| `watch-words` | Watch words | plain language alternatives for jargon (single words); whole-word matching only; 'Ignore all' is per-word not per-category |
| `wordy-phrases` | Wordy phrase | plain language alternatives for multi-word phrases |

---

## Spelling (9 rules)

| ID | Name | Checks for |
|---|---|---|
| `spelling-ize` | -ize to -ise spelling | -ize/-ized/-izing/-ization endings → -ise |
| `spelling-yze` | -yze to -yse spelling | -yze endings → -yse (analyse, paralyse) |
| `spelling-or` | -or to -our spelling | -or endings → -our (colour, favour) |
| `spelling-er` | -er to -re spelling | -er endings → -re (centre, theatre) |
| `spelling-ense` | -ense to -ence spelling | -ense endings → -ence (defence, licence) |
| `spelling-doubled` | Doubled consonants | missing doubled consonants (travelled, cancelled) |
| `spelling-other` | Other spelling differences | other US→AU spelling variants |
| `error-common-phrases` | Common misspellings and errors | always-wrong phrases (would of, irregardless, etc.) |
| `error-judgment` | Judgment spelling | 'judgment' → 'judgement' (with note for legal use) |
