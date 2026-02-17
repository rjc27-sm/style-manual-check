# Test Document Rule Coverage Map

Each rule is listed with the document(s) that should trigger it.

## Spelling (7 rules)
| Rule | Doc 1 | Doc 2 | Doc 3 | Doc 4 | Doc 5 |
|------|-------|-------|-------|-------|-------|
| `spelling-ize` (organize, modernize, optimize, recognize, utilize) | x | x | | | |
| `spelling-yze` (analyze) | x | | | | |
| `spelling-or` (behavior, color, labor, favor) | x | | | | |
| `spelling-er` (center, fiber) | x | | | | |
| `spelling-ense` (defense) | x | | | | |
| `spelling-doubled` (travelers, labeling, modeling) | x | | | | |
| `spelling-other` (gray, fulfill, program→programme) | x | | | | |

## Common Errors (2 rules)
| Rule | Doc 1 | Doc 2 | Doc 3 | Doc 4 | Doc 5 |
|------|-------|-------|-------|-------|-------|
| `error-common-phrases` (could of, programme, deep-seeded, mute point, free reign, intensive purposes, irregardless, dove into) | x | | | | x |
| `error-judgment` (judgment) | x | | | | |

## Punctuation (11 rules)
| Rule | Doc 1 | Doc 2 | Doc 3 | Doc 4 | Doc 5 |
|------|-------|-------|-------|-------|-------|
| `punct-em-dash` (review—conducted) | x | | | | |
| `punct-en-dash-space` (2020–2025 is fine, but word–word) | | | | | |
| `punct-hyphen-date-range` (2025-26, 2018/19 uses slash not hyphen) | | | | x | |
| `punct-hyphen-parenthetical` (pages 10 - 20) | | | | x | |
| `punct-double-space` (after full stop) | x | | | | |
| `punct-spaced-slash` (panel / secretariat) | | | | x | |
| `punct-double-quotes` ("the current approach...") | x | | | | |
| `punct-comma-inside-quotes` ('criteria,' listed) | | | | x | |
| `punct-serial-comma` | | x | | | |
| `punct-ampersand` (programs & redirect) | | x | | | |
| `punct-capital-after-colon` (found: The, approach: Safety) | | | | | x |

## Dates and Time (11 rules)
| Rule | Doc 1 | Doc 2 | Doc 3 | Doc 4 | Doc 5 |
|------|-------|-------|-------|-------|-------|
| `date-us-format` (January 15, 2025) | x | | | | |
| `date-numeric-ambiguous` (05/03/2025, 06/11/2024) | x | | | | x |
| `date-ordinal-in-date` (1st phase, 3rd March, 2nd quarter) | x | | | | |
| `date-decade-apostrophe` (1980's, 1990's, 2010's) | x | | | x | x |
| `date-comma-after-day` (Thursday, 15 May) | x | | | | |
| `date-slash-year-span` (2018/19, 2019/20) | x | | | x | |
| `date-timezone-position` (AEST 17:00) | | | | x | |
| `time-12-ambiguous` (12 pm, 12 am) | | | | x | |
| `time-full-stop` (5.30 pm, 2.00 pm) | | | | x | |
| `time-redundant-ampm` (10 am in the morning, pm in the afternoon) | | | | x | |
| `time-confusing-bi` (biweekly, bimonthly) | | | | x | |

## Headings (4 rules)
| Rule | Doc 1 | Doc 2 | Doc 3 | Doc 4 | Doc 5 |
|------|-------|-------|-------|-------|-------|
| `heading-title-case` (Background And Context, Eligibility and Application Process) | x | | | | |
| `heading-too-long` (A Comprehensive Overview... in doc 2) | | x | | | |
| `heading-full-stop` (Next Steps.) | x | | | | |
| `heading-all-caps` (A COMPREHENSIVE OVERVIEW...) | | x | | | |

## Latin Abbreviations (5 rules)
| Rule | Doc 1 | Doc 2 | Doc 3 | Doc 4 | Doc 5 |
|------|-------|-------|-------|-------|-------|
| `latin-eg` (e.g.) | | | | | x |
| `latin-ie` (i.e.) | | | | | x |
| `latin-etc` (etc.) | | | | x | |
| `latin-etal` (et al.) | | | | | x |
| `latin-nb` (N.B.) | | | | | x |

## Abbreviations (6 rules)
| Rule | Doc 1 | Doc 2 | Doc 3 | Doc 4 | Doc 5 |
|------|-------|-------|-------|-------|-------|
| `abbrev-month-full-stop` (Feb.) | | | x | | |
| `abbrev-day-full-stop` (Mon.) | | | x | | |
| `abbrev-common-full-stop` (Dr., Prof., dept., Mr., Mrs., approx., vol., fig.) | | | x | | |
| `abbrev-unit-full-stop` (km., dB., kW.) | | | x | | |
| `abbrev-unit-plural` (kgs, kms, mgs, hrs, cms) | | | x | | |
| `abbrev-plural-apostrophe` (DVD's, CD's, PDF's, NGO's) | | | x | | |

## Watch Words (2 rules)
| Rule | Doc 1 | Doc 2 | Doc 3 | Doc 4 | Doc 5 |
|------|-------|-------|-------|-------|-------|
| `watch-words` (numerous entries across doc 1 and 2) | x | x | | | |
| `wordy-phrases` (adequate number of, at this point in time, approximately, etc.) | | | x | | x |

## Government Terms (6 rules)
| Rule | Doc 1 | Doc 2 | Doc 3 | Doc 4 | Doc 5 |
|------|-------|-------|-------|-------|-------|
| `govt-commonwealth-government` | x | | | | |
| `govt-minister-preposition` (Minister of Health) | x | | | | |
| `govt-secretary-preposition` (Secretary for the Department) | | | | | x |
| `govt-generic-department` (the Department) | x | | | | |
| `govt-generic-minister` (the Minister) | x | | | | |
| `govt-generic-agency` (the Agency, the Board, the Commission, etc.) | x | x | | | x |

## Readability (1 rule)
| Rule | Doc 1 | Doc 2 | Doc 3 | Doc 4 | Doc 5 |
|------|-------|-------|-------|-------|-------|
| `readability-sentence-length` | | x | | | |

## Lists (6 rules)
| Rule | Doc 1 | Doc 2 | Doc 3 | Doc 4 | Doc 5 |
|------|-------|-------|-------|-------|-------|
| `list-semicolon` | | | | x | |
| `list-trailing-comma` | | | | x | |
| `list-and-or` (and at end of list item) | | | | x | |
| `list-etc` (etc. in list) | | | | x | |
| `list-inconsistent-caps` | | | | x | |
| `list-inconsistent-punctuation` | | | | x | |

## Numbers and Measurements (11 rules)
| Rule | Doc 1 | Doc 2 | Doc 3 | Doc 4 | Doc 5 |
|------|-------|-------|-------|-------|-------|
| `numbers-ordinal-words` (1st, 2nd, 9th) | x | | x | | |
| `punct-superscript-ordinal` (3ˢᵗ) | | | x | | |
| `numbers-zero-one` (0, 1) | | | x | | |
| `numbers-words-to-numerals` (five, twelve, twenty-five, etc.) | | | x | | |
| `numbers-percent-spelling` (45 percent) | | | x | | |
| `numbers-percent-space` (15 %) | | | x | | |
| `numbers-leading-zero` (.75) | | | x | | |
| `numbers-start-sentence` (15 regional councils) | | | x | | |
| `numbers-comma-thousands` (2500, 8500, 15000) | | | x | | |
| `numbers-measurement-words` (five km, twelve tonnes) | | | x | | |
| `numbers-imperial-units` (450 feet, 85 yards, etc.) | | | x | | |

## Inclusive Language (3 rules)
| Rule | Doc 1 | Doc 2 | Doc 3 | Doc 4 | Doc 5 |
|------|-------|-------|-------|-------|-------|
| `inclusive-gendered-terms` (chairman, spokesman, etc.) | | x | | | x |
| `inclusive-disability-terms` (handicapped, wheelchair-bound, etc.) | | x | | | |
| `inclusive-age-terms` (elderly, the aged, senior citizens, etc.) | | x | | | |

## Coverage Summary
- **Doc 1** (Policy Briefing): 23 rules — spelling, common errors, core punctuation, dates, headings, government terms, watch words
- **Doc 2** (Health Services): 14 rules — inclusive language, watch words, readability, headings (too-long, all-caps), ampersand, serial comma
- **Doc 3** (Statistics): 17 rules — numbers/measurements, abbreviations, wordy phrases
- **Doc 4** (Program Guidelines): 17 rules — lists, time, dates, punctuation (hyphen, slash, quotes)
- **Doc 5** (Agency Comms): 14 rules — Latin abbreviations, capital-after-colon, government terms, gendered terms, common errors, wordy phrases
- **Total**: All 60 rules covered at least once
