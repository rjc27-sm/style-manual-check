/**
 * Australian Government Style Manual - Rule definitions
 * Each rule has: id, name, category, description, link, check function
 */

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
                    // No autoFix - user must decide if this is a legal context
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
            const regex = /(\w)—(\w)/g;
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
        name: 'Unspaced en dash in sentences',
        category: 'punctuation',
        description: 'En dashes in sentences should have spaces around them. Unspaced en dashes are for number ranges.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/punctuation/dashes',
        check: function(text) {
            const issues = [];
            // Match en dash between words (not numbers)
            const regex = /([A-Za-z])–([A-Za-z])/g;
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
        description: 'Use a single space after full stops, not two.',
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
            // Match text in double quotes (simple pattern)
            const regex = /"([^"]+)"/g;
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
        description: 'Use \'noon\', \'midday\' or \'midnight\' instead of \'12 am\' or \'12 pm\' to avoid confusion.',
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
        description: 'Use a colon between hours and minutes, not a full stop. Write \'10:30 am\', not \'10.30 am\'.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/dates-and-time',
        check: function(text) {
            const issues = [];
            // Match time with full stop (10.30 am, 2.45 pm)
            const regex = /\b(\d{1,2})\.(\d{2})\s*(am|pm)\b/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const replacement = match[1] + ':' + match[2] + ' ' + match[3].toLowerCase();
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
        check: function(text) {
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

            for (const line of lines) {
                const trimmed = line.trim();

                // Skip empty lines
                if (!trimmed) {
                    position += line.length + 1;
                    continue;
                }

                // Heading heuristics:
                // - Short (under 12 words)
                // - Doesn't end with . ? ! ; (headings typically don't)
                // - Not all caps (that's a different issue)
                const words = trimmed.split(/\s+/);
                const endsWithPunctuation = /[.?!;,]$/.test(trimmed);
                const isAllCaps = trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);

                if (words.length >= 3 && words.length <= 12 && !endsWithPunctuation && !isAllCaps) {
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
                        issues.push({
                            found: trimmed,
                            suggestion: sentenceCase,
                            autoFix: sentenceCase,
                            position: position + line.indexOf(trimmed),
                            rule: this
                        });
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
        check: function(text) {
            const issues = [];
            const lines = text.split('\n');
            let position = 0;

            for (const line of lines) {
                const trimmed = line.trim();

                // Skip empty lines
                if (!trimmed) {
                    position += line.length + 1;
                    continue;
                }

                // Heading heuristics: short-ish line, doesn't end with sentence punctuation
                const words = trimmed.split(/\s+/);
                const endsWithPunctuation = /[.?!;,]$/.test(trimmed);

                // Consider it a heading if it's 3-20 words and doesn't end with punctuation
                // (Long headings that exceed 70 chars are likely to have more words)
                if (words.length >= 3 && words.length <= 20 && !endsWithPunctuation) {
                    if (trimmed.length > 70) {
                        issues.push({
                            found: trimmed,
                            suggestion: 'This heading is ' + trimmed.length + ' characters. Keep headings to 70 characters or fewer',
                            // No autoFix - user must rewrite
                            position: position + line.indexOf(trimmed),
                            rule: this
                        });
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
        check: function(text) {
            const issues = [];
            const lines = text.split('\n');
            let position = 0;

            // Pattern to detect list item markers at start of line (including indented)
            const bulletPattern = /^[\t ]*[•●○◦▪▸►→‣⁃\-\*]\s*|^[\t ]*\d+[.)]\s|^[\t ]*[a-z][.)]\s/i;

            // Track consecutive short lines to detect sentence lists
            let consecutiveShortLines = 0;

            for (const line of lines) {
                const trimmed = line.trim();

                // Skip empty lines (reset consecutive counter)
                if (!trimmed) {
                    consecutiveShortLines = 0;
                    position += line.length + 1;
                    continue;
                }

                // Skip lines that are list items (start with bullet or number marker)
                if (bulletPattern.test(trimmed)) {
                    position += line.length + 1;
                    continue;
                }

                // Heading heuristics: short line ending with full stop (but not ? or !)
                const words = trimmed.split(/\s+/);

                // Track consecutive short lines (likely a list without bullets)
                if (words.length <= 12) {
                    consecutiveShortLines++;
                } else {
                    consecutiveShortLines = 0;
                }

                // If we're seeing 3+ consecutive short lines, likely a sentence list - skip
                if (consecutiveShortLines >= 3) {
                    position += line.length + 1;
                    continue;
                }

                // Consider it a heading if it's 2-12 words and ends with a full stop
                // (Longer lines are probably paragraphs)
                if (words.length >= 2 && words.length <= 12 && /\.$/.test(trimmed) && !/\.{2,}$/.test(trimmed)) {
                    const replacement = trimmed.slice(0, -1);
                    issues.push({
                        found: trimmed,
                        suggestion: replacement,
                        // No autoFix - let user decide if this is really a heading
                        position: position + line.indexOf(trimmed),
                        rule: this
                    });
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
        check: function(text) {
            const issues = [];
            const lines = text.split('\n');
            let position = 0;

            for (const line of lines) {
                const trimmed = line.trim();

                // Skip empty lines
                if (!trimmed) {
                    position += line.length + 1;
                    continue;
                }

                // Check if line is all caps (and has letters)
                const hasLetters = /[A-Z]/.test(trimmed);
                const isAllCaps = trimmed === trimmed.toUpperCase() && hasLetters;
                const words = trimmed.split(/\s+/);

                // Consider it a heading if it's 2-12 words, all caps, and doesn't end with typical sentence punctuation
                if (isAllCaps && words.length >= 2 && words.length <= 12) {
                    // Convert to sentence case
                    const sentenceCase = toSentenceCase(trimmed);
                    issues.push({
                        found: trimmed,
                        suggestion: sentenceCase,
                        autoFix: sentenceCase,
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
        category: 'spelling',
        description: 'Use \'for example\' instead of \'e.g.\' in general content. Latin abbreviations can be unclear to some readers.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/shortened-words-and-phrases/latin-shortened-forms',
        check: function(text) {
            const issues = [];
            // Match e.g. with optional comma after
            const regex = /\be\.g\.(?:,)?/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const replacement = 'for example' + (match[0].endsWith(',') ? ',' : '');
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
        category: 'spelling',
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
        category: 'spelling',
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
        category: 'spelling',
        description: 'Use \'and others\' instead of \'et al.\' in general content. Latin abbreviations can be unclear to some readers. Note: \'et al.\' is acceptable in academic references.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/shortened-words-and-phrases/latin-shortened-forms',
        check: function(text) {
            const issues = [];
            const regex = /\bet\s+al\.?/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
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
        category: 'spelling',
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

    // ==================== WATCH WORDS ====================
    {
        id: 'watch-words',
        name: 'Watch words',
        category: 'watch-words',
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

    // ==================== ORDINALS RULE ====================
    {
        id: 'punct-superscript-ordinal',
        name: 'Superscript ordinal',
        category: 'numbers-and-measurements',
        description: 'Use plain text for ordinal indicators (1st, 2nd, 3rd), not superscript (1ˢᵗ, 2ⁿᵈ, 3ʳᵈ). Superscript ordinals can cause accessibility issues.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/ordinal-numbers',
        check: function(text) {
            const issues = [];
            // Match numbers followed by superscript ordinal indicators
            // Superscript characters: ˢ (U+02E2), ᵗ (U+1D57), ⁿ (U+207F), ᵈ (U+1D48), ʳ (U+02B3), ʰ (U+02B0)
            const regex = /(\d+)(ˢᵗ|ⁿᵈ|ʳᵈ|ᵗʰ)/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const num = match[1];
                const superscript = match[2];
                let plain;
                switch(superscript) {
                    case 'ˢᵗ': plain = 'st'; break;
                    case 'ⁿᵈ': plain = 'nd'; break;
                    case 'ʳᵈ': plain = 'rd'; break;
                    case 'ᵗʰ': plain = 'th'; break;
                    default: plain = superscript;
                }
                const replacement = num + plain;
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
                const replacement = time + ' ' + tz;
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
            const regex = /\bCommonwealth government\b/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                issues.push({
                    found: match[0],
                    suggestion: 'Australian Government',
                    autoFix: 'Australian Government',
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
                        issues.push({
                            found: sentence,
                            suggestion: 'This sentence is ' + wordCount + ' words long',
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
        check: function(text) {
            const issues = [];
            // Match semicolon at end of line, followed by a bullet or number on the next line
            // Bullet markers: •●○◦▪▸-* or numbered 1. 1) a. a)
            const regex = /;[ \t]*\r?\n[ \t]*[•●○◦▪▸\-\*]|;[ \t]*\r?\n[ \t]*\d+[.)]\s|;[ \t]*\r?\n[ \t]*[a-z][.)]\s/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                issues.push({
                    found: ';',
                    suggestion: 'Remove the semicolon',
                    position: match.index,
                    rule: this
                });
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
        check: function(text) {
            const issues = [];
            // Match comma at end of line, followed by a bullet or number on the next line
            const regex = /,[ \t]*\r?\n[ \t]*[•●○◦▪▸\-\*]|,[ \t]*\r?\n[ \t]*\d+[.)]\s|,[ \t]*\r?\n[ \t]*[a-z][.)]\s/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                issues.push({
                    found: ',',
                    suggestion: 'Remove the comma',
                    position: match.index,
                    rule: this
                });
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
        check: function(text) {
            const issues = [];
            // Match 'and' or 'or' at end of line (possibly after punctuation), followed by bullet/number
            // Pattern: word boundary + and/or + optional punctuation + line break + bullet marker
            const regex = /\b(and|or)[;,]?[ \t]*\r?\n[ \t]*[•●○◦▪▸\-\*]|\b(and|or)[;,]?[ \t]*\r?\n[ \t]*\d+[.)]\s|\b(and|or)[;,]?[ \t]*\r?\n[ \t]*[a-z][.)]\s/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const found = match[1] || match[2] || match[3];
                issues.push({
                    found: found,
                    suggestion: 'Remove \'' + found + '\' from end of list item',
                    position: match.index,
                    rule: this
                });
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
        check: function(text) {
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
            for (const regex of patterns) {
                let match;
                while ((match = regex.exec(text)) !== null) {
                    // Find the position of 'etc' within the match
                    const etcPos = match[0].toLowerCase().indexOf('etc');
                    issues.push({
                        found: 'etc.',
                        suggestion: 'Remove \'etc.\' and use a lead-in like \'including\' or \'for example\' instead',
                        position: match.index + etcPos,
                        rule: this
                    });
                }
            }
            return issues;
        }
    },
    {
        id: 'list-inconsistent-caps',
        name: 'Inconsistent capitalisation in list',
        category: 'lists',
        description: 'List items should have consistent capitalisation. For sentence lists or stand-alone lists, start each item with a capital letter. For fragment lists, start each item with a lowercase letter, unless the first word is a proper noun.',
        link: 'https://www.stylemanual.gov.au/style-manual-resources/quick-guides/quick-guide-lists',
        check: function(text) {
            const issues = [];
            // Find list blocks (2+ consecutive lines with bullet/number markers)
            const lines = text.split(/\r?\n/);
            const bulletPattern = /^[ \t]*([•●○◦▪▸\-\*]|\d+[.)]|[a-z][.)])\s*(.+)/i;

            let listItems = [];
            let listStartPos = 0;
            let currentPos = 0;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const match = bulletPattern.exec(line);

                if (match) {
                    const itemText = match[2].trim();
                    if (itemText.length > 0) {
                        if (listItems.length === 0) {
                            listStartPos = currentPos;
                        }
                        listItems.push({
                            text: itemText,
                            position: currentPos + line.indexOf(itemText),
                            startsWithCapital: /^[A-Z]/.test(itemText),
                            startsWithLower: /^[a-z]/.test(itemText)
                        });
                    }
                } else {
                    // End of list block - check for inconsistency
                    if (listItems.length >= 2) {
                        const capsCount = listItems.filter(item => item.startsWithCapital).length;
                        const lowerCount = listItems.filter(item => item.startsWithLower).length;

                        // If there's a mix (not all caps and not all lower), flag it
                        if (capsCount > 0 && lowerCount > 0) {
                            // Flag the minority items
                            const shouldBeCaps = capsCount > lowerCount;
                            for (const item of listItems) {
                                if (shouldBeCaps && item.startsWithLower) {
                                    issues.push({
                                        found: item.text.substring(0, Math.min(30, item.text.length)) + (item.text.length > 30 ? '...' : ''),
                                        suggestion: 'Other items start with capitals',
                                        position: item.position,
                                        rule: this
                                    });
                                } else if (!shouldBeCaps && item.startsWithCapital) {
                                    // Check if it might be a proper noun (skip if so)
                                    const firstWord = item.text.split(/\s+/)[0];
                                    const likelyProperNoun = /^[A-Z][a-z]+$/.test(firstWord) &&
                                        ['Australia', 'Australian', 'Government', 'Monday', 'Tuesday', 'Wednesday',
                                         'Thursday', 'Friday', 'Saturday', 'Sunday', 'January', 'February', 'March',
                                         'April', 'May', 'June', 'July', 'August', 'September', 'October',
                                         'November', 'December'].includes(firstWord);
                                    if (!likelyProperNoun) {
                                        issues.push({
                                            found: item.text.substring(0, Math.min(30, item.text.length)) + (item.text.length > 30 ? '...' : ''),
                                            suggestion: 'Other items start with lowercase',
                                            position: item.position,
                                            rule: this
                                        });
                                    }
                                }
                            }
                        }
                    }
                    listItems = [];
                }

                currentPos += line.length + 1; // +1 for newline
            }

            // Check final list block if file doesn't end with non-list line
            if (listItems.length >= 2) {
                const capsCount = listItems.filter(item => item.startsWithCapital).length;
                const lowerCount = listItems.filter(item => item.startsWithLower).length;

                if (capsCount > 0 && lowerCount > 0) {
                    const shouldBeCaps = capsCount > lowerCount;
                    for (const item of listItems) {
                        if (shouldBeCaps && item.startsWithLower) {
                            issues.push({
                                found: item.text.substring(0, Math.min(30, item.text.length)) + (item.text.length > 30 ? '...' : ''),
                                suggestion: 'Other items start with capitals',
                                position: item.position,
                                rule: this
                            });
                        } else if (!shouldBeCaps && item.startsWithCapital) {
                            const firstWord = item.text.split(/\s+/)[0];
                            const likelyProperNoun = /^[A-Z][a-z]+$/.test(firstWord) &&
                                ['Australia', 'Australian', 'Government', 'Monday', 'Tuesday', 'Wednesday',
                                 'Thursday', 'Friday', 'Saturday', 'Sunday', 'January', 'February', 'March',
                                 'April', 'May', 'June', 'July', 'August', 'September', 'October',
                                 'November', 'December'].includes(firstWord);
                            if (!likelyProperNoun) {
                                issues.push({
                                    found: item.text.substring(0, Math.min(30, item.text.length)) + (item.text.length > 30 ? '...' : ''),
                                    suggestion: 'Other items start with lowercase',
                                    position: item.position,
                                    rule: this
                                });
                            }
                        }
                    }
                }
            }

            return issues;
        }
    },
    {
        id: 'list-inconsistent-punctuation',
        name: 'Inconsistent or incorrect punctuation in list',
        category: 'lists',
        description: 'List punctuation depends on list type. Sentence lists have a full stop on every item. Fragment lists have a full stop on the last item only. Stand-alone lists have no full stops.',
        link: 'https://www.stylemanual.gov.au/style-manual-resources/quick-guides/quick-guide-lists',
        check: function(text) {
            const issues = [];
            const lines = text.split(/\r?\n/);
            const bulletPattern = /^[ \t]*([•●○◦▪▸\-\*]|\d+[.)]|[a-z][.)])\s*(.+)/i;

            let listItems = [];
            let leadInLine = null;
            let currentPos = 0;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const match = bulletPattern.exec(line);

                if (match) {
                    const itemText = match[2].trim();
                    if (itemText.length > 0) {
                        // Check first letter for case (skip quotes, brackets, etc.)
                        const firstLetterMatch = itemText.match(/[a-zA-Z]/);
                        const firstLetter = firstLetterMatch ? firstLetterMatch[0] : null;

                        listItems.push({
                            text: itemText,
                            position: currentPos + line.indexOf(itemText),
                            endsWithPeriod: /\.$/.test(itemText),
                            startsWithCapital: firstLetter ? firstLetter === firstLetter.toUpperCase() : null,
                            isLast: false
                        });
                    }
                } else {
                    // Non-bullet line - end of list block
                    if (listItems.length >= 2) {
                        listItems[listItems.length - 1].isLast = true;
                        checkListPunctuation(listItems, leadInLine, issues, this);
                    }
                    // Store as potential lead-in for next list
                    leadInLine = line.trim();
                    listItems = [];
                }

                currentPos += line.length + 1;
            }

            // Check final list block
            if (listItems.length >= 2) {
                listItems[listItems.length - 1].isLast = true;
                checkListPunctuation(listItems, leadInLine, issues, this);
            }

            function checkListPunctuation(items, leadIn, issues, rule) {
                // Count patterns
                const withPeriod = items.filter(item => item.endsWithPeriod).length;
                const withCapital = items.filter(item => item.startsWithCapital === true).length;
                const withLowercase = items.filter(item => item.startsWithCapital === false).length;

                // Determine likely intended list type based on capitalisation
                const likelyFragment = withLowercase > withCapital;
                const likelyStandAloneOrSentence = withCapital > withLowercase;

                // Valid punctuation patterns
                const allPeriods = withPeriod === items.length;
                const onlyLastPeriod = withPeriod === 1 && items[items.length - 1].endsWithPeriod;
                const noPeriods = withPeriod === 0;

                // If punctuation pattern is valid, check for capitalisation mismatches
                if (allPeriods || onlyLastPeriod || noPeriods) {

                    // Capitalised items with only last full stop = ambiguous
                    if (onlyLastPeriod && likelyStandAloneOrSentence) {
                        if (withCapital === items.length) {
                            issues.push({
                                found: 'List with capitals and full stop on last item only',
                                suggestion: 'Fragment lists should start items in lower case (unless proper nouns). If this is a stand-alone list, remove the final full stop. If a sentence list, add full stops to all items.',
                                position: items[0].position,
                                rule: rule
                            });
                        }
                    }

                    // Lowercase items with no full stops = likely fragment list missing final stop
                    if (noPeriods && likelyFragment) {
                        issues.push({
                            found: items[items.length - 1].text.substring(0, Math.min(30, items[items.length - 1].text.length)) + (items[items.length - 1].text.length > 30 ? '...' : ''),
                            suggestion: 'Items starting in lower case suggest a fragment list, which needs a full stop on the last item.',
                            position: items[items.length - 1].position,
                            rule: rule
                        });
                    }

                    return; // Pattern is otherwise valid
                }

                // INCONSISTENT PATTERN - determine best advice based on capitalisation

                if (likelyFragment) {
                    // Lowercase items suggest fragment list
                    // Valid pattern: only last item has full stop

                    // Flag non-last items with full stops
                    const nonLastWithPeriods = items.filter(item => !item.isLast && item.endsWithPeriod);
                    for (const item of nonLastWithPeriods) {
                        issues.push({
                            found: item.text.substring(0, Math.min(30, item.text.length)) + (item.text.length > 30 ? '...' : ''),
                            suggestion: 'In fragment lists, only the last item has a full stop. Remove the full stop from this item.',
                            position: item.position,
                            rule: rule
                        });
                    }

                    // Flag if last item is missing full stop
                    if (!items[items.length - 1].endsWithPeriod) {
                        issues.push({
                            found: items[items.length - 1].text.substring(0, Math.min(30, items[items.length - 1].text.length)) + (items[items.length - 1].text.length > 30 ? '...' : ''),
                            suggestion: 'In fragment lists, the last item needs a full stop.',
                            position: items[items.length - 1].position,
                            rule: rule
                        });
                    }

                } else {
                    // Capitalised items suggest sentence list or stand-alone list
                    // Distinguish based on whether most items have full stops or not

                    if (withPeriod > items.length / 2) {
                        // Most have full stops - likely sentence list with some missing
                        for (const item of items) {
                            if (!item.endsWithPeriod) {
                                issues.push({
                                    found: item.text.substring(0, Math.min(30, item.text.length)) + (item.text.length > 30 ? '...' : ''),
                                    suggestion: 'In sentence lists, every item ends with a full stop. Add a full stop, or remove full stops from all items for a stand-alone list.',
                                    position: item.position,
                                    rule: rule
                                });
                            }
                        }
                    } else {
                        // Few have full stops - likely stand-alone list with errant full stops
                        for (const item of items) {
                            if (item.endsWithPeriod) {
                                issues.push({
                                    found: item.text.substring(0, Math.min(30, item.text.length)) + (item.text.length > 30 ? '...' : ''),
                                    suggestion: 'In stand-alone lists, items don\'t have full stops. Remove this full stop, or add full stops to all items for a sentence list.',
                                    position: item.position,
                                    rule: rule
                                });
                            }
                        }
                    }
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
                if (/(?:stage|phase|section|chapter|step|part|level|tier|grade|version|volume|appendix|annex|figure|table|item|option|priority|round|wave|track|point|number|no\.?|#)\s*$/i.test(before)) continue;

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
        check: function(text) {
            const issues = [];
            // Match numeral at start of sentence (after . ! ? or start of text, followed by space and capital context)
            const regex = /(?:^|[.!?]\s+)(\d+)(?:\s+[a-zA-Z])/gm;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const num = match[1];
                const numInt = parseInt(num);
                const pos = match.index + match[0].indexOf(num);
                const before = text.substring(Math.max(0, pos - 10), pos);
                const after = text.substring(pos + num.length, pos + num.length + 20);

                // Skip if preceded by comma (like "Thursday, 15 August" - number is part of date, not start of sentence)
                if (/,\s*$/.test(before)) {
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

                // Skip if this is a date (number followed by month name)
                if (/^\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\b/i.test(after)) {
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
            return issues;
        }
    },
    {
        id: 'numbers-measurement-words',
        name: 'Word number with unit symbol',
        category: 'numbers-and-measurements',
        description: 'Always use numerals with units of measurement. Write \'5 km\', not \'five km\'.',
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
                    const replacement = numeral + ' ' + match[2];
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
function checkText(text) {
    const allIssues = [];
    for (const rule of RULES) {
        const issues = rule.check(text);
        allIssues.push(...issues);
    }
    // Sort by position in text
    allIssues.sort((a, b) => a.position - b.position);
    return allIssues;
}
