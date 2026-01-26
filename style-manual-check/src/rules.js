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
                    issues.push({
                        found: word,
                        suggestion: preserveCase(word, SPELLINGS[lower]),
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
                    issues.push({
                        found: word,
                        suggestion: preserveCase(word, SPELLINGS[lower]),
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
                    issues.push({
                        found: match[1],
                        suggestion: preserveCase(match[1], SPELLINGS[usWord]),
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
                    issues.push({
                        found: match[1],
                        suggestion: preserveCase(match[1], SPELLINGS[usWord]),
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
                    issues.push({
                        found: match[1],
                        suggestion: preserveCase(match[1], SPELLINGS[usWord]),
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
                    issues.push({
                        found: match[1],
                        suggestion: preserveCase(match[1], SPELLINGS[usWord]),
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
                        issues.push({
                            found: match[1],
                            suggestion: preserveCase(match[1], SPELLINGS[usWord]),
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
                    issues.push({
                        found: match[0],
                        suggestion: preserveCase(match[0], correct),
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
        description: 'Use \'judgement\' in Australian English, except for legal judgments (court decisions).',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/spelling/common-misspellings-and-word-confusion',
        check: function(text) {
            const issues = [];
            const regex = /\b(judgment|judgments)\b/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const suggestion = match[0].toLowerCase() === 'judgment' ? 'judgement' : 'judgements';
                issues.push({
                    found: match[0],
                    suggestion: preserveCase(match[0], suggestion) + ' (unless referring to a court judgment)',
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
                issues.push({
                    found: match[0],
                    suggestion: match[1] + ' – ' + match[2],
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
                issues.push({
                    found: match[0],
                    suggestion: match[1] + ' – ' + match[2],
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
                issues.push({
                    found: match[0],
                    suggestion: match[1] + ' ',
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
        description: 'Don\'t add spaces around forward slashes. Write \'and/or\' not \'and / or\'.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/punctuation/forward-slashes',
        check: function(text) {
            const issues = [];
            const regex = /(\w) \/ (\w)/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                issues.push({
                    found: match[0],
                    suggestion: match[1] + '/' + match[2],
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
        description: 'Australian style uses single quotation marks for direct speech and quoted material.',
        link: 'https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/punctuation/quotation-marks',
        check: function(text) {
            const issues = [];
            // Match text in double quotes (simple pattern)
            const regex = /"([^"]+)"/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                // Don't flag if it contains single quotes (nested quote)
                if (!match[1].includes("'")) {
                    issues.push({
                        found: match[0],
                        suggestion: "'" + match[1] + "'",
                        position: match.index,
                        rule: this
                    });
                }
            }
            return issues;
        }
    },

    // ==================== DATE RULES ====================
    {
        id: 'date-us-format',
        name: 'US date format',
        category: 'dates',
        description: 'Write dates as \'15 January 2024\' not \'January 15, 2024\'. Day comes before month in Australian style.',
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
                issues.push({
                    found: match[0],
                    suggestion: day + ' ' + month + ' ' + year,
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
        category: 'dates',
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
                    issues.push({
                        found: match[0],
                        suggestion: second + ' ' + months[first - 1] + ' ' + year,
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

    // ==================== CAPITALISATION RULES ====================
    {
        id: 'caps-title-case-heading',
        name: 'Possible title case heading',
        category: 'capitalisation',
        description: 'Australian Government style uses sentence case for headings, not title case. In sentence case, only the first word and proper nouns are capitalised. For example, \'Managing your account settings\' not \'Managing Your Account Settings\'.',
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
                        issues.push({
                            found: trimmed,
                            suggestion: 'Check: is this a heading? If so, use sentence case',
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
                issues.push({
                    found: match[0],
                    suggestion: 'for example' + (match[0].endsWith(',') ? ',' : ''),
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
                issues.push({
                    found: match[0],
                    suggestion: 'that is' + (match[0].endsWith(',') ? ',' : ''),
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
                    suggestion: 'and others (or keep \'et al.\' for references)',
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
                issues.push({
                    found: match[0],
                    suggestion: num + plain,
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
        category: 'dates',
        description: 'Write the time zone after the time, not before. For example, \'13:45 AEST\' not \'AEST 13:45\'.',
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
                issues.push({
                    found: match[0],
                    suggestion: time + ' ' + tz,
                    position: match.index,
                    rule: this
                });
            }
            return issues;
        }
    }
];

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
