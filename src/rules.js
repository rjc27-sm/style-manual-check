/**
 * Australian Government Style Manual - Rule definitions
 * Each rule has: id, name, category, description, link, check function
 * Batch 1 triage-register rules added July 2026.
 */

import { SPELLINGS, COMMON_ERRORS, ERRORS_WITH_NOTES, WATCH_WORDS, WORDY_PHRASES, PREFIX_SPELLINGS } from './spellings.js';

const RULES = [
    // ==================== SPELLING RULES ====================
    {
        id: 'spelling-ize',
        name: '-ize to -ise spelling',
        category: 'spelling',
        description: 'Australian English uses -ise endings (for example, organise, realise, recognise).',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/spelling',
        check: function(text) {
            const issues = [];
            // Match words ending in -ize, -ized, -izes, -izing, -ization
            const regex = /\b([A-Za-z]+(?:iz(?:e|ed|es|ing|ation|ations)))\b/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const word = match[1];
                const lower = word.toLowerCase();
                if (SPELLINGS[lower]) {
                    const replacement = preserveCase(word, SPELLINGS[lower]);
                    issues.push({
                        found: word,
                        suggestion: replacement,
                        autoFix: replacement,
                        position: match.index,
                        rule: this
                    });
                }
            }
            return issues;
        }
    },
    {
        id: 'spelling-yze',
        name: '-yze to -yse spelling',
        category: 'spelling',
        description: 'Australian English uses -yse endings (for example, analyse, paralyse).',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/spelling',
        check: function(text) {
            const issues = [];
            const regex = /\b([A-Za-z]+(?:yz(?:e|ed|es|ing)))\b/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const word = match[1];
                const lower = word.toLowerCase();
                if (SPELLINGS[lower]) {
                    const replacement = preserveCase(word, SPELLINGS[lower]);
                    issues.push({
                        found: word,
                        suggestion: replacement,
                        autoFix: replacement,
                        position: match.index,
                        rule: this
                    });
                }
            }
            return issues;
        }
    },
    {
        id: 'spelling-or',
        name: '-or to -our spelling',
        category: 'spelling',
        description: 'Australian English uses -our endings (for example, colour, favour, honour).',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/spelling',
        check: function(text) {
            const issues = [];
            const orWords = Object.keys(SPELLINGS).filter(w => 
                w.endsWith('or') && SPELLINGS[w].endsWith('our')
            );
            for (const usWord of orWords) {
                const regex = new RegExp('\\b(' + usWord + ')\\b', 'gi');
                let match;
                while ((match = regex.exec(text)) !== null) {
                    const replacement = preserveCase(match[1], SPELLINGS[usWord]);
                    issues.push({
                        found: match[1],
                        suggestion: replacement,
                        autoFix: replacement,
                        position: match.index,
                        rule: this
                    });
                }
            }
            return issues;
        }
    },
    {
        id: 'spelling-er',
        name: '-er to -re spelling',
        category: 'spelling',
        description: 'Australian English uses -re endings for some words (for example, centre, metre, theatre).',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/spelling',
        check: function(text) {
            const issues = [];
            const erWords = ['caliber', 'center', 'fiber', 'liter', 'luster', 'maneuver', 
                           'meager', 'meter', 'ocher', 'reconnoiter', 'saber', 'scepter', 
                           'sepulcher', 'somber', 'specter', 'theater'];
            for (const usWord of erWords) {
                const regex = new RegExp('\\b(' + usWord + ')\\b', 'gi');
                let match;
                while ((match = regex.exec(text)) !== null) {
                    const replacement = preserveCase(match[1], SPELLINGS[usWord]);
                    issues.push({
                        found: match[1],
                        suggestion: replacement,
                        autoFix: replacement,
                        position: match.index,
                        rule: this
                    });
                }
            }
            return issues;
        }
    },
    {
        id: 'spelling-ense',
        name: '-ense to -ence spelling',
        category: 'spelling',
        description: 'Australian English uses -ence endings for some words (for example, defence, licence as noun).',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/spelling',
        check: function(text) {
            const issues = [];
            const enseWords = ['defense', 'offense', 'pretense'];
            for (const usWord of enseWords) {
                const regex = new RegExp('\\b(' + usWord + ')\\b', 'gi');
                let match;
                while ((match = regex.exec(text)) !== null) {
                    const replacement = preserveCase(match[1], SPELLINGS[usWord]);
                    issues.push({
                        found: match[1],
                        suggestion: replacement,
                        autoFix: replacement,
                        position: match.index,
                        rule: this
                    });
                }
            }
            return issues;
        }
    },
    {
        id: 'spelling-doubled',
        name: 'Doubled consonants',
        category: 'spelling',
        description: 'Australian English doubles the final consonant in some words (for example, travelled, cancelled, labelled).',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/spelling',
        check: function(text) {
            const issues = [];
            const doubledWords = Object.keys(SPELLINGS).filter(w => 
                (w.endsWith('eled') || w.endsWith('eling') || w.endsWith('eler') ||
                 w.endsWith('aled') || w.endsWith('aling')) &&
                SPELLINGS[w].includes('ll')
            );
            for (const usWord of doubledWords) {
                const regex = new RegExp('\\b(' + usWord + ')\\b', 'gi');
                let match;
                while ((match = regex.exec(text)) !== null) {
                    const replacement = preserveCase(match[1], SPELLINGS[usWord]);
                    issues.push({
                        found: match[1],
                        suggestion: replacement,
                        autoFix: replacement,
                        position: match.index,
                        rule: this
                    });
                }
            }
            return issues;
        }
    },
    {
        id: 'spelling-other',
        name: 'Other spelling differences',
        category: 'spelling',
        description: 'Various Australian English spelling conventions.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/spelling',
        check: function(text) {
            const issues = [];
            const otherWords = ['acknowledgment', 'aging', 'airplane', 'aluminum', 'artifact',
                              'ax', 'cozy', 'curb', 'donut', 'draft', 'draftsman', 'fulfill',
                              'gray', 'installment', 'jewelry', 'licorice',
                              'mold', 'molding', 'molt', 'mom', 'mustache', 'pajamas',
                              'peddler', 'plow', 'skeptic', 'skeptical', 'skepticism',
                              'skillful', 'smolder', 'sulfur', 'tire', 'willful', 'woolen'];
            for (const usWord of otherWords) {
                if (SPELLINGS[usWord]) {
                    const regex = new RegExp('\\b(' + usWord + ')\\b', 'gi');
                    let match;
                    while ((match = regex.exec(text)) !== null) {
                        const replacement = preserveCase(match[1], SPELLINGS[usWord]);
                        issues.push({
                            found: match[1],
                            suggestion: replacement,
                            autoFix: replacement,
                            position: match.index,
                            rule: this
                        });
                    }
                }
            }
            return issues;
        }
    },

    // ==================== COMMON ERRORS ====================
    {
        id: 'error-common-phrases',
        name: 'Common misspellings and errors',
        category: 'spelling',
        description: 'Common phrases that are always incorrect.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/spelling/common-misspellings-and-word-confusion',
        check: function(text) {
            const issues = [];
            for (const [wrong, correct] of Object.entries(COMMON_ERRORS)) {
                // Create case-insensitive regex with word boundaries where appropriate
                // For multi-word phrases, don't require word boundaries in the middle
                const escaped = wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp('\\b' + escaped + '\\b', 'gi');
                let match;
                while ((match = regex.exec(text)) !== null) {
                    const replacement = preserveCase(match[0], correct);
                    issues.push({
                        found: match[0],
                        suggestion: replacement,
                        autoFix: replacement,
                        position: match.index,
                        rule: this
                    });
                }
            }
            return issues;
        }
    },
    {
        id: 'error-judgment',
        name: 'Judgment spelling',
        category: 'spelling',
        description: 'Use \'judgement\' in Australian English. Note: legal judgments (court decisions) use \'judgment\'.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/spelling/common-misspellings-and-word-confusion',
        check: function(text) {
            const issues = [];
            const regex = /\b(judgment|judgments)\b/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const replacement = match[0].toLowerCase() === 'judgment' ? 'judgement' : 'judgements';
                issues.push({
                    found: match[0],
                    suggestion: preserveCase(match[0], replacement),
                    replacements: [preserveCase(match[0], replacement)],
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },

    // ==================== PUNCTUATION RULES ====================
    {
        id: 'punct-em-dash',
        name: 'Em dash to spaced en dash',
        category: 'punctuation',
        description: 'Use a spaced en dash ( – ) rather than an em dash (—) to set off information in sentences.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/punctuation/dashes',
        check: function(text) {
            const issues = [];
            // \s* catches both unspaced (word—word) and spaced (word — word) em dashes
            const regex = /(\w)\s*—\s*(\w)/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const replacement = match[1] + ' – ' + match[2];
                issues.push({
                    found: match[0],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'punct-en-dash-space',
        name: 'Unspaced en dashes around an aside',
        category: 'punctuation',
        description: 'A pair of en dashes setting off an aside in a sentence should be spaced. An unspaced en dash is correct for a span or a connection between words of equal weight, such as \'author–date\' or \'cost–benefit\'.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/punctuation/dashes',
        check: function(text) {
            const issues = [];
            // A lone word–word en dash is legitimate Style Manual usage (a
            // connection: author–date, Sydney–Melbourne), so it is never
            // flagged. What this rule catches is a PAIR of unspaced en dashes
            // bracketing an aside within one sentence. Two separate compounds
            // ('author–date and documentary–note systems') also put two dashes
            // in one sentence, so the between-text must additionally OPEN the
            // way an aside opens: with a pronoun, determiner or relative
            // ('we', 'the', 'which'...) or a participle ('conducted',
            // 'including'). There is deliberately no autoFix - the verifier
            // must never respace a genuine compound.
            const ASIDE_OPENERS = /^(which|who|whose|whom|including|but|meaning|say|says|said|see|that|this|these|those|a|an|the|we|it|they|he|she|you|i|not|no|now|then|perhaps|often|usually|sometimes|also|as|so|for|even|especially|mostly|mainly)$/i;
            const regex = /[A-Za-z]–[A-Za-z]/g;
            const dashes = [];
            let match;
            while ((match = regex.exec(text)) !== null) {
                dashes.push(match.index + 1);       // the dash itself
                regex.lastIndex = match.index + 2;  // allow adjacent matches
            }
            for (let i = 0; i + 1 < dashes.length; i++) {
                const between = text.slice(dashes[i] + 1, dashes[i + 1]);
                const words = between.trim().split(/\s+/);
                const opensLikeAside = ASIDE_OPENERS.test(words[0]) ||
                    (/(ed|ing)$/i.test(words[0]) &&
                     !/^(and|or)$/i.test(words[1] || ''));
                if (between.length <= 80 && words.length >= 2 && opensLikeAside &&
                    !/[.!?\n]/.test(between) && !/–/.test(between)) {
                    for (const pos of [dashes[i], dashes[i + 1]]) {
                        const found = text.slice(pos - 1, pos + 2);
                        issues.push({
                            found,
                            suggestion: found[0] + ' – ' + found[2],
                            position: pos - 1,
                            rule: this
                        });
                    }
                    i++;    // this pair is consumed
                }
            }
            return issues;
        }
    },
    {
        id: 'punct-hyphen-date-range',
        name: 'Hyphen in date range',
        category: 'punctuation',
        description: 'Use an en dash (–), not a hyphen (-), for date spans in financial years, calendar years, terms of office and lifespans.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/punctuation/dashes',
        check: function(text) {
            const issues = [];
            // Match year ranges with hyphens: yyyy-yyyy or yyyy-yy
            const regex = /\b(\d{4})-(\d{2,4})\b/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const startYear = match[1];
                const endPart = match[2];
                // Only flag if it looks like a year range (not a random number)
                const startNum = parseInt(startYear);
                const endNum = parseInt(endPart);
                // Check if start year is reasonable (1800-2100) and end makes sense
                if (startNum >= 1800 && startNum <= 2100) {
                    // For 2-digit end, check it could be a valid year continuation
                    // For 4-digit end, check it's greater than or equal to start
                    if (endPart.length === 2 || (endPart.length === 4 && endNum >= startNum)) {
                        const replacement = startYear + '–' + endPart;
                        issues.push({
                            found: match[0],
                            suggestion: replacement,
                            autoFix: replacement,
                            position: match.index,
                            rule: this
                        });
                    }
                }
            }
            return issues;
        }
    },
    {
        id: 'punct-hyphen-parenthetical',
        name: 'Hyphen as parenthetical dash',
        category: 'punctuation',
        description: 'Use spaced en dashes ( – ) for parenthetical phrases, not spaced hyphens ( - ).',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/punctuation/dashes',
        check: function(text) {
            const issues = [];
            // Match spaced hyphens (word - word pattern)
            const regex = /(\w) - (\w)/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const replacement = match[1] + ' – ' + match[2];
                issues.push({
                    found: match[0],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'punct-double-space',
        name: 'Double space after full stop',
        category: 'punctuation',
        description: 'Use a single space after a full stop, not a double space.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/punctuation/punctuation-and-capitalisation',
        check: function(text) {
            const issues = [];
            const regex = /([.!?])  +/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const replacement = match[1] + ' ';
                issues.push({
                    found: match[0],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'punct-spaced-slash',
        name: 'Spaced forward slash',
        category: 'punctuation',
        description: 'Don\'t add spaces around forward slashes. Write \'and/or\', not \'and / or\'.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/punctuation/forward-slashes',
        check: function(text) {
            const issues = [];
            const regex = /(\w) \/ (\w)/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const replacement = match[1] + '/' + match[2];
                issues.push({
                    found: match[0],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'punct-double-quotes',
        name: 'Double quotation marks',
        category: 'punctuation',
        description: 'Use single quotation marks, not double. Use double quotation marks only for quotes within quotes.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/punctuation/quotation-marks',
        check: function(text) {
            const issues = [];
            // Match text in double quotes - catches ASCII " (U+0022) and smart/curly quotes " " (U+201C/U+201D)
            const regex = /[\u201C"]([^\u201C\u201D"]+)[\u201D"]/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                // Don't flag if it contains single quotes (nested quote)
                if (!match[1].includes("'")) {
                    const replacement = "'" + match[1] + "'";
                    issues.push({
                        found: match[0],
                        suggestion: replacement,
                        autoFix: replacement,
                        position: match.index,
                        rule: this
                    });
                }
            }
            return issues;
        }
    },
    {
        id: 'punct-comma-inside-quotes',
        name: 'Comma inside closing quotation mark',
        category: 'punctuation',
        description: 'Place commas and full stops inside closing quotation marks only when they are part of the quoted material. Place them outside when they are not.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/punctuation/quotation-marks',
        check: function(text) {
            const issues = [];
            // Match single-quoted text ending with comma, followed by space and lowercase word
            // This pattern catches American-style punctuation where the comma is not part of the quote
            // Pattern: 'word,' followed by lowercase word continuation
            const regex = /'([^']+),'\s+([a-z][a-z]*)/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const quotedText = match[1];
                const nextWord = match[2];
                // Only flag if it's a short phrase (likely a term, not quoted speech)
                // Quoted speech like 'Stop,' she said is correct
                const wordCount = quotedText.trim().split(/\s+/).length;
                if (wordCount <= 3) {
                    const replacement = "'" + quotedText + "', " + nextWord;
                    issues.push({
                        found: match[0],
                        suggestion: replacement,
                        autoFix: replacement,
                        position: match.index,
                        rule: this
                    });
                }
            }
            return issues;
        }
    },
    {
        id: 'punct-serial-comma',
        name: 'Serial comma (Oxford comma)',
        category: 'punctuation',
        description: 'Restrict use of the serial comma. Use it only when needed for clarity, such as when the last item contains \'and\' or when a defining phrase applies only to the final item.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/punctuation/commas',
        check: function(text) {
            const issues = [];
            // Match list pattern: "item, item, and item"
            // Each item can be 1-4 words to catch phrases like "the red car"
            const regex = /\b((?:\w+\s+){0,3}\w+),\s+((?:\w+\s+){0,3}\w+),\s+and\s+((?:\w+\s+){0,3}\w+)\b/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const fullMatch = match[0];
                const item1 = match[1];
                const item2 = match[2];
                const item3 = match[3];

                // Don't flag if the last item is compound (contains "and")
                // For example: "accommodation and food services"
                if (/\band\b/i.test(item3)) {
                    continue;
                }

                const suggestion = item1 + ', ' + item2 + ' and ' + item3;
                issues.push({
                    found: fullMatch,
                    suggestion: suggestion,
                    autoFix: suggestion,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },

    // ==================== DATES AND TIME RULES ====================
    {
        id: 'date-us-format',
        name: 'US date format',
        category: 'dates-and-time',
        description: 'Write dates as \'15 January 2024\', not \'January 15, 2024\'. Day comes before month in Australian style.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/dates-and-time',
        check: function(text) {
            const issues = [];
            const months = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
            // Match "Month DD, YYYY" format
            const regex = new RegExp('\\b(' + months.join('|') + ')\\s+(\\d{1,2}),?\\s+(\\d{4})\\b', 'g');
            let match;
            while ((match = regex.exec(text)) !== null) {
                const day = match[2];
                const month = match[1];
                const year = match[3];
                const replacement = day + ' ' + month + ' ' + year;
                issues.push({
                    found: match[0],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'date-numeric-ambiguous',
        name: 'Ambiguous numeric date',
        category: 'dates-and-time',
        description: 'Numeric dates like \'12/03/2024\' are ambiguous. Write dates in full: \'12 March 2024\'.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/dates-and-time',
        check: function(text) {
            const issues = [];
            // Match MM/DD/YYYY where MM > 12 would be invalid, suggesting US format
            const regex = /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g;
            const months = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
            let match;
            while ((match = regex.exec(text)) !== null) {
                const first = parseInt(match[1]);
                const second = parseInt(match[2]);
                const year = match[3];
                
                // If first number > 12, it's clearly a day (AU format) - skip
                if (first > 12) continue;
                
                // If second number > 12, it's clearly US format (month/day)
                if (second > 12) {
                    const replacement = second + ' ' + months[first - 1] + ' ' + year;
                    issues.push({
                        found: match[0],
                        suggestion: replacement,
                        autoFix: replacement,
                        position: match.index,
                        rule: this
                    });
                } else if (first !== second) {
                    // Ambiguous - could be either format
                    issues.push({
                        found: match[0],
                        suggestion: '(write date in full to avoid ambiguity)',
                        position: match.index,
                        rule: this
                    });
                }
            }
            return issues;
        }
    },
    {
        id: 'date-ordinal-in-date',
        name: 'Ordinal number in date',
        category: 'dates-and-time',
        description: 'Don\'t use ordinal numbers (1st, 2nd, 3rd) when writing dates. Write \'1 May\', not \'1st May\'.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/dates-and-time',
        check: function(text) {
            const issues = [];
            const months = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
            // Match ordinal + month (1st January, 2nd Feb, 23rd March, etc.)
            const monthPattern = months.join('|') + '|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sept?|Oct|Nov|Dec';
            const regex = new RegExp('\\b(\\d{1,2})(st|nd|rd|th)\\s+(' + monthPattern + ')\\b', 'gi');
            let match;
            while ((match = regex.exec(text)) !== null) {
                const day = match[1];
                const month = match[3];
                const replacement = day + ' ' + month;
                issues.push({
                    found: match[0],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'date-decade-apostrophe',
        name: 'Apostrophe in decade',
        category: 'dates-and-time',
        description: 'Don\'t use an apostrophe for decades. Write \'1980s\', not \'1980\'s\'.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/dates-and-time',
        check: function(text) {
            const issues = [];
            // Match decades with apostrophe before s (1980's, 2010's)
            const regex = /\b(\d{4})'s\b/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const replacement = match[1] + 's';
                issues.push({
                    found: match[0],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'time-12-ambiguous',
        name: '12 am or 12 pm',
        category: 'dates-and-time',
        description: 'Use \'noon\', \'midday\' or \'midnight\' instead of \'12\u00A0am\' or \'12\u00A0pm\' to avoid confusion.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/dates-and-time',
        check: function(text) {
            const issues = [];
            // Match 12 am, 12 pm, 12:00 am, 12:00 pm
            const regex = /\b12(?::00)?\s*(am|pm)\b/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const ampm = match[1].toLowerCase();
                const suggestion = ampm === 'am' ? 'midnight' : 'noon or midday';
                issues.push({
                    found: match[0],
                    suggestion: suggestion,
                    // No autoFix - user should choose between noon/midday
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'time-full-stop',
        name: 'Full stop in time',
        category: 'dates-and-time',
        description: 'Use a colon between hours and minutes, not a full stop. Write \'10:30\u00A0am\', not \'10.30\u00A0am\'.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/dates-and-time',
        check: function(text) {
            const issues = [];
            // Match time with full stop (10.30 am, 2.45 pm)
            const regex = /\b(\d{1,2})\.(\d{2})\s*(am|pm)\b/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const replacement = match[1] + ':' + match[2] + '\u00A0' + match[3].toLowerCase();
                issues.push({
                    found: match[0],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'time-redundant-ampm',
        name: 'Redundant am/pm qualifier',
        category: 'dates-and-time',
        description: 'Don\'t use \'am\' or \'pm\' with words that duplicate their meaning, such as \'morning\' or \'afternoon\'.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/dates-and-time',
        check: function(text) {
            const issues = [];
            // Match "10 am in the morning", "10:30 am this morning", "6 pm in the evening", etc.
            const patterns = [
                { regex: /\b(\d{1,2}(?:[.:]\d{2})?\s*am)\s+(?:in the |this )?morning\b/gi },
                { regex: /\b(\d{1,2}(?:[.:]\d{2})?\s*pm)\s+(?:in the |this )?(?:afternoon|evening)\b/gi }
            ];
            for (const pattern of patterns) {
                let match;
                while ((match = pattern.regex.exec(text)) !== null) {
                    issues.push({
                        found: match[0],
                        suggestion: match[1],
                        autoFix: match[1],
                        position: match.index,
                        rule: this
                    });
                }
            }
            return issues;
        }
    },
    {
        id: 'date-comma-after-day',
        name: 'Comma after day name',
        category: 'dates-and-time',
        description: 'Don\'t use a comma after the day name in dates. Write \'Thursday 31 December\', not \'Thursday, 31 December\'.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/dates-and-time',
        check: function(text) {
            const issues = [];
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            // Match day name followed by comma and a number
            const dayPattern = days.join('|');
            const regex = new RegExp('\\b(' + dayPattern + '),\\s+(\\d{1,2})\\b', 'gi');
            let match;
            while ((match = regex.exec(text)) !== null) {
                const replacement = match[1] + ' ' + match[2];
                issues.push({
                    found: match[0],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'date-slash-year-span',
        name: 'Forward slash in year span',
        category: 'dates-and-time',
        description: 'Use an en dash for year spans, not a forward slash. Write \'2018–19\', not \'2018/19\'.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/dates-and-time',
        check: function(text) {
            const issues = [];
            // Match year spans with forward slash (2018/19, 2020/2021)
            const regex = /\b(\d{4})\/(\d{2,4})\b/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const startYear = parseInt(match[1]);
                const endPart = match[2];
                // Check if it looks like a year span (not a date like 4/6/2021)
                if (startYear >= 1800 && startYear <= 2100) {
                    const replacement = match[1] + '–' + endPart;
                    issues.push({
                        found: match[0],
                        suggestion: replacement,
                        autoFix: replacement,
                        position: match.index,
                        rule: this
                    });
                }
            }
            return issues;
        }
    },
    {
        id: 'time-confusing-bi',
        name: 'Confusing \'bi\' time term',
        category: 'dates-and-time',
        description: 'Avoid \'bimonthly\', \'biweekly\' and \'biannual\' as they can mean either \'every 2 [time periods]\' or \'twice per [time period]\'. Be specific instead.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/dates-and-time',
        check: function(text) {
            const issues = [];
            const biTerms = {
                'bimonthly': '\'every 2 months\' or \'twice a month\'',
                'biweekly': '\'every 2 weeks\' or \'twice a week\'',
                'biannual': '\'every 6 months\' or \'twice a year\'',
                'biannually': '\'every 6 months\' or \'twice a year\'',
                'biennially': '\'every 2 years\''
            };
            for (const [term, alternatives] of Object.entries(biTerms)) {
                const regex = new RegExp('\\b' + term + '\\b', 'gi');
                let match;
                while ((match = regex.exec(text)) !== null) {
                    issues.push({
                        found: match[0],
                        suggestion: 'Be specific: ' + alternatives,
                        // No autoFix - user must choose the intended meaning
                        position: match.index,
                        rule: this
                    });
                }
            }
            return issues;
        }
    },

    // ==================== HEADINGS RULES ====================
    {
        id: 'heading-title-case',
        name: 'Title case heading',
        category: 'headings',
        description: 'Use sentence case for headings, not title case. Only capitalise the first word and proper nouns. Note: you may need to adjust the suggested fix if the heading contains proper nouns.',
        link: 'https://www.stylemanual.gov.au/structuring-content/headings',
        check: function(text, headingLines, listLines, boldLines, italicLines, tableLines) {
            const issues = [];

            // Words that are typically lowercase in title case (so don't count them)
            const smallWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor',
                               'on', 'at', 'to', 'by', 'of', 'in', 'is', 'it', 'as', 'if'];

            // Common proper nouns/acronyms to exclude from counting
            const likelyProperNouns = ['australia', 'australian', 'government', 'monday',
                'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
                'january', 'february', 'march', 'april', 'may', 'june', 'july',
                'august', 'september', 'october', 'november', 'december'];

            // Split into lines
            const lines = text.split('\n');
            let position = 0;

            for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                const line = lines[lineIndex];
                const trimmed = line.trim();

                // Skip empty lines
                if (!trimmed) {
                    position += line.length + 1;
                    continue;
                }

                const hasHeadingStyle = headingLines && headingLines.has(lineIndex);
                const isListItem = listLines && listLines.has(lineIndex);

                // Skip list items unless they have a heading style (unusual but possible)
                if (isListItem && !hasHeadingStyle) {
                    position += line.length + 1;
                    continue;
                }

                // Heading heuristics:
                // - Short (under 12 words)
                // - Doesn't end with . ? ! ; , : (headings typically don't, and : often precedes lists)
                // - Not all caps (that's a different issue)
                const words = trimmed.split(/\s+/);
                const endsWithPunctuation = /[.?!;,:]$/.test(trimmed);
                const isAllCaps = trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);

                const isLikelyHeading = words.length >= 3 && words.length <= 12 && !endsWithPunctuation && !isAllCaps;

                // In Word mode (boldLines is defined): heuristic only fires for bold/italic paragraphs
                // that are not inside table cells. In browser mode: use heuristic as-is.
                const inWordMode = boldLines != null;
                const isInTable = tableLines && tableLines.has(lineIndex);
                const isBoldOrItalic = (boldLines && boldLines.has(lineIndex)) || (italicLines && italicLines.has(lineIndex));
                const heuristicOk = inWordMode ? (!isInTable && isBoldOrItalic) : true;

                if (hasHeadingStyle || (isLikelyHeading && heuristicOk)) {
                    // Count words that start with capitals (excluding first word and small words)
                    let capitalizedCount = 0;
                    let significantWords = 0;

                    for (let i = 1; i < words.length; i++) {
                        const word = words[i];
                        const wordLower = word.toLowerCase().replace(/[^a-z]/g, '');

                        // Skip small words and likely proper nouns
                        if (smallWords.includes(wordLower)) continue;
                        if (likelyProperNouns.includes(wordLower)) continue;
                        if (word === word.toUpperCase() && word.length <= 5) continue; // Likely acronym

                        significantWords++;

                        // Check if word starts with capital
                        if (/^[A-Z]/.test(word)) {
                            capitalizedCount++;
                        }
                    }

                    // If most significant words (after the first) are capitalised, likely title case
                    // Need at least 2 capitalised words and >50% of significant words capitalised
                    if (capitalizedCount >= 2 && significantWords >= 2 &&
                        capitalizedCount / significantWords >= 0.5) {
                        // Convert to sentence case: first letter caps, rest lowercase (except acronyms)
                        const sentenceCase = toSentenceCase(trimmed);
                        const issue = {
                            found: trimmed,
                            suggestion: sentenceCase,
                            autoFix: sentenceCase,
                            position: position + line.indexOf(trimmed),
                            rule: this
                        };
                        if (!hasHeadingStyle) {
                            issue.description = 'Is this a heading? If so, apply a heading style. Use sentence case for headings, not title case.';
                            issue.applyHeadingStyle = true;
                        }
                        issues.push(issue);
                    }
                }

                position += line.length + 1;
            }
            return issues;
        }
    },
    {
        id: 'heading-too-long',
        name: 'Heading too long',
        category: 'headings',
        description: 'Longer headings are more difficult to read and can be confusing. They might also suggest that you have too many ideas in a section.',
        link: 'https://www.stylemanual.gov.au/structuring-content/headings',
        check: function(text, headingLines, listLines, boldLines, italicLines, tableLines) {
            const issues = [];
            const lines = text.split('\n');
            let position = 0;

            for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                const line = lines[lineIndex];
                const trimmed = line.trim();

                // Skip empty lines
                if (!trimmed) {
                    position += line.length + 1;
                    continue;
                }

                const hasHeadingStyle = headingLines && headingLines.has(lineIndex);
                const isListItem = listLines && listLines.has(lineIndex);

                // Skip list items unless they have a heading style
                if (isListItem && !hasHeadingStyle) {
                    position += line.length + 1;
                    continue;
                }

                // Heading heuristics: short-ish line, doesn't end with sentence punctuation
                const words = trimmed.split(/\s+/);
                const endsWithPunctuation = /[.?!;,:]$/.test(trimmed);

                // Consider it a heading if it's 3-20 words and doesn't end with punctuation,
                // or if it has a Word heading style applied
                const isLikelyHeading = words.length >= 3 && words.length <= 20 && !endsWithPunctuation;

                const inWordMode = boldLines != null;
                const isInTable = tableLines && tableLines.has(lineIndex);
                const isBoldOrItalic = (boldLines && boldLines.has(lineIndex)) || (italicLines && italicLines.has(lineIndex));
                const heuristicOk = inWordMode ? (!isInTable && isBoldOrItalic) : true;

                if (hasHeadingStyle || (isLikelyHeading && heuristicOk)) {
                    if (trimmed.length > 70) {
                        const issue = {
                            found: trimmed,
                            suggestion: 'This heading is ' + trimmed.length + ' characters. Keep headings to 70 characters or fewer',
                            // No autoFix - user must rewrite
                            position: position + line.indexOf(trimmed),
                            rule: this
                        };
                        if (!hasHeadingStyle) {
                            issue.description = 'Is this a heading? If so, apply a heading style. Keep headings to 70 characters or fewer.';
                        }
                        issues.push(issue);
                    }
                }

                position += line.length + 1;
            }
            return issues;
        }
    },
    {
        id: 'heading-full-stop',
        name: 'Full stop at end of heading',
        category: 'headings',
        description: 'Don\'t use a full stop to end headings. Even if the heading is a sentence, it doesn\'t need a full stop at the end.',
        link: 'https://www.stylemanual.gov.au/structuring-content/headings',
        check: function(text, headingLines, listLines, boldLines, italicLines, tableLines) {
            const issues = [];
            const lines = text.split('\n');
            let position = 0;

            // Pattern to detect list item markers at start of line (including with tabs)
            // Matches: bullet chars, numbered lists (1. 1) a. a)), or lines starting with tab/spaces then text
            const bulletPattern = /^[\t ]*[•●○◦▪▸►→‣⁃\-\*]\s*|^[\t ]*\d+[.)]\s|^[\t ]*[a-z][.)]\s/i;

            // Track consecutive short lines ending with full stops (likely a list)
            let consecutiveShortLines = 0;

            for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                const line = lines[lineIndex];
                const trimmed = line.trim();

                // Skip empty lines
                if (!trimmed) {
                    position += line.length + 1;
                    consecutiveShortLines = 0;
                    continue;
                }

                const hasHeadingStyle = headingLines && headingLines.has(lineIndex);
                const isListItem = listLines && listLines.has(lineIndex);

                // Skip list items (Word-detected or text pattern) unless they have a heading style
                if (!hasHeadingStyle && (isListItem || bulletPattern.test(line))) {
                    position += line.length + 1;
                    consecutiveShortLines++;
                    continue;
                }

                // Heading heuristics: short line ending with full stop (but not ? or !)
                const words = trimmed.split(/\s+/);

                // Skip consecutive-line heuristic if the line has a heading style
                if (!hasHeadingStyle) {
                    if (words.length >= 2 && words.length <= 12 && /\.$/.test(trimmed)) {
                        consecutiveShortLines++;
                        if (consecutiveShortLines >= 2) {
                            position += line.length + 1;
                            continue;
                        }
                    } else {
                        consecutiveShortLines = 0;
                    }
                }

                // Flag if it ends with a full stop and is either a likely heading or has a heading style
                const endsWithFullStop = /\.$/.test(trimmed) && !/\.{2,}$/.test(trimmed);

                if (endsWithFullStop) {
                    const isLikelyHeading = words.length >= 2 && words.length <= 10 && !/^[a-z]/.test(trimmed);

                    const inWordMode = boldLines != null;
                    const isInTable = tableLines && tableLines.has(lineIndex);
                    const isBoldOrItalic = (boldLines && boldLines.has(lineIndex)) || (italicLines && italicLines.has(lineIndex));
                    const heuristicOk = inWordMode ? (!isInTable && isBoldOrItalic) : true;

                    if (hasHeadingStyle || (isLikelyHeading && heuristicOk)) {
                        const replacement = trimmed.slice(0, -1);
                        const issue = {
                            found: trimmed,
                            suggestion: replacement,
                            autoFix: replacement,
                            position: position + line.indexOf(trimmed),
                            rule: this
                        };
                        if (!hasHeadingStyle) {
                            issue.description = 'Is this a heading? If so, apply a heading style. Don\'t use a full stop to end headings.';
                            issue.applyHeadingStyle = true;
                        }
                        issues.push(issue);
                    }
                }

                position += line.length + 1;
            }
            return issues;
        }
    },
    {
        id: 'heading-all-caps',
        name: 'All caps heading',
        category: 'headings',
        description: 'Don\'t write headings in all capital letters as users could misread words. For example, \'ACT\' could be \'act\' (the verb) rather than the initialism for the Australian Capital Territory.',
        link: 'https://www.stylemanual.gov.au/structuring-content/headings',
        check: function(text, headingLines, listLines, boldLines, italicLines, tableLines) {
            const issues = [];
            const lines = text.split('\n');
            let position = 0;

            for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                const line = lines[lineIndex];
                const trimmed = line.trim();

                // Skip empty lines
                if (!trimmed) {
                    position += line.length + 1;
                    continue;
                }

                const hasHeadingStyle = headingLines && headingLines.has(lineIndex);
                const isListItem = listLines && listLines.has(lineIndex);

                // Skip list items unless they have a heading style
                if (isListItem && !hasHeadingStyle) {
                    position += line.length + 1;
                    continue;
                }

                // Check if line is all caps (and has letters)
                const hasLetters = /[A-Z]/.test(trimmed);
                const isAllCaps = trimmed === trimmed.toUpperCase() && hasLetters;
                const words = trimmed.split(/\s+/);

                // Consider it a heading if it's 2-12 words, all caps, or has a heading style and is all caps
                const isLikelyHeading = isAllCaps && words.length >= 2 && words.length <= 12;

                const inWordMode = boldLines != null;
                const isInTable = tableLines && tableLines.has(lineIndex);
                const isBoldOrItalic = (boldLines && boldLines.has(lineIndex)) || (italicLines && italicLines.has(lineIndex));
                const heuristicOk = inWordMode ? (!isInTable && isBoldOrItalic) : true;

                if (isAllCaps && (hasHeadingStyle || (isLikelyHeading && heuristicOk))) {
                    // Convert to sentence case
                    const sentenceCase = toSentenceCase(trimmed);
                    const issue = {
                        found: trimmed,
                        suggestion: sentenceCase,
                        autoFix: sentenceCase,
                        position: position + line.indexOf(trimmed),
                        rule: this
                    };
                    if (!hasHeadingStyle) {
                        issue.description = 'Is this a heading? If so, apply a heading style. Don\'t write headings in all capital letters.';
                        issue.applyHeadingStyle = true;
                    }
                    issues.push(issue);
                }

                position += line.length + 1;
            }
            return issues;
        }
    },

    {
        id: 'heading-bold-not-styled',
        name: 'Bold text without heading style',
        category: 'headings',
        description: 'Is this a heading? If so, apply a heading style. Heading styles make documents accessible and allow readers to navigate using the headings panel.',
        link: 'https://www.stylemanual.gov.au/structuring-content/headings',
        check: function(text, headingLines, listLines, boldLines, italicLines, tableLines) {
            const issues = [];
            if (!boldLines || boldLines.size === 0) return issues;

            const lines = text.split('\n');
            let position = 0;

            for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                const line = lines[lineIndex];
                const trimmed = line.trim();

                if (!trimmed) {
                    position += line.length + 1;
                    continue;
                }

                const isBold = boldLines.has(lineIndex);
                const hasHeadingStyle = headingLines && headingLines.has(lineIndex);
                const isListItem = listLines && listLines.has(lineIndex);
                const isInTable = tableLines && tableLines.has(lineIndex);

                // Only flag entirely-bold lines that don't already have a heading style and aren't in a table
                if (!isBold || hasHeadingStyle || isListItem || isInTable) {
                    position += line.length + 1;
                    continue;
                }

                const words = trimmed.split(/\s+/);
                const endsWithPunctuation = /[.?!;,:]$/.test(trimmed);
                const isAllCaps = trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);

                // Looks like a heading: 1-12 words, starts with capital, no sentence-ending
                // punctuation, not all-caps (that's handled by heading-all-caps)
                if (words.length >= 1 && words.length <= 12 &&
                    /^[A-Z]/.test(trimmed) &&
                    !endsWithPunctuation &&
                    !isAllCaps) {
                    issues.push({
                        found: trimmed,
                        suggestion: 'Apply Heading 2 style',
                        autoFix: trimmed,
                        applyHeadingStyle: true,
                        position: position + line.indexOf(trimmed),
                        rule: this
                    });
                }

                position += line.length + 1;
            }
            return issues;
        }
    },

    // ==================== LATIN ABBREVIATIONS ====================
    {
        id: 'latin-eg',
        name: 'Latin abbreviation: e.g.',
        category: 'abbreviations',
        description: 'Use \'for example\' instead of \'e.g.\' in general content. Latin abbreviations can be unclear to some readers.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/shortened-words-and-phrases/latin-shortened-forms',
        check: function(text) {
            const issues = [];
            // Match e.g. with optional comma after
            const regex = /\be\.g\.(?:,)?/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const replacement = 'for example,';
                issues.push({
                    found: match[0],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'latin-ie',
        name: 'Latin abbreviation: i.e.',
        category: 'abbreviations',
        description: 'Use \'that is\' instead of \'i.e.\' in general content. Latin abbreviations can be unclear to some readers.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/shortened-words-and-phrases/latin-shortened-forms',
        check: function(text) {
            const issues = [];
            const regex = /\bi\.e\.(?:,)?/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const replacement = 'that is' + (match[0].endsWith(',') ? ',' : '');
                issues.push({
                    found: match[0],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'latin-etc',
        name: 'Latin abbreviation: etc.',
        category: 'abbreviations',
        description: 'Use \'and so on\' instead of \'etc.\' in general content. Latin abbreviations can be unclear to some readers.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/shortened-words-and-phrases/latin-shortened-forms',
        check: function(text) {
            const issues = [];
            const regex = /\betc\.?(?!\w)/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const afterPos = match.index + match[0].length;
                const after = text.substring(afterPos, afterPos + 3);

                // Check if etc. is at end of sentence:
                // - followed by space then capital letter
                // - followed by newline
                // - at end of string
                // - followed by closing quote/bracket then sentence-end indicator
                const atEndOfSentence = /^\s*$/.test(after) ||
                    /^\s+[A-Z]/.test(after) ||
                    /^[\s]*[\r\n]/.test(after) ||
                    /^['"'"\)\]]\s*$/.test(after) ||
                    /^['"'"\)\]]\s+[A-Z]/.test(after);

                // If etc. ends with period and is at end of sentence, keep the period
                const hasPeriod = match[0].endsWith('.');
                const replacement = (hasPeriod && atEndOfSentence) ? 'and so on.' : 'and so on';

                issues.push({
                    found: match[0],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'latin-etal',
        name: 'Latin abbreviation: et al.',
        category: 'abbreviations',
        description: 'Use \'and others\' instead of \'et al.\' in general content. Latin abbreviations can be unclear to some readers. Note: \'et al.\' is acceptable in academic references.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/shortened-words-and-phrases/latin-shortened-forms',
        check: function(text) {
            const issues = [];
            const regex = /\bet\s+al\.?/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const end = match.index + match[0].length;
                const after = text.substring(end, Math.min(text.length, end + 12));
                // RF-01: 'et al.' is correct in author-date citations.
                // Skip 'Smith et al. (2008)' and 'Smith et al., 2008'
                if (/^[.,]?\s*\(?\s*(?:19|20)\d\d/.test(after)) continue;
                // Skip citations inside parentheses: '(Smith et al. 2008)'
                const lastOpen = text.lastIndexOf('(', match.index);
                if (lastOpen !== -1) {
                    const between = text.substring(lastOpen, match.index);
                    const closeAfter = text.indexOf(')', end);
                    if (!between.includes(')') && closeAfter !== -1 &&
                        closeAfter - end < 60 &&
                        /(?:19|20)\d\d/.test(text.substring(end, closeAfter))) continue;
                }
                issues.push({
                    found: match[0],
                    suggestion: 'and others',
                    // No autoFix - 'et al.' is acceptable in academic references
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'latin-nb',
        name: 'Latin abbreviation: N.B.',
        category: 'abbreviations',
        description: 'Use \'note\' instead of \'N.B.\' in general content. Latin abbreviations can be unclear to some readers.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/shortened-words-and-phrases/latin-shortened-forms',
        check: function(text) {
            const issues = [];
            const regex = /\bN\.?B\.?:?\s?/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                issues.push({
                    found: match[0],
                    suggestion: 'Note: ',
                    autoFix: 'Note: ',
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },

    // ==================== ABBREVIATIONS ====================
    {
        id: 'abbrev-month-full-stop',
        name: 'Full stop in month abbreviation',
        category: 'abbreviations',
        description: 'Don\'t put a full stop after abbreviations. Write \'Jan\', not \'Jan.\' (unless the abbreviation ends a sentence).',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/shortened-words-and-phrases/abbreviations',
        check: function(text) {
            const issues = [];
            // Match month abbreviations with trailing full stop
            const months = 'Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec';
            const regex = new RegExp('\\b(' + months + ')\\.(?!\\s*$)(?![\\s]*[A-Z])', 'g');
            let match;
            while ((match = regex.exec(text)) !== null) {
                const abbrev = match[1];
                const afterPos = match.index + match[0].length;
                const after = text.substring(afterPos, afterPos + 3);

                // Skip if this ends a sentence (followed by space + capital, or end of text/line)
                // The full stop is legitimate sentence-ending punctuation
                if (/^\s*$/.test(after) || /^\s+[A-Z]/.test(after) || /^[\s]*[\r\n]/.test(after)) {
                    continue;
                }

                issues.push({
                    found: match[0],
                    suggestion: abbrev,
                    autoFix: abbrev,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'abbrev-day-full-stop',
        name: 'Full stop in day abbreviation',
        category: 'abbreviations',
        description: 'Don\'t put a full stop after abbreviations. Write \'Mon\', not \'Mon.\' (unless the abbreviation ends a sentence).',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/shortened-words-and-phrases/abbreviations',
        check: function(text) {
            const issues = [];
            // Match day abbreviations with trailing full stop
            const days = 'Mon|Tue|Tues|Wed|Thu|Thur|Thurs|Fri|Sat|Sun';
            const regex = new RegExp('\\b(' + days + ')\\.', 'g');
            let match;
            while ((match = regex.exec(text)) !== null) {
                const abbrev = match[1];
                const afterPos = match.index + match[0].length;
                const after = text.substring(afterPos, afterPos + 3);

                // Skip if this ends a sentence
                if (/^\s*$/.test(after) || /^\s+[A-Z]/.test(after) || /^[\s]*[\r\n]/.test(after)) {
                    continue;
                }

                issues.push({
                    found: match[0],
                    suggestion: abbrev,
                    autoFix: abbrev,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'abbrev-common-full-stop',
        name: 'Full stop in common abbreviation',
        category: 'abbreviations',
        description: 'Don\'t put a full stop after abbreviations (unless the abbreviation ends a sentence).',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/shortened-words-and-phrases/abbreviations',
        check: function(text) {
            const issues = [];
            // Common abbreviations that shouldn't have full stops
            // Excludes: n.d. (no date - exception), scientific name abbreviations
            const abbrevs = [
                // Honorifics and titles
                'Dr', 'Mr', 'Mrs', 'Ms', 'Mx', 'Prof', 'Rev', 'Hon', 'Sr', 'Jr',
                // Common abbreviations
                'para', 'paras', 'vol', 'vols', 'misc', 'app', 'apps',
                'cont', 'dept', 'depts', 'govt', 'govts', 'approx',
                'assn', 'ave', 'bldg', 'blvd', 'corp', 'est', 'ext',
                'inc', 'intl', 'max', 'min', 'natl', 'no', 'nos',
                'org', 'pt', 'pts', 'qty', 'ref', 'refs',
                'tel', 'temp', 'yr', 'yrs', 'ed', 'eds', 'fig', 'figs'
            ];
            const pattern = abbrevs.join('|');
            const regex = new RegExp('\\b(' + pattern + ')\\.', 'gi');
            let match;
            while ((match = regex.exec(text)) !== null) {
                const abbrev = match[1];
                const afterPos = match.index + match[0].length;
                const after = text.substring(afterPos, afterPos + 3);

                // Skip if this ends a sentence
                if (/^\s*$/.test(after) || /^\s+[A-Z]/.test(after) || /^[\s]*[\r\n]/.test(after)) {
                    continue;
                }

                // Preserve original case
                issues.push({
                    found: match[0],
                    suggestion: abbrev,
                    autoFix: abbrev,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },

    // ==================== WATCH WORDS ====================
    {
        id: 'watch-words',
        name: 'Watch words',
        category: 'readability',
        description: 'Consider replacing this word or phrase with a plain language alternative.',
        link: 'https://www.stylemanual.gov.au/writing-and-designing-content/clear-language-and-writing-style/plain-language-and-word-choice',
        check: function(text) {
            const issues = [];
            for (const [watchWord, suggestion] of Object.entries(WATCH_WORDS)) {
                // Escape special regex characters in the watch word
                const escaped = watchWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp('\\b' + escaped + '\\b', 'gi');
                let match;
                while ((match = regex.exec(text)) !== null) {
                    // Extract replacement options from the suggestion (words in single quotes)
                    const replacementMatches = suggestion.match(/'([^']+)'/g);
                    const replacements = replacementMatches
                        ? replacementMatches.map(m => m.replace(/'/g, ''))
                        : [];
                    issues.push({
                        found: match[0],
                        suggestion: suggestion,
                        replacements: replacements,
                        position: match.index,
                        matchWholeWord: true,
                        groupId: 'watch-words:' + match[0].toLowerCase(),
                        rule: this
                    });
                }
            }
            return issues;
        }
    },

    // ==================== AMPERSAND RULE ====================
    {
        id: 'punct-ampersand',
        name: 'Ampersand in body text',
        category: 'punctuation',
        description: 'Use \'and\' instead of \'&\' in body text. Ampersands are acceptable in proper names (for example, \'AT&T\') and some abbreviations (for example, \'R&D\').',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/punctuation',
        check: function(text) {
            const issues = [];
            // Match & surrounded by spaces (body text usage)
            // This avoids catching things like AT&T, R&D, etc.
            const regex = /\s&\s/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                issues.push({
                    found: '&',
                    suggestion: 'and',
                    autoFix: 'and',
                    position: match.index + 1, // +1 to point at the & not the space
                    rule: this
                });
            }
            return issues;
        }
    },

    // ==================== ORDINALS RULES ====================
    {
        id: 'numbers-ordinal-words',
        name: 'Ordinal numeral instead of word',
        category: 'numbers-and-measurements',
        description: 'Use words for ordinals up to \'ninth\'. Use numerals for 10th and above. Exceptions: centuries (\'1st century\'), reference editions (\'2nd edn\') and organisation names.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/ordinal-numbers',
        check: function(text) {
            const issues = [];
            const ordinalMap = {
                '1st': 'first', '2nd': 'second', '3rd': 'third',
                '4th': 'fourth', '5th': 'fifth', '6th': 'sixth',
                '7th': 'seventh', '8th': 'eighth', '9th': 'ninth'
            };

            // Match standalone 1st-9th (not preceded by another digit)
            const regex = /(?<!\d)(1st|2nd|3rd|4th|5th|6th|7th|8th|9th)\b/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const found = match[1];
                const pos = match.index;
                const after = text.substring(pos + found.length, Math.min(text.length, pos + found.length + 30));

                // Skip centuries (1st century, 9th-century)
                if (/^\s*[-\u2010\u2011]?\s*centur/i.test(after)) continue;

                // Skip dates (followed by month name) - already handled by date-ordinal-in-date
                if (/^\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept?|Oct|Nov|Dec)\b/i.test(after)) continue;

                // Skip reference editions (2nd edn, 3rd ed., 1st edition)
                if (/^\s+(?:edn|ed\.|edition)\b/i.test(after)) continue;

                const replacement = ordinalMap[found.toLowerCase()];
                issues.push({
                    found: found,
                    suggestion: replacement,
                    autoFix: replacement,
                    position: pos,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'punct-superscript-ordinal',
        name: 'Superscript ordinal',
        category: 'numbers-and-measurements',
        description: 'Don\'t write ordinal suffixes in superscript. Superscript may not be accessible to people who use screen readers. Use words for ordinals up to \'ninth\' and plain text numerals for 10th and above.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/ordinal-numbers',
        check: function(text) {
            const issues = [];
            const ordinalWords = {
                1: 'first', 2: 'second', 3: 'third', 4: 'fourth', 5: 'fifth',
                6: 'sixth', 7: 'seventh', 8: 'eighth', 9: 'ninth'
            };
            // Match numbers followed by superscript ordinal indicators
            // Superscript characters: ˢ (U+02E2), ᵗ (U+1D57), ⁿ (U+207F), ᵈ (U+1D48), ʳ (U+02B3), ʰ (U+02B0)
            const regex = /(\d+)(ˢᵗ|ⁿᵈ|ʳᵈ|ᵗʰ)/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const num = match[1];
                const numInt = parseInt(num);
                const superscript = match[2];
                let plain;
                switch(superscript) {
                    case 'ˢᵗ': plain = 'st'; break;
                    case 'ⁿᵈ': plain = 'nd'; break;
                    case 'ʳᵈ': plain = 'rd'; break;
                    case 'ᵗʰ': plain = 'th'; break;
                    default: plain = superscript;
                }

                let replacement;
                const after = text.substring(match.index + match[0].length, match.index + match[0].length + 20);
                const isCentury = /^\s*[-\u2010\u2011]?\s*centur/i.test(after);

                if (numInt >= 1 && numInt <= 9 && !isCentury) {
                    // For 1-9 (not centuries), suggest the word form directly
                    replacement = ordinalWords[numInt];
                } else {
                    // For 10+ or centuries, use plain text numeral + suffix
                    replacement = num + plain;
                }

                issues.push({
                    found: match[0],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },

    // ==================== TIME ZONE RULE ====================
    {
        id: 'date-timezone-position',
        name: 'Time zone before time',
        category: 'dates-and-time',
        description: 'Write the time zone after the time, not before. For example, \'13:45 AEST\', not \'AEST 13:45\'.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/dates-and-time',
        check: function(text) {
            const issues = [];
            // Common Australian and international time zones
            const timezones = ['AEST', 'AEDT', 'ACST', 'ACDT', 'AWST', 'AWDT', 'UTC', 'GMT', 'EST', 'EDT', 'CST', 'CDT', 'PST', 'PDT'];
            const tzPattern = timezones.join('|');
            // Match timezone followed by time (12-hour or 24-hour format)
            const regex = new RegExp('\\b(' + tzPattern + ')\\s+(\\d{1,2}[:.][0-5]\\d(?:\\s*[ap]\\.?m\\.?)?)\\b', 'gi');
            let match;
            while ((match = regex.exec(text)) !== null) {
                const tz = match[1].toUpperCase();
                const time = match[2];
                const replacement = time + '\u00A0' + tz;
                issues.push({
                    found: match[0],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },

    // ==================== GOVERNMENT TERMS ====================
    {
        id: 'govt-commonwealth-government',
        name: 'Commonwealth government',
        category: 'government-terms',
        description: 'Use \'Australian Government\', not \'Commonwealth government\', to refer to the national government of Australia.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/names-and-terms/government-terms',
        check: function(text) {
            const issues = [];
            // Match "a Commonwealth government" or just "Commonwealth government"
            // Handle a/an article change when present
            const regex = /\b(an?\s+)?Commonwealth government\b/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const article = match[1];
                let found = match[0];
                let replacement;

                if (article) {
                    // Has article - need to change "a" to "an" for "Australian"
                    const articleLower = article.trim().toLowerCase();
                    if (articleLower === 'a') {
                        // "a Commonwealth" → "an Australian"
                        const isCapital = article.trim().charAt(0) === 'A';
                        replacement = (isCapital ? 'An ' : 'an ') + 'Australian Government';
                    } else {
                        // "an Commonwealth" (unusual but handle it) → "an Australian"
                        const isCapital = article.trim().charAt(0) === 'A';
                        replacement = (isCapital ? 'An ' : 'an ') + 'Australian Government';
                    }
                } else {
                    replacement = preserveCase(match[0], 'Australian Government');
                }

                issues.push({
                    found: found,
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'govt-minister-preposition',
        name: 'Minister of (wrong preposition)',
        category: 'government-terms',
        description: 'Use \'Minister for\', not \'Minister of\', when referring to a minister\'s portfolio.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/names-and-terms/government-terms',
        check: function(text) {
            const issues = [];
            // Match "Minister of [Portfolio]" - portfolio typically starts with capital
            const regex = /\bMinister of ([A-Z][a-zA-Z]*(?:\s+(?:and\s+)?[A-Z][a-zA-Z]*)*)\b/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const portfolio = match[1];
                const replacement = 'Minister for ' + portfolio;
                issues.push({
                    found: match[0],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'govt-secretary-preposition',
        name: 'Secretary for (wrong preposition)',
        category: 'government-terms',
        description: 'Use \'Secretary of\', not \'Secretary for\', when referring to a departmental secretary.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/names-and-terms/government-terms',
        check: function(text) {
            const issues = [];
            // Match "Secretary for the Department" or "Secretary for [Department Name]"
            const regex = /\bSecretary for (the Department|[A-Z][a-zA-Z]*(?:\s+[a-zA-Z]+)*)\b/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const dept = match[1];
                const replacement = 'Secretary of ' + dept;
                issues.push({
                    found: match[0],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'govt-generic-department',
        name: 'Generic department reference',
        category: 'government-terms',
        description: 'Use lower case for generic references to departments. Write \'the department\', not \'the Department\'.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/names-and-terms/government-terms',
        check: function(text) {
            const issues = [];
            // Match "the Department" NOT followed by "of" (which would indicate a formal name)
            const regex = /\bthe Department\b(?!\s+of\b)/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                issues.push({
                    found: match[0],
                    suggestion: 'the department',
                    autoFix: 'the department',
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'govt-generic-minister',
        name: 'Generic minister reference',
        category: 'government-terms',
        description: 'Use lower case for generic references to ministers. Write \'the minister\', not \'the Minister\'.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/names-and-terms/government-terms',
        check: function(text) {
            const issues = [];
            // Match "the Minister" NOT followed by "for" (which would indicate a formal title)
            const regex = /\bthe Minister\b(?!\s+for\b)/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                issues.push({
                    found: match[0],
                    suggestion: 'the minister',
                    autoFix: 'the minister',
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'govt-generic-agency',
        name: 'Generic government body reference',
        category: 'government-terms',
        description: 'Use lower case for generic references to government bodies (for example, \'the agency\', \'the board\', \'the commission\').',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/names-and-terms/government-terms',
        check: function(text) {
            const issues = [];
            // Match "the [Term]" when standalone (generic reference)
            // Don't flag if followed by "of", "for", or another capital letter (formal name)
            const terms = [
                'Agency', 'Alliance', 'Archives', 'Authority',
                'Board', 'Body', 'Bureau',
                'Centre', 'College', 'Commission', 'Committee', 'Corporation', 'Council', 'Court',
                'Directorate', 'Division',
                'Facility', 'Federation', 'Force', 'Forum', 'Foundation',
                'Gallery', 'Government',
                'Inspectorate', 'Institute',
                'Laboratory', 'Library',
                'Museum',
                'Network',
                'Office', 'Organisation',
                'Panel', 'Partnership', 'Program',
                'Registry', 'Regulator',
                'Scheme', 'School', 'Secretariat', 'Service',
                'Taskforce', 'Tribunal', 'Trust',
                'Unit', 'University'
            ];
            for (const term of terms) {
                const regex = new RegExp('\\bthe ' + term + '\\b(?!\\s+(?:of|for|[A-Z]))', 'g');
                let match;
                while ((match = regex.exec(text)) !== null) {
                    const replacement = 'the ' + term.toLowerCase();
                    issues.push({
                        found: match[0],
                        suggestion: replacement,
                        autoFix: replacement,
                        position: match.index,
                        rule: this
                    });
                }
            }
            return issues;
        }
    },

    // ==================== READABILITY RULES ====================
    {
        id: 'readability-sentence-length',
        name: 'Long sentence',
        category: 'readability',
        description: 'Sentences over 25 words can be harder to read. Consider breaking up this long sentence.',
        link: 'https://www.stylemanual.gov.au/accessible-and-inclusive-content/how-people-read',
        check: function(text) {
            const issues = [];

            // Split text into paragraphs first (paragraph breaks are sentence boundaries)
            const paragraphs = text.split(/\r?\n/);
            let currentPosition = 0;

            for (const paragraph of paragraphs) {
                if (!paragraph.trim()) {
                    currentPosition += paragraph.length + 1; // +1 for the newline
                    continue;
                }

                // Split paragraph into sentences using sentence-ending punctuation
                // Match sentences ending with . ! ? or end of paragraph
                const sentenceRegex = /[^.!?]+[.!?]+|[^.!?]+$/g;
                let match;

                while ((match = sentenceRegex.exec(paragraph)) !== null) {
                    const sentence = match[0].trim();
                    if (!sentence) continue;

                    // Count words (split on whitespace, filter out empty strings)
                    const words = sentence.split(/\s+/).filter(w => w.length > 0);
                    const wordCount = words.length;

                    if (wordCount > 25) {
                        // Use first 8 words for navigation (long sentences break Word search)
                        const searchText = words.slice(0, 8).join(' ');
                        issues.push({
                            found: sentence,
                            searchText: searchText,  // Short text for Word search navigation
                            suggestion: 'This sentence is ' + wordCount + ' words long. Consider breaking it up.',
                            position: currentPosition + match.index,
                            rule: this
                        });
                    }
                }

                currentPosition += paragraph.length + 1; // +1 for the newline
            }
            return issues;
        }
    },

    // ==================== LISTS ====================
    {
        id: 'list-semicolon',
        name: 'Semicolon at end of list item',
        category: 'lists',
        description: 'Don\'t use semicolons at the end of list items. Use minimal punctuation in lists.',
        link: 'https://www.stylemanual.gov.au/structuring-content/lists',
        check: function(text, headingLines, listLines) {
            const issues = [];
            const lines = text.split(/\r?\n/);
            const bulletPattern = /^[ \t]*([•●○◦▪▸\-\*]|\d+[.)]|[a-z][.)])\s*/i;
            let currentPos = 0;
            let prevWasListItem = false;
            let prevEndedWithSemicolon = false;
            let prevLineText = '';
            let prevLineStart = -1;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const isListItem = bulletPattern.test(line) || (listLines && listLines.has(i));

                if (isListItem && prevWasListItem && prevEndedWithSemicolon) {
                    issues.push({
                        found: ';',
                        suggestion: 'Remove the semicolon',
                        searchText: prevLineText,
                        autoFix: prevLineText.slice(0, -1).trimEnd(),
                        position: prevLineStart,
                        rule: this
                    });
                }

                if (isListItem) {
                    const trimmed = line.trimEnd();
                    prevEndedWithSemicolon = trimmed.endsWith(';');
                    prevLineText = trimmed;
                    prevLineStart = currentPos;
                } else {
                    prevEndedWithSemicolon = false;
                    prevLineText = '';
                }
                prevWasListItem = isListItem;
                currentPos += line.length + 1;
            }
            return issues;
        }
    },
    {
        id: 'list-trailing-comma',
        name: 'Comma at end of list item',
        category: 'lists',
        description: 'Don\'t use commas at the end of list items. Use minimal punctuation in lists.',
        link: 'https://www.stylemanual.gov.au/structuring-content/lists',
        check: function(text, headingLines, listLines) {
            const issues = [];
            const lines = text.split(/\r?\n/);
            const bulletPattern = /^[ \t]*([•●○◦▪▸\-\*]|\d+[.)]|[a-z][.)])\s*/i;
            let currentPos = 0;
            let prevWasListItem = false;
            let prevEndedWithComma = false;
            let prevLineText = '';
            let prevLineStart = -1;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const isListItem = bulletPattern.test(line) || (listLines && listLines.has(i));

                if (isListItem && prevWasListItem && prevEndedWithComma) {
                    issues.push({
                        found: ',',
                        suggestion: 'Remove the comma',
                        searchText: prevLineText,
                        autoFix: prevLineText.slice(0, -1).trimEnd(),
                        position: prevLineStart,
                        rule: this
                    });
                }

                if (isListItem) {
                    const trimmed = line.trimEnd();
                    prevEndedWithComma = trimmed.endsWith(',');
                    prevLineText = trimmed;
                    prevLineStart = currentPos;
                } else {
                    prevEndedWithComma = false;
                    prevLineText = '';
                }
                prevWasListItem = isListItem;
                currentPos += line.length + 1;
            }
            return issues;
        }
    },
    {
        id: 'list-and-or',
        name: '\'And\' or \'or\' at end of list item',
        category: 'lists',
        description: 'Don\'t use \'and\' or \'or\' at the end of list items. The bullet or number structure makes these unnecessary.',
        link: 'https://www.stylemanual.gov.au/structuring-content/lists',
        check: function(text, headingLines, listLines) {
            const issues = [];
            const lines = text.split(/\r?\n/);
            const bulletPattern = /^[ \t]*([•●○◦▪▸\-\*]|\d+[.)]|[a-z][.)])\s*/i;
            const andOrPattern = /\b(and|or)[;,]?[ \t]*$/i;
            let currentPos = 0;
            let prevWasListItem = false;
            let prevAndOrMatch = null;
            let prevLineText = '';
            let prevLineStart = -1;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const isListItem = bulletPattern.test(line) || (listLines && listLines.has(i));

                if (isListItem && prevWasListItem && prevAndOrMatch) {
                    const found = prevAndOrMatch[1];
                    // Remove trailing 'and'/'or' and any preceding comma/semicolon
                    const autoFix = prevLineText.replace(/[,;]?\s*\b(and|or)\b[;,]?\s*$/i, '').trimEnd();
                    issues.push({
                        found: found,
                        suggestion: 'Remove \'' + found + '\' from end of list item',
                        searchText: prevLineText,
                        autoFix: autoFix,
                        position: prevLineStart,
                        rule: this
                    });
                }

                if (isListItem) {
                    const trimmed = line.trimEnd();
                    prevAndOrMatch = andOrPattern.exec(trimmed);
                    prevLineText = trimmed;
                    prevLineStart = currentPos;
                } else {
                    prevAndOrMatch = null;
                    prevLineText = '';
                }
                prevWasListItem = isListItem;
                currentPos += line.length + 1;
            }
            return issues;
        }
    },
    {
        id: 'list-etc',
        name: '\'Etc.\' in list',
        category: 'lists',
        description: 'Don\'t write \'etc.\' at the end of a list to show the list is incomplete. Use a lead-in like \'including\' or \'for example\' instead.',
        link: 'https://www.stylemanual.gov.au/structuring-content/lists',
        check: function(text, headingLines, listLines) {
            const issues = [];
            // Match 'etc.' or 'etc' as a list item (after bullet/number marker)
            // Also match 'etc.' at end of a list item before a new bullet
            const patterns = [
                // etc. as standalone list item: "• etc." or "• etc" or "1. etc."
                /[•●○◦▪▸\-\*]\s*etc\.?(?:\s*\r?\n|$)/gi,
                /\d+[.)]\s*etc\.?(?:\s*\r?\n|$)/gi,
                /[a-z][.)]\s*etc\.?(?:\s*\r?\n|$)/gi,
                // etc. at end of list item (after semicolon or other punctuation)
                /[;,]\s*etc\.?(?:\s*\r?\n|$)/gi,
                // etc. at end of list item before another bullet
                /etc\.?[ \t]*\r?\n[ \t]*[•●○◦▪▸\-\*]/gi,
                /etc\.?[ \t]*\r?\n[ \t]*\d+[.)]\s/gi
            ];
            const flaggedPositions = new Set();
            for (const regex of patterns) {
                let match;
                while ((match = regex.exec(text)) !== null) {
                    // Find the position of 'etc' within the match
                    const etcPos = match[0].toLowerCase().indexOf('etc');
                    const pos = match.index + etcPos;
                    flaggedPositions.add(pos);
                    issues.push({
                        found: 'etc.',
                        suggestion: 'Remove \'etc.\' and use a lead-in like \'including\' or \'for example\' instead',
                        position: pos,
                        rule: this
                    });
                }
            }
            // Second pass: check Word-formatted list items for 'etc'
            if (listLines && listLines.size > 0) {
                const lines = text.split(/\r?\n/);
                let currentPos = 0;
                const etcPattern = /\betc\.?\b/gi;
                for (let i = 0; i < lines.length; i++) {
                    if (listLines.has(i)) {
                        let etcMatch;
                        etcPattern.lastIndex = 0;
                        while ((etcMatch = etcPattern.exec(lines[i])) !== null) {
                            const pos = currentPos + etcMatch.index;
                            if (!flaggedPositions.has(pos)) {
                                issues.push({
                                    found: 'etc.',
                                    suggestion: 'Remove \'etc.\' and use a lead-in like \'including\' or \'for example\' instead',
                                    position: pos,
                                    rule: this
                                });
                            }
                        }
                    }
                    currentPos += lines[i].length + 1;
                }
            }
            return issues;
        }
    },



    // ==================== NUMBERS AND MEASUREMENTS ====================
    {
        id: 'numbers-zero-one',
        name: 'Use words for zero and one',
        category: 'numbers-and-measurements',
        description: 'Write \'zero\' and \'one\' as words, not numerals. The numerals \'0\' and \'1\' can be hard to distinguish from letters in some fonts.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/choosing-numerals-or-words',
        check: function(text) {
            const issues = [];

            // Use word boundaries - \b matches between word and non-word characters
            // Digits are word characters, so \b0\b or \b1\b only matches standalone 0 or 1
            const regex = /\b([01])\b/g;
            let match;

            while ((match = regex.exec(text)) !== null) {
                const digit = match[1];
                const pos = match.index;

                // Extra safeguard: skip if adjacent to another digit (handles edge cases)
                const charBefore = pos > 0 ? text.charAt(pos - 1) : '';
                const charAfter = pos < text.length - 1 ? text.charAt(pos + 1) : '';
                if (/\d/.test(charBefore) || /\d/.test(charAfter)) continue;

                // Skip decimals (0.5, 1.5, etc.)
                if (charBefore === '.' || charAfter === '.') continue;

                // Skip comma-separated thousands (1,100 or 1,000,000)
                // Check if followed by comma+digits or preceded by digits+comma
                if (charAfter === ',' && /^\d/.test(text.charAt(pos + 2) || '')) continue;
                if (charBefore === ',' && /\d$/.test(text.charAt(pos - 2) || '')) continue;

                // Skip times and ratios (1:00 pm, 3:1)
                if (charAfter === ':' && /\d/.test(text.charAt(pos + 2) || '')) continue;
                if (charBefore === ':' && /\d/.test(text.charAt(pos - 2) || '')) continue;

                // Get surrounding context for additional checks
                const before = text.substring(Math.max(0, pos - 30), pos);
                const after = text.substring(pos + 1, Math.min(text.length, pos + 30));

                // Skip if preceded by currency symbols
                if (/[$€£¥]\s*$/.test(before)) continue;

                // Skip dates: digit followed by month name (1 January)
                if (/^\s*(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\b/i.test(after)) continue;

                // Skip if preceded by month name (January 1)
                if (/(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\s+$/i.test(before)) continue;

                // Skip year context (, 2024)
                if (/,\s*$/.test(before) && /^\s*\d{3}/.test(after)) continue;

                // Skip ordinals (1st, 1ˢᵗ with superscripts)
                if (/^(?:st|nd|rd|th)\b/i.test(after)) continue;
                if (/^[ˢⁿʳᵗᵈʰ]/.test(after)) continue;

                // Skip ranges (1-5, 1–5)
                if (/[–\-]$/.test(before) || /^[–\-]/.test(after)) continue;

                // Skip if preceded by stage/phase/section/chapter etc.
                if (/(?:stage|phase|section|chapter|step|part|level|tier|grade|year|version|volume|appendix|annex|figure|table|item|option|priority|round|wave|track|point|number|no\.?|#)\s*$/i.test(before)) continue;

                // Skip mathematical relationships (8 + 1 = 9, 1 < 2)
                if (/[+=\u00d7\u00f7<>\u2212]\s*$/.test(before) || /^\s*[+=\u00d7\u00f7<>\u2212]/.test(after)) continue;

                // Skip times - digit followed by am/pm
                if (/^\s*(?:am|pm)\b/i.test(after)) continue;

                // Skip large number qualifiers (1 million, 1 billion)
                if (/^\s*(?:million|billion|trillion)\b/i.test(after)) continue;

                // Skip percentage and measurements
                if (/^\s*(?:%|per\s*cent|km|m|cm|mm|kg|g|mg|mL|L|ha|°)\b/i.test(after)) continue;

                // All checks passed - this looks like a standalone 0 or 1
                const replacement = digit === '0' ? 'zero' : 'one';
                issues.push({
                    found: digit,
                    suggestion: replacement,
                    autoFix: replacement,
                    position: pos,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'numbers-words-to-numerals',
        name: 'Choosing numerals or words',
        category: 'numbers-and-measurements',
        description: 'Use numerals for numbers 2 and above in text. Write \'3 options\', not \'three options\'. Exceptions include the start of sentences, fractions and figures of speech.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/choosing-numerals-or-words',
        check: function(text) {
            const issues = [];

            // Number words to numeral mapping (2 through 90)
            const numberWords = {
                'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6,
                'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
                'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14,
                'fifteen': 15, 'sixteen': 16, 'seventeen': 17, 'eighteen': 18,
                'nineteen': 19, 'twenty': 20, 'thirty': 30, 'forty': 40,
                'fifty': 50, 'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90
            };

            const tensWords = ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
            const onesWords = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
            const onesValues = { 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9 };

            // Fraction denominators to skip (e.g. two-thirds, three-quarters)
            const fractionSuffixes = 'halves?|half|thirds?|quarters?|fifths?|sixths?|sevenths?|eighths?|ninths?|tenths?|fold';

            // Units of measurement (skip - already handled by numbers-measurement-words rule)
            const unitPattern = 'km|km\\/h|m|cm|mm|kg|g|mg|\u03BCg|mcg|mL|ml|L|ha|kW|MW|GW|kWh|MWh|Hz|kHz|MHz|GHz|KB|MB|GB|TB|Mbps|metres|meters|kilometres|kilometers|kilograms|grams|litres|liters|hectares|watts|degrees';

            // First pass: match compound numbers (twenty-one through ninety-nine)
            const tensPattern = tensWords.join('|');
            const onesPattern = onesWords.join('|');
            const compoundRegex = new RegExp('\\b(' + tensPattern + ')[-\u2010\u2011\u2012\u2013](' + onesPattern + ')\\b', 'gi');

            // Track ranges of compound matches to avoid double-flagging components
            const compoundRanges = [];

            let match;
            while ((match = compoundRegex.exec(text)) !== null) {
                const tensWord = match[1].toLowerCase();
                const onesWord = match[2].toLowerCase();
                const numeral = numberWords[tensWord] + onesValues[onesWord];
                const pos = match.index;

                // Skip if at start of sentence
                const beforeText = text.substring(Math.max(0, pos - 50), pos);
                if (pos === 0 || /^\s*$/.test(text.substring(0, pos)) ||
                    /[.!?]\s+$/.test(beforeText) || /\n\s*$/.test(beforeText)) continue;

                compoundRanges.push([pos, pos + match[0].length]);

                issues.push({
                    found: match[0],
                    suggestion: String(numeral),
                    autoFix: String(numeral),
                    position: pos,
                    rule: this
                });
            }

            // Second pass: match simple number words
            const simplePattern = Object.keys(numberWords).join('|');
            const simpleRegex = new RegExp('\\b(' + simplePattern + ')\\b', 'gi');

            while ((match = simpleRegex.exec(text)) !== null) {
                const word = match[1].toLowerCase();
                const numeral = numberWords[word];
                const pos = match.index;
                const end = pos + match[0].length;

                // Skip if part of a compound number already matched
                let isCompound = false;
                for (const [cStart, cEnd] of compoundRanges) {
                    if (pos >= cStart && end <= cEnd) {
                        isCompound = true;
                        break;
                    }
                }
                if (isCompound) continue;

                const after = text.substring(end, Math.min(text.length, end + 20));
                const before = text.substring(Math.max(0, pos - 20), pos);

                // Skip if part of an unmatched compound (hyphen-joined with tens/ones)
                if (new RegExp('^[-\u2010\u2011\u2012\u2013](' + onesPattern + ')\\b', 'i').test(after)) continue;
                if (new RegExp('(' + tensPattern + ')[-\u2010\u2011\u2012\u2013]$', 'i').test(before)) continue;

                // Skip if at start of sentence
                const beforeText = text.substring(Math.max(0, pos - 50), pos);
                if (pos === 0 || /^\s*$/.test(text.substring(0, pos)) ||
                    /[.!?]\s+$/.test(beforeText) || /\n\s*$/.test(beforeText)) continue;

                // Skip fractions (two-thirds, three-quarters, etc.)
                if (new RegExp('^[-\u2010\u2011](' + fractionSuffixes + ')\\b', 'i').test(after)) continue;

                // Skip possessive/contraction forms (figures of speech: "two's company")
                if (/^['\u2019]s\b/.test(after)) continue;

                // Skip if followed by hundred/thousand/million etc. (complex multi-word numbers)
                if (/^\s+(hundred|thousand|million|billion|trillion)\b/i.test(after)) continue;

                // Skip if preceded by hundred/thousand (e.g. "hundred and two")
                if (/(?:hundred|thousand)\s+(?:and\s+)?$/i.test(before)) continue;

                // Skip if followed by a unit of measurement (handled by other rule)
                if (new RegExp('^\\s+(' + unitPattern + ')\\b', 'i').test(after)) continue;

                issues.push({
                    found: match[0],
                    suggestion: String(numeral),
                    autoFix: String(numeral),
                    position: pos,
                    rule: this
                });
            }

            return issues;
        }
    },
    {
        id: 'numbers-percent-spelling',
        name: 'Percent with numeral',
        category: 'numbers-and-measurements',
        description: 'Use the percentage sign (%) with numerals. Write \'85%\', not \'85 percent\' or \'85 per cent\'.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/percentages',
        check: function(text) {
            const issues = [];
            // Match "number + percent" or "number + per cent" and suggest using %
            const regex = /(\d+)\s*(?:percent|per\s*cent)\b/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const num = match[1];
                const replacement = num + '%';
                issues.push({
                    found: match[0],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'numbers-percent-space',
        name: 'Space before percentage sign',
        category: 'numbers-and-measurements',
        description: 'Don\'t use a space between a number and the percentage sign. Write \'15%\', not \'15 %\'.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/percentages',
        check: function(text) {
            const issues = [];
            // Match number followed by space(s) and %
            const regex = /(\d)\s+%/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const replacement = match[1] + '%';
                issues.push({
                    found: match[0],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'numbers-leading-zero',
        name: 'Missing leading zero',
        category: 'numbers-and-measurements',
        description: 'Decimal values less than one should have a \'0\' before the decimal point. Write \'0.5\', not \'.5\'.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/fractions-and-decimals',
        check: function(text) {
            const issues = [];
            // Match decimal starting with . (not preceded by digit or another decimal point)
            const regex = /(?<![0-9.])\.(\d+)/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const replacement = '0.' + match[1];
                issues.push({
                    found: match[0],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'numbers-start-sentence',
        name: 'Numeral at start of sentence',
        category: 'numbers-and-measurements',
        description: 'Don\'t start a sentence with a numeral. Write the number in words, or rephrase the sentence.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/choosing-numerals-or-words',
        check: function(text, headingLines, listLines, boldLines, italicLines, tableLines) {
            const issues = [];
            // Match numeral at start of sentence (after . ! ? or start of text, followed by space and capital context)
            const regex = /(?:^|[.!?]\s+)(\d+)(?:\s+[a-zA-Z])/gm;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const num = match[1];
                const numInt = parseInt(num);
                const pos = match.index + match[0].indexOf(num);

                // Skip numerals in table cells
                if (tableLines && tableLines.size > 0) {
                    const lineIndex = text.substring(0, pos).split('\n').length - 1;
                    if (tableLines.has(lineIndex)) continue;
                }

                const before = text.substring(Math.max(0, pos - 30), pos);
                const after = text.substring(pos + num.length, pos + num.length + 20);

                // Skip if preceded by comma (like "Thursday, 15 August" - number is part of date, not start of sentence)
                if (/,\s*$/.test(before)) {
                    continue;
                }

                // Skip if this is a date (number followed by month name)
                if (/^\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\b/i.test(after)) {
                    continue;
                }

                // Skip if preceded by a preposition (mid-sentence date like "from 15 January")
                if (/(?:from|on|by|since|until|before|after|of|to)\s+$/i.test(before)) {
                    continue;
                }

                // Skip if part of a year range (preceded by year and dash, like "2025–26")
                if (/\d{4}[–\-]\s*$/.test(before)) {
                    continue;
                }

                // Skip if followed by a dash and more digits (start of year range like "2025–26")
                if (/^[–\-]\d+/.test(after)) {
                    continue;
                }

                // Skip if this looks like a year (4-digit number between 1900-2100)
                if (num.length === 4 && numInt >= 1900 && numInt <= 2100) {
                    continue;
                }

                // Only flag if it's a reasonable number to write out (up to 100)
                // Very large numbers should prompt rephrasing
                if (numInt <= 100) {
                    const words = numberToWords(numInt);
                    const capitalised = words.charAt(0).toUpperCase() + words.slice(1);
                    issues.push({
                        found: num,
                        suggestion: capitalised,
                        autoFix: capitalised,
                        position: pos,
                        rule: this
                    });
                } else {
                    issues.push({
                        found: num,
                        suggestion: 'Rephrase to avoid starting with a numeral',
                        position: pos,
                        rule: this
                    });
                }
            }
            return issues;
        }
    },
    {
        id: 'numbers-comma-thousands',
        name: 'Missing comma in large number',
        category: 'numbers-and-measurements',
        description: 'Use commas in numbers with 4 or more digits. Write \'2,500\', not \'2500\'.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/choosing-numerals-or-words',
        check: function(text) {
            const issues = [];
            // Match 4+ digit numbers without commas
            // Avoid: years (1900-2100), phone numbers, postcodes, ID numbers
            const regex = /\b(\d{4,})\b/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const num = match[1];
                const numInt = parseInt(num);

                // Skip if already has commas or is clearly a year
                if (num.includes(',')) continue;
                if (numInt >= 1800 && numInt <= 2100 && num.length === 4) continue;

                // Skip if it looks like a postcode (4 digits in Australia)
                if (num.length === 4) {
                    const before = text.substring(Math.max(0, match.index - 20), match.index).toLowerCase();
                    if (/(?:postcode|post code|zip|suburb|\b[A-Z]{2,3}\s+)$/i.test(before)) continue;
                }

                // Skip phone number patterns
                const before = text.substring(Math.max(0, match.index - 5), match.index);
                const after = text.substring(match.index + num.length, Math.min(text.length, match.index + num.length + 5));
                if (/(?:tel|phone|fax|call|mobile|\d)\s*$/i.test(before)) continue;
                if (/^\s*\d/.test(after)) continue; // Part of longer number sequence

                // Format with commas
                const formatted = numInt.toLocaleString('en-AU');
                if (formatted !== num) {
                    issues.push({
                        found: num,
                        suggestion: formatted,
                        autoFix: formatted,
                        position: match.index,
                        rule: this
                    });
                }
            }

            // NM-06: space-separated thousands ('6 500' -> '6,500')
            const spaceRegex = /\b(\d{1,3})((?:[  ]\d{3})+)\b/g;
            while ((match = spaceRegex.exec(text)) !== null) {
                const found = match[0];
                const end = match.index + found.length;
                const before = text.substring(Math.max(0, match.index - 25), match.index);
                const after = text.substring(end, Math.min(text.length, end + 5));
                // Skip if part of a longer digit sequence (phone numbers, IDs)
                if (/\d[  ]?$/.test(before)) continue;
                if (/^[  ]?\d/.test(after)) continue;
                // Skip labels followed by an independent number ('Figure 1 500 people')
                if (/(?:figure|table|section|chapter|part|page|appendix|box|step|no\.?|number)\s*$/i.test(before)) continue;
                // Skip phone-like contexts
                if (/(?:tel|phone|fax|call|mobile)[\s:.]*$/i.test(before)) continue;
                const joined = parseInt(found.replace(/[  ]/g, ''), 10);
                const withCommas = joined.toLocaleString('en-AU');
                issues.push({
                    found: found,
                    suggestion: withCommas,
                    autoFix: withCommas,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'numbers-measurement-words',
        name: 'Word number with unit symbol',
        category: 'numbers-and-measurements',
        description: 'Always use numerals with units of measurement. Write \'5\u00A0km\', not \'five\u00A0km\'.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/measurement-and-units',
        check: function(text) {
            const issues = [];
            const wordNumbers = {
                'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
                'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10',
                'eleven': '11', 'twelve': '12', 'fifteen': '15', 'twenty': '20',
                'thirty': '30', 'forty': '40', 'fifty': '50', 'hundred': '100'
            };
            // Common unit symbols
            const units = ['km', 'km/h', 'm', 'cm', 'mm', 'kg', 'g', 'mg', 'μg', 'mcg',
                          'mL', 'ml', 'L', 'l', 'ha', 'kW', 'MW', 'GW', 'kWh', 'MWh',
                          'Hz', 'kHz', 'MHz', 'GHz', 'KB', 'MB', 'GB', 'TB', 'Mbps',
                          'metres', 'meters', 'kilometres', 'kilometers', 'kilograms',
                          'grams', 'litres', 'liters', 'hectares', 'watts', 'degrees'];

            for (const [word, numeral] of Object.entries(wordNumbers)) {
                const unitPattern = units.join('|');
                const regex = new RegExp('\\b(' + word + ')\\s+(' + unitPattern + ')\\b', 'gi');
                let match;
                while ((match = regex.exec(text)) !== null) {
                    const replacement = numeral + '\u00A0' + match[2];
                    issues.push({
                        found: match[0],
                        suggestion: replacement,
                        autoFix: replacement,
                        position: match.index,
                        rule: this
                    });
                }
            }
            return issues;
        }
    },
    {
        id: 'numbers-imperial-units',
        name: 'Imperial units',
        category: 'numbers-and-measurements',
        description: 'Australia uses the metric system. Consider using metric units unless you have a specific reason for imperial (for example, historical quotes, US audience).',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/measurement-and-units',
        check: function(text) {
            const issues = [];
            const imperialUnits = {
                'inches': 'centimetres (cm)',
                'inch': 'centimetres (cm)',
                'feet': 'metres (m)',
                'foot': 'metres (m)',
                'yards': 'metres (m)',
                'yard': 'metres (m)',
                'miles': 'kilometres (km)',
                'mile': 'kilometres (km)',
                'ounces': 'grams (g)',
                'ounce': 'grams (g)',
                'pounds': 'kilograms (kg)',
                'pound': 'kilograms (kg)',
                'gallons': 'litres (L)',
                'gallon': 'litres (L)',
                'pints': 'millilitres (mL)',
                'pint': 'millilitres (mL)',
                'quarts': 'litres (L)',
                'quart': 'litres (L)',
                'fahrenheit': 'Celsius',
                '°F': '°C'
            };

            for (const [imperial, metric] of Object.entries(imperialUnits)) {
                // Match the imperial unit preceded by a number
                const escaped = imperial.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp('\\b(\\d+(?:\\.\\d+)?\\s*)(' + escaped + ')\\b', 'gi');
                let match;
                while ((match = regex.exec(text)) !== null) {
                    // Don't auto-fix - just warn, as imperial may be intentional
                    issues.push({
                        found: match[0],
                        suggestion: 'Consider metric: ' + metric,
                        position: match.index,
                        rule: this
                    });
                }
            }
            return issues;
        }
    },

    // ==================== WORDY PHRASES ====================
    {
        id: 'wordy-phrases',
        name: 'Wordy phrase',
        category: 'readability',
        description: 'Consider replacing this wordy phrase with a plain language alternative.',
        link: 'https://www.stylemanual.gov.au/writing-and-designing-content/clear-language-and-writing-style/plain-language-and-word-choice',
        check: function(text) {
            const issues = [];
            for (const [phrase, suggestion] of Object.entries(WORDY_PHRASES)) {
                const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp('\\b' + escaped + '\\b', 'gi');
                let match;
                while ((match = regex.exec(text)) !== null) {
                    const replacementMatches = suggestion.match(/'([^']+)'/g);
                    const replacements = replacementMatches
                        ? replacementMatches.map(m => m.replace(/'/g, ''))
                        : [];
                    issues.push({
                        found: match[0],
                        suggestion: suggestion,
                        replacements: replacements,
                        position: match.index,
                        rule: this
                    });
                }
            }
            return issues;
        }
    },

    // ==================== ADDITIONAL PUNCTUATION ====================
    {
        id: 'punct-capital-after-colon',
        name: 'Capital letter after colon',
        category: 'punctuation',
        description: 'Use a lowercase letter after a colon (unless the word is a proper noun).',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/punctuation/colons',
        check: function(text, headingLines) {
            const issues = [];
            // Use [ \t]+ (not \s+) so the regex never bridges line breaks (\r or \n)
            const regex = /:[  \t]+([A-Z][a-z]+)/g;
            // Proper nouns and other words that are legitimately capitalised
            const properNouns = new Set([
                'I',
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December',
                'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
                'Australia', 'Australian', 'Australians',
                'Aboriginal', 'Indigenous',
                'English', 'French', 'German', 'Spanish', 'Chinese', 'Japanese',
                'Christmas', 'Easter',
                'Parliament', 'Commonwealth', 'Government',
                // Australian states/territories (single-word; multi-word names like
                // 'New South Wales' are handled by the multi-word skip below) and
                // capital cities - common single-occurrence proper nouns in
                // government writing that a mid-sentence check cannot catch.
                'Queensland', 'Victoria', 'Tasmania',
                'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide',
                'Hobart', 'Darwin', 'Canberra'
            ]);
            // A proper noun keeps its capital everywhere; a common word is
            // capitalised only at the start of a sentence. So if this word ALSO
            // appears capitalised somewhere that is not sentence-initial, it is a
            // proper noun - leave it alone. Needs no maintained list and catches
            // repeated names (Medicare, Centrelink, a surname) automatically.
            const appearsMidSentence = (w) => {
                const re = new RegExp('\\b' + w + '\\b', 'g');
                let m2;
                while ((m2 = re.exec(text)) !== null) {
                    let j = m2.index - 1;
                    while (j >= 0 && (text[j] === ' ' || text[j] === '\t')) j--;
                    if (j < 0) continue;                              // start of text
                    // Sentence-initial contexts: after . ! ? : a line break, or an
                    // opening quote/bracket. Anything else means mid-sentence.
                    if (/[.!?:\r\n"'(‘“]/.test(text[j])) continue;
                    return true;
                }
                return false;
            };
            let match;
            while ((match = regex.exec(text)) !== null) {
                const word = match[1];

                // Skip proper nouns
                if (properNouns.has(word)) continue;

                // Skip words that read as proper nouns elsewhere in the text
                if (appearsMidSentence(word)) continue;

                // Skip if the match bridges a line break (\r or \n) — safety net for any
                // line endings that slip through the [ \t]+ regex guard above
                if (/[\r\n]/.test(match[0])) continue;

                // Skip if the colon is at the very start of a line (paragraph starting with ':')
                const charBeforeColon = match.index > 0 ? text[match.index - 1] : '\n';
                if (/[\r\n]/.test(charBeforeColon)) continue;

                // Skip if the match falls within a heading line
                if (headingLines && headingLines.size > 0) {
                    const lineIndex = text.substring(0, match.index).split('\n').length - 1;
                    if (headingLines.has(lineIndex)) continue;
                }

                // Skip if the word is part of a CamelCase identifier (e.g. ReadWriteDocument)
                const charAfterWord = text[match.index + match[0].length];
                if (charAfterWord && /[A-Z]/.test(charAfterWord)) continue;

                // Skip if the colon follows a label word (Step 2:, Phase 1:, Option A:, Note:, etc.)
                const before = text.substring(Math.max(0, match.index - 60), match.index);
                if (/\b(step|phase|stage|part|section|note|example|exercise|task|chapter|item|option|figure|table|exhibit|rule|action|activity|objective|outcome|principle|requirement|tip|warning|caution|appendix|schedule|attachment|annex)\s*[\d\w]*\s*$/i.test(before)) continue;

                // Skip if the entire clause after the colon is a question
                // (look from the colon to the first sentence-ending character)
                const textAfterColon = text.substring(match.index + 1);
                const sentenceEnd = textAfterColon.search(/[\n.!?]/);
                if (sentenceEnd >= 0 && textAfterColon[sentenceEnd] === '?') continue;

                // Skip if the flagged word is the start of a multi-word proper-noun phrase
                // (the very next word also starts with a capital, e.g. "Style Manual", "Commonwealth Bank")
                const afterPos = match.index + match[0].length;
                const after = text.substring(afterPos, afterPos + 50);
                if (/^ [A-Z]/.test(after)) continue;

                const lower = word[0].toLowerCase() + word.slice(1);

                // Build a short context snippet so the card shows exactly where the colon is
                const ctxSnippet = before.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
                const ctxShort = ctxSnippet.length > 40 ? '\u2026' + ctxSnippet.slice(-40) : ctxSnippet;
                issues.push({
                    found: word,
                    suggestion: 'Use lowercase after a colon (unless a proper noun). Found: \u2018' + ctxShort + ': ' + word + '\u2026\u2019 \u2192 try \u2018' + lower + '\'',
                    autoFix: lower,
                    position: match.index + match[0].indexOf(word),
                    rule: this
                });
            }
            return issues;
        }
    },

    // ==================== ADDITIONAL ABBREVIATION RULES ====================
    {
        id: 'abbrev-unit-full-stop',
        name: 'Full stop after unit symbol',
        category: 'abbreviations',
        description: 'Don\'t put a full stop after unit symbols. Write \'kg\', not \'kg.\' (unless the symbol ends a sentence).',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/measurement-and-units',
        check: function(text) {
            const issues = [];
            const units = 'kg|km|cm|mm|mg|mL|kL|Hz|kW|MW|kB|MB|GB|TB|ms|dB';
            const regex = new RegExp('\\b(' + units + ')\\.', 'g');
            let match;
            while ((match = regex.exec(text)) !== null) {
                const unit = match[1];
                const afterPos = match.index + match[0].length;
                const after = text.substring(afterPos, afterPos + 3);

                // Skip if this ends a sentence (followed by space + capital, end of text/line)
                if (/^\s*$/.test(after) || /^\s+[A-Z]/.test(after) || /^[\s]*[\r\n]/.test(after)) {
                    continue;
                }

                issues.push({
                    found: match[0],
                    suggestion: unit,
                    autoFix: unit,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'abbrev-unit-plural',
        name: 'Pluralised unit symbol',
        category: 'abbreviations',
        description: 'Don\'t add \'s\' to unit symbols. Write \'5 kg\', not \'5 kgs\'.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/measurement-and-units',
        check: function(text) {
            const issues = [];
            const regex = /\b(\d+\s*)(kgs|kms|cms|mms|mgs|hrs|mins|secs)\b/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const number = match[1];
                const pluralUnit = match[2];
                const singularUnit = pluralUnit.slice(0, -1);
                const replacement = number + singularUnit;
                issues.push({
                    found: match[0],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'abbrev-plural-apostrophe',
        name: 'Apostrophe in abbreviation plural',
        category: 'abbreviations',
        description: 'Don\'t use an apostrophe to pluralise abbreviations. Write \'DVDs\', not \'DVD\'s\'.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/shortened-words-and-phrases/abbreviations',
        check: function(text) {
            const issues = [];
            const regex = /\b([A-Z]{2,})'s\b/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const abbrev = match[1];
                const replacement = abbrev + 's';
                issues.push({
                    found: match[0],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },

    // ==================== BATCH 1 - TRIAGE REGISTER RULES (July 2026) ====================
    {
        id: 'punct-and-or',
        name: "'and/or'",
        category: 'punctuation',
        description: 'Do not use \'and/or\' in text. It could mean either \'and\' or \'or\', which confuses many users. Rewrite the sentence to make the meaning clear - use \'or\' alone, or \'either ... or\'.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/punctuation/forward-slashes',
        check: function(text) {
            const issues = [];
            const regex = /\band\/or\b/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                issues.push({
                    found: match[0],
                    suggestion: "Reword: use 'or' alone, or 'either ... or'",
                    // No autoFix - rewording needs the author's judgement
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'punct-ellipsis',
        name: 'Ellipsis format and spacing',
        category: 'punctuation',
        description: 'Use the ellipsis character (…), not a string of full stops. Put a single space before and after each ellipsis. Don\'t use a full stop, comma or semicolon after an ellipsis (a question mark or exclamation mark is fine).',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/punctuation/ellipses',
        check: function(text) {
            const issues = [];
            // Three or more full stops -> ellipsis character
            const dotsRegex = /\.{3,}/g;
            let match;
            while ((match = dotsRegex.exec(text)) !== null) {
                const prev = match.index > 0 ? text[match.index - 1] : '';
                const next = text[match.index + match[0].length] || '';
                const pre = (prev && !/[\s([‘“'"]/.test(prev)) ? ' ' : '';
                const post = (next && !/[\s)\]’”'"?!]/.test(next)) ? ' ' : '';
                const replacement = pre + '…' + post;
                issues.push({
                    found: match[0],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            }
            // Ellipsis character: check spacing and trailing punctuation
            const ellRegex = /…/g;
            while ((match = ellRegex.exec(text)) !== null) {
                const i = match.index;
                const prev = i > 0 ? text[i - 1] : '';
                const afterStr = text.substring(i + 1, i + 4);
                // Full stop, comma or semicolon after the ellipsis
                const trail = afterStr.match(/^ ?([.,;])/);
                if (trail) {
                    issues.push({
                        found: text.substring(i, i + 1 + trail[0].length),
                        suggestion: '…',
                        autoFix: '…',
                        position: i,
                        rule: this
                    });
                    continue;
                }
                // Missing space before
                if (prev && !/[\s([‘“'"]/.test(prev)) {
                    issues.push({
                        found: prev + '…',
                        suggestion: prev + ' …',
                        autoFix: prev + ' …',
                        position: i - 1,
                        rule: this
                    });
                }
                // Missing space after (question and exclamation marks are allowed unspaced)
                const next = text[i + 1] || '';
                if (next && !/[\s)\]’”'"?!.,;]/.test(next)) {
                    issues.push({
                        found: '…' + next,
                        suggestion: '… ' + next,
                        autoFix: '… ' + next,
                        position: i,
                        rule: this
                    });
                }
            }
            return issues;
        }
    },
    {
        id: 'punct-exclamation-multiple',
        name: 'Multiple exclamation marks',
        category: 'punctuation',
        description: 'Use only one exclamation mark, not several. Multiple exclamation marks are not suitable for government content.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/punctuation/exclamation-marks',
        check: function(text) {
            const issues = [];
            const regex = /!{2,}/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                issues.push({
                    found: match[0],
                    suggestion: '!',
                    autoFix: '!',
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'punct-parentheses-nested',
        name: 'Nested or unmatched parentheses',
        category: 'punctuation',
        description: 'Don\'t use sets of parentheses inside each other. Use square brackets for parenthetical information within parentheses, or reword. Also flags parentheses that don\'t appear to have a matching pair.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/punctuation/brackets-and-parentheses',
        check: function(text) {
            const issues = [];
            const lines = text.split('\n');
            let offset = 0;
            for (const line of lines) {
                const stack = [];
                for (let i = 0; i < line.length; i++) {
                    const ch = line[i];
                    if (ch === '(') {
                        if (stack.length >= 1) {
                            issues.push({
                                found: '(',
                                suggestion: 'Use square brackets [ ] inside parentheses, or reword',
                                position: offset + i,
                                rule: this
                            });
                        }
                        stack.push(i);
                    } else if (ch === ')') {
                        if (stack.length) {
                            stack.pop();
                        } else {
                            // Skip list markers like '1)' or 'a)' at the start of a line
                            if (/^\s*\(?\w{1,4}\)$/.test(line.substring(0, i + 1))) continue;
                            // Skip emoticons
                            if (/[:;]-?$/.test(line.substring(Math.max(0, i - 2), i))) continue;
                            issues.push({
                                found: ')',
                                suggestion: 'Check this closing parenthesis - it has no matching opening parenthesis',
                                position: offset + i,
                                rule: this
                            });
                        }
                    }
                }
                if (stack.length) {
                    issues.push({
                        found: '(',
                        suggestion: 'Check this opening parenthesis - it has no matching closing parenthesis',
                        position: offset + stack[0],
                        rule: this
                    });
                }
                offset += line.length + 1;
            }
            return issues;
        }
    },
    {
        id: 'punct-possessive-pronoun',
        name: 'Apostrophe in possessive pronoun',
        category: 'punctuation',
        description: 'Possessive pronouns never take apostrophes. Write \'theirs\', \'yours\', \'ours\', \'hers\' and \'its\', not \'their\'s\' or \'its\'\'.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/punctuation/apostrophes',
        check: function(text) {
            const issues = [];
            const regex = /\b(your|their|our|her)['’]s\b/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const replacement = match[1] + 's';
                issues.push({
                    found: match[0],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            }
            // its' is never correct
            const itsRegex = /\bits['’](?![a-z])/gi;
            while ((match = itsRegex.exec(text)) !== null) {
                issues.push({
                    found: match[0],
                    suggestion: 'its',
                    autoFix: 'its',
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'punct-plural-time-apostrophe',
        name: 'Apostrophe in plural time period',
        category: 'punctuation',
        description: 'Noun phrases about plural time periods don\'t need apostrophes because they\'re descriptive, not possessive. Write \'6 weeks time\' and \'3 months wages\'. This has been the Style Manual\'s guidance for many years. Singular forms keep the apostrophe (\'a day\'s work\').',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/punctuation/apostrophes',
        check: function(text) {
            const issues = [];
            const regex = /\b(\d+|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|thirty|forty|fifty|several|few|many)\s+(days|weeks|months|years|hours|minutes|seconds|decades|centuries|fortnights)['’](?=\s+[a-z])/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const replacement = match[1] + ' ' + match[2];
                issues.push({
                    found: match[0],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'punct-eg-ie-comma',
        name: "Comma after 'e.g.' or 'i.e.'",
        category: 'punctuation',
        description: 'Don\'t put a comma after \'e.g.\' or \'i.e.\'. The comma after these forms is an American convention. (Better still, replace them with \'for example\' or \'that is\'.)',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/punctuation/commas',
        check: function(text) {
            const issues = [];
            const regex = /\b(e\.g\.|i\.e\.)\s?,/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                issues.push({
                    found: match[0],
                    suggestion: match[1],
                    autoFix: match[1],
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'punct-ratio-colon-space',
        name: 'Spaced colon in ratio',
        category: 'punctuation',
        description: 'Write mathematical ratios with an unspaced colon. Write \'50:50\', not \'50 : 50\'.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/punctuation/colons',
        check: function(text) {
            const issues = [];
            const regex = /\b(\d+(?:\.\d+)?)([  ]+:[  ]*|[  ]*:[  ]+)(\d+(?:\.\d+)?)\b/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const replacement = match[1] + ':' + match[3];
                issues.push({
                    found: match[0],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'punct-hyphen-hanging',
        name: 'Hanging hyphen',
        category: 'punctuation',
        description: 'Hanging hyphens (\'full- and part-time\') can be difficult to follow. Consider repeating the words instead to be clearer (\'full-time and part-time\').',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/punctuation/hyphens',
        check: function(text) {
            const issues = [];
            const flagged = new Set();
            // Detailed pattern: 'full- and part-time' -> can compute the repeated form
            const detailed = /\b([A-Za-z]+)-\s+(and|or)\s+([A-Za-z]+)-([A-Za-z]+)\b/g;
            let match;
            while ((match = detailed.exec(text)) !== null) {
                flagged.add(match.index);
                issues.push({
                    found: match[0],
                    suggestion: match[1] + '-' + match[4] + ' ' + match[2] + ' ' + match[3] + '-' + match[4],
                    // No autoFix - advisory; the construction is grammatical
                    position: match.index,
                    rule: this
                });
            }
            // Generic pattern: any word ending in a hanging hyphen before 'and'/'or'
            const generic = /\b([A-Za-z]+)-\s+(and|or)\b/g;
            while ((match = generic.exec(text)) !== null) {
                if (flagged.has(match.index)) continue;
                issues.push({
                    found: match[0],
                    suggestion: 'Consider repeating the shared word instead of using a hanging hyphen',
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'punct-dash-from-between',
        name: "'from' or 'between' with a dash",
        category: 'punctuation',
        description: 'Never mix \'from\' or \'between\' with an en dash. Pair \'from\' with \'to\' and \'between\' with \'and\'. Write \'from 2017 to 2019\', not \'from 2017–2019\'.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/punctuation/dashes',
        check: function(text) {
            const issues = [];
            const regex = /\b(from|between)\s+(\d[\w:.]*(?:\s?(?:am|pm))?)\s*[–—-]\s*(\d[\w:.]*(?:\s?(?:am|pm))?)/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const end = match.index + match[0].length;
                const after = text.substring(end, Math.min(text.length, end + 8));
                // Skip financial-year spans used correctly: 'from 2017-18 to 2018-19'
                if (/^\s+(?:to|and)\b/i.test(after)) continue;
                const isFrom = match[1].toLowerCase() === 'from';
                const replacement = match[1] + ' ' + match[2] + (isFrom ? ' to ' : ' and ') + match[3];
                issues.push({
                    found: match[0],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'time-ampm-space',
        name: "Missing space before 'am' or 'pm'",
        category: 'dates-and-time',
        description: 'Separate the numerals and \'am\' or \'pm\' with a space (a non-breaking space in Word). Write \'3 pm\', not \'3pm\'.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/dates-and-time',
        check: function(text) {
            const issues = [];
            const regex = /\b(\d{1,2}(?:[.:]\d{2})?)(am|pm)\b/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const replacement = match[1] + ' ' + match[2].toLowerCase();
                issues.push({
                    found: match[0],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'time-ampm-case',
        name: "Capitalised or punctuated 'am'/'pm'",
        category: 'dates-and-time',
        description: 'Write \'am\' and \'pm\' in lower case without full stops. Write \'10 am\', not \'10 AM\' or \'10 a.m.\'.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/dates-and-time',
        check: function(text) {
            const issues = [];
            const patterns = [
                /\b(\d{1,2}(?:[.:]\d{2})?)\s+([APap]\.?\s?[Mm]\.?)(?![A-Za-z])/g,
                /\b(\d{1,2}(?:[.:]\d{2})?)([APap]\.[Mm]\.?)(?![A-Za-z])/g
            ];
            for (const regex of patterns) {
                let match;
                while ((match = regex.exec(text)) !== null) {
                    const marker = match[2];
                    if (marker === 'am' || marker === 'pm') continue; // already correct
                    const base = /^[Aa]/.test(marker) ? 'am' : 'pm';
                    const replacement = match[1] + ' ' + base;
                    const end = match.index + match[0].length;
                    const after = text.substring(end, Math.min(text.length, end + 3));
                    // If the marker's final full stop may end the sentence, don't auto-fix
                    const ambiguous = marker.endsWith('.') && /^\s*[A-Z]/.test(after);
                    issues.push({
                        found: match[0],
                        suggestion: replacement,
                        autoFix: ambiguous ? undefined : replacement,
                        position: match.index,
                        rule: this
                    });
                }
            }
            return issues;
        }
    },
    {
        id: 'time-noon-midnight',
        name: "'12 noon' or '12 midnight'",
        category: 'dates-and-time',
        description: 'The \'12\' is redundant. Write \'noon\', \'midday\' or \'midnight\' on their own.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/dates-and-time',
        check: function(text) {
            const issues = [];
            const regex = /\b12\s*(noon|midday|midnight)\b/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                issues.push({
                    found: match[0],
                    suggestion: match[1],
                    autoFix: match[1],
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'time-24hour-ampm',
        name: "'am' or 'pm' on 24-hour time",
        category: 'dates-and-time',
        description: '24-hour times don\'t take \'am\' or \'pm\' - the hour already shows whether it\'s morning or evening. Write \'23:18\', not \'23:18 pm\'.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/dates-and-time',
        check: function(text) {
            const issues = [];
            const regex = /\b((?:0\d|1[3-9]|2[0-3]):?[0-5]\d)\s*(am|pm)\b/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                issues.push({
                    found: match[0],
                    suggestion: match[1],
                    autoFix: match[1],
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'numbers-currency-space',
        name: 'Space after currency symbol',
        category: 'numbers-and-measurements',
        description: 'Don\'t put a space between the currency symbol and the numerals. Write \'$50\', not \'$ 50\'.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/currency',
        check: function(text) {
            const issues = [];
            const regex = /([$£€¥])[  ]+(?=\d)/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                issues.push({
                    found: match[0],
                    suggestion: match[1],
                    autoFix: match[1],
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'numbers-percent-noun',
        name: "'per cent' used as a noun",
        category: 'numbers-and-measurements',
        description: 'Use \'percentage\' as the noun. Write \'the percentage of Australians\', not \'the per cent of Australians\'.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/percentages',
        check: function(text) {
            const issues = [];
            const regex = /\b(the|a|what|which|this|that)\s+per\s?cent\b(?!\s+(?:sign|symbol))/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const replacement = match[1] + ' percentage';
                issues.push({
                    found: match[0],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'numbers-comparison-operators',
        name: 'Programming comparison operators',
        category: 'numbers-and-measurements',
        description: '\'>=\' and \'<=\' are not mathematical notation. Use the proper symbols (≥, ≤) or words (\'greater than or equal to\', \'less than or equal to\').',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/mathematical-relationships',
        check: function(text) {
            const issues = [];
            const regex = /(>=|<=)/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const gte = match[1] === '>=';
                issues.push({
                    found: match[0],
                    suggestion: gte ? "'≥' or 'greater than or equal to'" : "'≤' or 'less than or equal to'",
                    // No autoFix - symbol or words is the author's choice
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'readability-double-negative',
        name: 'Double negative',
        category: 'readability',
        description: 'Double negatives can lead to misunderstandings, so avoid them. Write \'common\' instead of \'not uncommon\'.',
        link: 'https://www.stylemanual.gov.au/writing-and-designing-content/clear-language-and-writing-style/sentences',
        check: function(text) {
            const issues = [];
            const pairs = [
                ['uncommon', 'common'], ['unusual', 'usual'], ['unlikely', 'likely'],
                ['unreasonable', 'reasonable'], ['unnecessary', 'necessary'], ['unclear', 'clear'],
                ['unaware', 'aware'], ['unable', 'able'], ['unwilling', 'willing'],
                ['unimportant', 'important'], ['uncertain', 'certain'], ['unfamiliar', 'familiar'],
                ['unexpected', 'expected'], ['insignificant', 'significant'], ['inaccurate', 'accurate'],
                ['incorrect', 'correct'], ['incomplete', 'complete'], ['inconsistent', 'consistent'],
                ['infrequent', 'frequent'], ['impossible', 'possible'], ['impractical', 'practical'],
                ['irrelevant', 'relevant']
            ];
            for (const [neg, pos] of pairs) {
                const regex = new RegExp('\\bnot\\s+' + neg + '\\b', 'gi');
                let match;
                while ((match = regex.exec(text)) !== null) {
                    issues.push({
                        found: match[0],
                        suggestion: "'" + pos + "', or reword positively",
                        // No autoFix - the positive form can shift the meaning
                        position: match.index,
                        rule: this
                    });
                }
            }
            return issues;
        }
    },
    {
        id: 'readability-if-unless',
        name: "'if' and 'unless' in one sentence",
        category: 'readability',
        description: 'Don\'t use \'if\' and \'unless\' in the same sentence - the combined conditions are hard to follow. Split them into 2 sentences.',
        link: 'https://www.stylemanual.gov.au/writing-and-designing-content/clear-language-and-writing-style/sentences',
        check: function(text) {
            const issues = [];
            const sentenceRegex = /[^.!?\n]+[.!?]?/g;
            let sentence;
            while ((sentence = sentenceRegex.exec(text)) !== null) {
                const s = sentence[0];
                if (/\bif\b/i.test(s) && /\bunless\b/i.test(s)) {
                    const unlessIndex = s.search(/\bunless\b/i);
                    issues.push({
                        found: s.substr(unlessIndex, 6),
                        suggestion: "Split into 2 sentences - don't use 'if' and 'unless' together",
                        position: sentence.index + unlessIndex,
                        rule: this
                    });
                }
            }
            return issues;
        }
    },
    {
        id: 'inclusive-atsi',
        name: "'ATSI'",
        category: 'inclusive-language',
        description: 'Never use the shorthand \'ATSI\'. Write \'Aboriginal and Torres Strait Islander\' in full, or \'First Nations\'.',
        link: 'https://www.stylemanual.gov.au/accessible-and-inclusive-content/inclusive-language/aboriginal-and-torres-strait-islander-peoples',
        check: function(text) {
            const issues = [];
            const regex = /\bATSI\b/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                issues.push({
                    found: match[0],
                    suggestion: "'Aboriginal and Torres Strait Islander' or 'First Nations'",
                    // No autoFix - may be a dataset variable name in technical content
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'inclusive-aborigines',
        name: "'Aborigines' or 'Aboriginals' as nouns",
        category: 'inclusive-language',
        description: 'These nouns are outdated and can cause offence. Write \'Aboriginal and Torres Strait Islander people\' or \'First Nations people\'. (\'Aboriginal\' as an adjective is fine.)',
        link: 'https://www.stylemanual.gov.au/accessible-and-inclusive-content/inclusive-language/aboriginal-and-torres-strait-islander-peoples',
        check: function(text) {
            const issues = [];
            const regex = /\b[Aa]borigin(?:es|als)\b/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                issues.push({
                    found: match[0],
                    suggestion: "'Aboriginal and Torres Strait Islander people' or 'First Nations people'",
                    // No autoFix - historical quotations and older publication titles keep the original wording
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'inclusive-indigenous-capital',
        name: "Lower-case 'indigenous' or 'aboriginal' for peoples",
        category: 'inclusive-language',
        description: 'Capitalise \'Indigenous\' and \'Aboriginal\' when referring to Aboriginal and Torres Strait Islander people. Lower case is only correct for generic uses such as \'indigenous species\'.',
        link: 'https://www.stylemanual.gov.au/accessible-and-inclusive-content/inclusive-language/aboriginal-and-torres-strait-islander-peoples',
        check: function(text) {
            const issues = [];
            const regex = /\b(indigenous|aboriginal)(\s+)(Australians?|peoples?|person|communit(?:y|ies)|child(?:ren)?|wom[ae]n|m[ae]n|famil(?:y|ies)|elders?|health|cultures?|languages?|nations?|status|adults?|youth|girls?|boys?)\b/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                if (!/[a-z]/.test(match[1][0])) continue; // already capitalised
                const replacement = match[1][0].toUpperCase() + match[1].slice(1);
                issues.push({
                    found: match[1],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            }
            // Lower-case 'torres strait islander'
            const torresRegex = /\btorres\s+strait\s+islander(s?)\b/gi;
            while ((match = torresRegex.exec(text)) !== null) {
                const proper = 'Torres Strait Islander' + match[1];
                if (match[0] === proper) continue;
                issues.push({
                    found: match[0],
                    suggestion: proper,
                    autoFix: proper,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'inclusive-christian-name',
        name: "'Christian name'",
        category: 'inclusive-language',
        description: 'Not everyone has a Christian name. Write \'given name\' instead.',
        link: 'https://www.stylemanual.gov.au/accessible-and-inclusive-content/inclusive-language/cultural-and-linguistic-diversity',
        check: function(text) {
            const issues = [];
            const regex = /\b[Cc]hristian\s+name(s?)\b/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const replacement = 'given name' + match[1];
                issues.push({
                    found: match[0],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },

    // ==================== BATCH 2 - TRIAGE REGISTER RULES (July 2026) ====================
    {
        id: 'spelling-prefix-hyphen',
        name: 'Prefix hyphenation',
        category: 'spelling',
        description: 'Use a hyphen when a single-syllable prefix ends with the same vowel that starts the word (\'re-enter\', \'pre-existing\'). The \'co-\' family closes up (\'coordinate\', \'cooperate\'). Spellings follow the Macquarie Dictionary.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/punctuation/hyphens',
        check: function(text) {
            const issues = [];
            for (const [wrong, correct] of Object.entries(PREFIX_SPELLINGS)) {
                const escaped = wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp('\\b' + escaped + '\\b', 'gi');
                let match;
                while ((match = regex.exec(text)) !== null) {
                    const replacement = preserveCase(match[0], correct);
                    issues.push({
                        found: match[0],
                        suggestion: replacement,
                        autoFix: replacement,
                        position: match.index,
                        rule: this
                    });
                }
            }
            return issues;
        }
    },
    {
        id: 'numbers-unit-space',
        name: 'Missing space between number and unit',
        category: 'numbers-and-measurements',
        description: 'Put a non-breaking space between the number and the unit of measurement. Write \'5 kg\', not \'5kg\'.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/measurement-and-units',
        check: function(text) {
            const issues = [];
            // Agreed whitelist (July 2026). Longest first so 'km/h' wins over 'km'.
            // Deliberately excluded: m, s, h, %, °C, am/pm (see triage register notes).
            const units = ['km/h', 'mmHg', 'Mbps', 'Gbps', 'kWh', 'MWh', 'kHz', 'MHz',
                'GHz', 'kPa', 'ppm', 'mcg', 'min', 'km', 'kg', 'mg', 'µg', 'mL', 'ml',
                'dL', 'kL', 'ML', 'GL', 'mm', 'cm', 'ha', 'kJ', 'MJ', 'kW', 'MW', 'GW',
                'Hz', 'kB', 'MB', 'GB', 'TB', 'dB', 'L', 'g', 't'];
            const unitPattern = units.map(u => u.replace('/', '\\/')).join('|');
            const regex = new RegExp('(\\d+(?:\\.\\d+)?)(' + unitPattern + ')(?![A-Za-z0-9\\/])', 'g');
            let match;
            while ((match = regex.exec(text)) !== null) {
                // Skip if the number is part of a word or code ('A4', 'COVID-19')
                const before = text.substring(Math.max(0, match.index - 2), match.index);
                if (/[A-Za-z]$/.test(before)) continue;
                if (/[A-Za-z][-–]$/.test(before)) continue;
                const replacement = match[1] + ' ' + match[2];
                issues.push({
                    found: match[0],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'numbers-phone-format',
        name: 'Telephone number format',
        category: 'numbers-and-measurements',
        description: 'Write Australian phone numbers in standard chunks with non-breaking spaces: \'02 6244 1000\' (landline), \'0491 570 159\' (mobile), \'1300 975 707\', \'13 24 68\'. Don\'t use parentheses, hyphens or unbroken digits.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/telephone-numbers',
        check: function(text) {
            const issues = [];
            const flaggedSpans = [];
            const overlaps = (start, end) =>
                flaggedSpans.some(([s, e]) => start < e && end > s);
            const pushIssue = (match, digits, chunks) => {
                const start = match.index;
                const end = start + match[0].length;
                if (overlaps(start, end)) return;
                flaggedSpans.push([start, end]);
                // Normalise the found text; skip if it already matches the standard chunking
                const foundNorm = match[0].replace(/ /g, ' ');
                const canonical = chunks.join(' ');
                if (foundNorm === canonical) return;
                const replacement = chunks.join(' ');
                issues.push({
                    found: match[0],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: start,
                    rule: this
                });
            };

            // 10-digit numbers starting with 0 (landline and mobile), any separators
            const tenDigit = /(?:\(0\d\)|\b0\d)(?:[  ().-]*\d){8}\b(?!\d)/g;
            let match;
            while ((match = tenDigit.exec(text)) !== null) {
                const digits = match[0].replace(/\D/g, '');
                if (digits.length !== 10) continue;
                if (digits.startsWith('04')) {
                    // Mobile: 4 + 3 + 3
                    pushIssue(match, digits,
                        [digits.slice(0, 4), digits.slice(4, 7), digits.slice(7)]);
                } else if (/^0[2378]/.test(digits)) {
                    // Landline: 2 + 4 + 4
                    pushIssue(match, digits,
                        [digits.slice(0, 2), digits.slice(2, 6), digits.slice(6)]);
                }
                // Other leading digits: not a known Australian format - don't flag
            }

            // 1300 and 1800 numbers: 4 + 3 + 3
            const thirteenHundred = /\b1[38]00(?:[  .-]*\d){6}\b(?!\d)/g;
            while ((match = thirteenHundred.exec(text)) !== null) {
                const digits = match[0].replace(/\D/g, '');
                if (digits.length !== 10) continue;
                pushIssue(match, digits,
                    [digits.slice(0, 4), digits.slice(4, 7), digits.slice(7)]);
            }

            // 13 numbers (6 digits): 2 + 2 + 2
            const thirteen = /\b13(?:[  .-]*\d){4}\b(?!\d)/g;
            while ((match = thirteen.exec(text)) !== null) {
                const digits = match[0].replace(/\D/g, '');
                if (digits.length !== 6) continue;
                pushIssue(match, digits,
                    [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)]);
            }
            return issues;
        }
    },
    {
        id: 'readability-passive-voice',
        name: 'Passive voice with named doer',
        category: 'readability',
        description: 'Prefer active voice. When the doer appears after \'by\', the sentence can usually be turned around: \'the board approved the report\', not \'the report was approved by the board\'. Passive voice is sometimes appropriate - this is advisory only.',
        link: 'https://www.stylemanual.gov.au/writing-and-designing-content/clear-language-and-writing-style/sentences',
        check: function(text) {
            const issues = [];
            const irregular = 'given|taken|made|done|seen|known|shown|held|kept|found|told|paid|met|set|put|sent|built|spent|led|left|lost|won|sold|bought|brought|taught|caught|sought|thought|felt|heard|read|said|understood|written|driven|chosen|spoken|broken|hidden|drawn|withdrawn|grown|thrown|borne|worn|torn|sworn|laid|undertaken|overseen|begun';
            // Participles that read as adjectives after 'be' + 'by' (usually locative, not passive)
            const adjectival = new Set(['located', 'situated', 'positioned', 'surrounded', 'bounded', 'aged']);
            const regex = new RegExp(
                '\\b(is|are|was|were|been|being|be)' +
                '(?:\\s+(?:not|also|often|only|already|currently|generally|usually|typically|previously|widely))?' +
                '\\s+([A-Za-z]{2,}ed|' + irregular + ')\\s+by\\b', 'gi');
            let match;
            while ((match = regex.exec(text)) !== null) {
                if (adjectival.has(match[2].toLowerCase())) continue;
                issues.push({
                    found: match[0],
                    suggestion: 'Consider active voice: put the doer (after \'by\') before the verb',
                    // No autoFix - rewording needs the author's judgement
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    },

    // ==================== BATCH 3 - DOCUMENT STRUCTURE RULES (July 2026) ====================
    // These rules need docCtx (the object returned by loadDocx). They pass
    // silently on pasted plain text, which has no styles or hyperlinks.
    {
        id: 'heading-skipped-level',
        name: 'Skipped heading level',
        category: 'headings',
        description: 'Don\'t skip heading levels - a Heading 3 should not follow a Heading 1 directly. Screen reader users rely on heading levels to understand how content is organised.',
        link: 'https://www.stylemanual.gov.au/structuring-content/headings',
        check: function(text, headingLines, listLines, boldLines, italicLines, tableLines, docCtx) {
            const issues = [];
            if (!docCtx || !docCtx.headingLevels || docCtx.headingLevels.size === 0) return issues;
            const lines = text.split('\n');
            let lineStart = 0;
            let prevLevel = 0;
            for (let i = 0; i < lines.length; i++) {
                const level = docCtx.headingLevels.get(i);
                if (level !== undefined && lines[i].trim()) {
                    if (prevLevel > 0 && level > prevLevel + 1) {
                        const trimmed = lines[i].trim();
                        issues.push({
                            found: trimmed,
                            suggestion: 'Heading level jumps from Heading ' + prevLevel +
                                ' to Heading ' + level + ' - use Heading ' + (prevLevel + 1) +
                                ' or restructure the section',
                            // No autoFix - restructuring is the author's call
                            position: lineStart + lines[i].indexOf(trimmed),
                            rule: this
                        });
                    }
                    prevLevel = level;
                }
                lineStart += lines[i].length + 1;
            }
            return issues;
        }
    },
    {
        id: 'format-underline-not-link',
        name: 'Underlined text that is not a link',
        category: 'accessibility',
        description: 'Underlining signals hyperlinks. Don\'t underline text for emphasis or headings - users will try to click it. Use bold or a heading style instead.',
        link: 'https://www.stylemanual.gov.au/structuring-content/headings',
        check: function(text, headingLines, listLines, boldLines, italicLines, tableLines, docCtx) {
            const issues = [];
            if (!docCtx || !docCtx.underlines) return issues;
            for (const u of docCtx.underlines) {
                issues.push({
                    found: u.text,
                    suggestion: 'Remove the underline - use bold or a heading style for emphasis',
                    // No autoFix - this is a formatting change, not a text change
                    position: u.position,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'link-generic-text',
        name: 'Generic link text',
        category: 'links',
        description: 'Link text should describe the destination. Generic text like \'click here\' or \'read more\' doesn\'t make sense out of context, especially for screen reader users who navigate by links.',
        link: 'https://www.stylemanual.gov.au/structuring-content/links',
        check: function(text, headingLines, listLines, boldLines, italicLines, tableLines, docCtx) {
            const issues = [];
            if (!docCtx || !docCtx.links) return issues;
            const generic = new Set([
                'click here', 'here', 'click', 'read more', 'more',
                'more information', 'more info', 'learn more', 'find out more',
                'this page', 'this link', 'link', 'website', 'see more',
                'details', 'more details', 'info', 'continue reading', 'go'
            ]);
            for (const link of docCtx.links) {
                const label = link.text.trim().toLowerCase().replace(/[.,:;!?…]+$/, '');
                if (generic.has(label)) {
                    issues.push({
                        found: link.text,
                        suggestion: 'Rewrite the link text to describe the destination (for example, \'Apply for a permit\' instead of \'click here\')',
                        // No autoFix - descriptive text depends on the destination
                        position: link.position,
                        rule: this
                    });
                }
            }
            return issues;
        }
    },
    {
        id: 'link-full-stop',
        name: 'Full stop inside link text',
        category: 'links',
        description: 'Don\'t include the sentence\'s full stop in the link text. Move it outside the link.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/punctuation/full-stops',
        check: function(text, headingLines, listLines, boldLines, italicLines, tableLines, docCtx) {
            const issues = [];
            if (!docCtx || !docCtx.links) return issues;
            for (const link of docCtx.links) {
                const t = link.text.trim();
                // A single trailing full stop - not an ellipsis, not a domain like '.au'
                if (/[^.\s]\.$/.test(t) && !/\.\.$/.test(t) &&
                    !/\.(?:au|com|org|net|gov|edu)\.$/i.test(t)) {
                    issues.push({
                        found: link.text,
                        suggestion: 'Move the full stop outside the link text',
                        position: link.position,
                        rule: this
                    });
                }
            }
            return issues;
        }
    },
    {
        id: 'accessibility-nonbreaking-space',
        name: 'Non-breaking space in times, units and phone numbers',
        category: 'accessibility',
        description: 'Use a non-breaking space so the number and what follows it stay together on one line - between numerals and \'am\'/\'pm\', between numbers and units, and between phone number chunks.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/dates-and-time',
        check: function(text, headingLines, listLines, boldLines, italicLines, tableLines, docCtx) {
            const issues = [];
            // docx uploads only - pasted plain text can't hold the distinction reliably
            if (!docCtx || !docCtx.paragraphs) return issues;
            const push = (match, replacement) => {
                issues.push({
                    found: match[0],
                    suggestion: replacement,
                    autoFix: replacement,
                    position: match.index,
                    rule: this
                });
            };
            let match;
            // Ordinary space before am/pm
            const ampm = /\b(\d{1,2}(?::\d{2})?) (am|pm)\b/g;
            while ((match = ampm.exec(text)) !== null) {
                push(match, match[1] + ' ' + match[2]);
            }
            // Ordinary space between number and whitelisted unit
            // (keep this list in sync with numbers-unit-space)
            const units = ['km/h', 'mmHg', 'Mbps', 'Gbps', 'kWh', 'MWh', 'kHz', 'MHz',
                'GHz', 'kPa', 'ppm', 'mcg', 'min', 'km', 'kg', 'mg', 'µg', 'mL', 'ml',
                'dL', 'kL', 'ML', 'GL', 'mm', 'cm', 'ha', 'kJ', 'MJ', 'kW', 'MW', 'GW',
                'Hz', 'kB', 'MB', 'GB', 'TB', 'dB', 'L', 'g', 't'];
            const unitRegex = new RegExp(
                '\\b(\\d+(?:\\.\\d+)?) (' +
                units.map(u => u.replace('/', '\\/')).join('|') +
                ')(?![A-Za-z0-9\\/])', 'g');
            while ((match = unitRegex.exec(text)) !== null) {
                push(match, match[1] + ' ' + match[2]);
            }
            // Ordinary spaces between phone number chunks (standard formats only)
            const phones = [
                /\b(0[2378]) (\d{4}) (\d{4})\b(?!\d)/g,
                /\b(04\d{2}) (\d{3}) (\d{3})\b(?!\d)/g,
                /\b(1[38]00) (\d{3}) (\d{3})\b(?!\d)/g,
                /\b(13) (\d{2}) (\d{2})\b(?!\d)/g
            ];
            for (const regex of phones) {
                while ((match = regex.exec(text)) !== null) {
                    push(match, match[1] + ' ' + match[2] + ' ' + match[3]);
                }
            }
            return issues;
        }
    }
];

// Helper: preserve case when replacing
// Helper: convert text to sentence case (first letter caps, rest lowercase)
// Preserves all-caps words that are likely acronyms (2-5 chars) but not common words
function toSentenceCase(text) {
    // Common words that should not be treated as acronyms even when all caps
    const commonWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'so', 'yet',
                        'on', 'at', 'to', 'by', 'of', 'in', 'is', 'it', 'as', 'if', 'be',
                        'am', 'are', 'was', 'were', 'been', 'has', 'have', 'had', 'do', 'does',
                        'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
                        'can', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her',
                        'its', 'our', 'their', 'who', 'what', 'which', 'when', 'where', 'why',
                        'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
                        'some', 'such', 'no', 'not', 'only', 'own', 'same', 'than', 'too',
                        'very', 'just', 'also', 'now', 'new', 'one', 'two', 'first', 'last',
                        'long', 'great', 'little', 'own', 'other', 'old', 'right', 'big',
                        'high', 'different', 'small', 'large', 'next', 'early', 'young',
                        'important', 'public', 'bad', 'same', 'able'];
    const words = text.split(/\s+/);
    return words.map((word, index) => {
        const wordLower = word.toLowerCase();
        // Preserve acronyms (all caps, 2-5 characters) but not common words
        if (word === word.toUpperCase() && word.length >= 2 && word.length <= 5 &&
            /^[A-Z]+$/.test(word) && !commonWords.includes(wordLower)) {
            return word;
        }
        // First word: capitalize first letter, lowercase rest
        if (index === 0) {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        // Other words: all lowercase
        return word.toLowerCase();
    }).join(' ');
}

// Helper: preserve case when replacing
function preserveCase(original, replacement) {
    if (original === original.toUpperCase()) {
        return replacement.toUpperCase();
    }
    if (original[0] === original[0].toUpperCase()) {
        return replacement[0].toUpperCase() + replacement.slice(1);
    }
    return replacement;
}

// Helper: convert number to words (for numbers 0-100)
function numberToWords(num) {
    const ones = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
                  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
                  'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    if (num < 20) {
        return ones[num];
    }
    if (num < 100) {
        const ten = Math.floor(num / 10);
        const one = num % 10;
        return one === 0 ? tens[ten] : tens[ten] + '-' + ones[one];
    }
    if (num === 100) {
        return 'one hundred';
    }
    return num.toString(); // Fall back for numbers > 100
}

// Main function to check text against all rules
// headingLines: optional Set of line indices with a Word heading style applied
// listLines: optional Set of line indices that are list items (bullets/numbered)
// boldLines: optional Set of line indices where the entire paragraph is bold
function checkText(text, headingLines, listLines, boldLines, italicLines, tableLines, docCtx) {
    const allIssues = [];
    for (const rule of RULES) {
        const issues = rule.check(text, headingLines, listLines, boldLines, italicLines, tableLines, docCtx);
        allIssues.push(...issues);
    }
    // Sort by position in text
    allIssues.sort((a, b) => a.position - b.position);
    return allIssues;
}

// Get all unique categories
function getCategories() {
    const categories = [...new Set(RULES.map(r => r.category))];
    return categories.sort();
}

// Export for use in add-in
export { RULES, checkText, getCategories, preserveCase };
