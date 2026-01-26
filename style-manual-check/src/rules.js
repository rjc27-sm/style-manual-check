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
        description: 'Use sentence case for headings, not title case. Only capitalise the first word and proper nouns. Note: you may need to adjust the suggested fix for proper nouns.',
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

            for (const line of lines) {
                const trimmed = line.trim();

                // Skip empty lines
                if (!trimmed) {
                    position += line.length + 1;
                    continue;
                }

                // Heading heuristics: short line ending with full stop (but not ? or !)
                const words = trimmed.split(/\s+/);

                // Consider it a heading if it's 2-12 words and ends with a full stop
                // (Longer lines are probably paragraphs)
                if (words.length >= 2 && words.length <= 12 && /\.$/.test(trimmed) && !/\.{2,}$/.test(trimmed)) {
                    const replacement = trimmed.slice(0, -1);
                    issues.push({
                        found: trimmed,
                        suggestion: replacement,
                        autoFix: replacement,
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
                issues.push({
                    found: match[0],
                    suggestion: 'and so on',
                    autoFix: 'and so on',
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
                    issues.push({
                        found: match[0],
                        suggestion: suggestion,
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
        category: 'punctuation',
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

    // ==================== READABILITY RULES ====================
    {
        id: 'readability-sentence-length',
        name: 'Long sentence',
        category: 'readability',
        description: 'Sentences over 25 words can be harder to read. Consider breaking up this long sentence.',
        link: 'https://www.stylemanual.gov.au/accessible-and-inclusive-content/how-people-read',
        check: function(text) {
            const issues = [];
            // Split text into sentences using common sentence-ending punctuation
            // This regex matches sentence-ending punctuation followed by space or end of string
            const sentenceRegex = /[^.!?]*[.!?]+(?:\s|$)/g;
            let match;
            let position = 0;

            while ((match = sentenceRegex.exec(text)) !== null) {
                const sentence = match[0].trim();
                if (!sentence) continue;

                // Count words (split on whitespace, filter out empty strings)
                const words = sentence.split(/\s+/).filter(w => w.length > 0);
                const wordCount = words.length;

                if (wordCount > 25) {
                    issues.push({
                        found: sentence,
                        suggestion: 'This sentence is ' + wordCount + ' words long',
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
