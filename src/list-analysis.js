/**
 * Style Manual Check - list analysis rules
 *
 * Ported from the Style Manual list formatter
 * (https://rjc27-sm.github.io/list-formatter/). The classification logic -
 * item grammar, lead-in analysis and list-type detection - is carried over
 * so the two tools agree on what a sentence, fragment or stand-alone list is.
 *
 * These rules replace the older 'inconsistent capitals' and 'inconsistent
 * punctuation' list rules: instead of only spotting that items disagree,
 * they work out which list type is intended and say what each item should be.
 */

// Base-form verbs used to spot imperative-style items ('use everyday words').
// Deliberately excludes words that are commonly nouns at the start of a phrase
// (support, report, order, plan, record, review, monitor, etc.).
const VERB_LIST = ['be','have','do','say','get','make','go','know','take','see','come','think','use','find','give','tell','call','try','ask','need','feel','become','leave','put','keep','let','begin','seem','help','talk','turn','show','hear','run','move','believe','hold','bring','happen','write','provide','sit','lose','meet','include','continue','learn','change','lead','understand','speak','allow','spend','grow','open','walk','win','offer','remember','consider','appear','buy','wait','serve','send','expect','build','stay','reach','remain','suggest','sell','require','decide','pull','explain','develop','carry','break','eat','catch','choose','gather','apply','produce','prevent','operate','communicate','achieve','complete','obtain','attend','register','submit','ensure','identify','describe','select','enter','contact','confirm','attach','sign','arrange','prepare','update','assess'];

const SUBJECT_PRONOUNS = ['i','you','we','they','he','she','it'];

const FINITE_VERBS = ['is','are','was','were','will','would','shall','should','can','could','may','might','must','has','have','had','do','does','did'];

// Words a phrase lead-in dangles on - the items complete the thought.
const DANGLING_WORDS = ['of','for','with','to','in','on','at','by','about','from','into','like','as','including','namely','its','their','our','your','my','his','her','the','a','an','these','those','this','that','following','below','such'];

// Heuristic proper-noun hint kept intentionally narrow; default is to lowercase.
const PROPER_HINT = /^(Australia|Australian|Canberra|Adelaide|Medicare|AIHW|APSC|Commonwealth|Indigenous|First|Aboriginal|Torres|NSW|ACT|Sydney|Melbourne)$/;

function firstWord(text) {
    return text.trim().split(/\s+/)[0].replace(/[^A-Za-z'-]/g, '').toLowerCase();
}

function isBaseVerb(word) {
    return VERB_LIST.includes(word);
}

// Strip leading bullet/number markers and surrounding whitespace.
function stripMarker(item) {
    return item
        .replace(/^\s*[-–—•‣◦⁃∙*▪■]\s*/, '')
        .replace(/^\s*[○◦o]\s+/, '')
        .replace(/^\s*\d+[.)]\s*/, '')
        .replace(/^\s*[a-z][.)]\s*/i, '')
        .trim();
}

// Classify a single item: 'clause' (independent statement), 'imperative'
// (command), 'gerund' (an -ing phrase) or 'phrase' (noun phrase).
function classifyItem(cleanText) {
    const words = cleanText.split(/\s+/);
    const fw = firstWord(cleanText);

    if (fw === 'please') return 'imperative';
    if (/[a-z]{2}ing$/.test(fw)) return 'gerund';
    if (isBaseVerb(fw)) return 'imperative';
    if (SUBJECT_PRONOUNS.includes(fw)) return 'clause';
    for (let i = 1; i <= 2 && i < words.length; i++) {
        const w = words[i].replace(/[^A-Za-z'-]/g, '').toLowerCase();
        if (FINITE_VERBS.includes(w)) return 'clause';
    }
    return 'phrase';
}

// Imperative verbs common in style guidance that head a complete-sentence item
// but are kept out of the noun-safe base-verb list above. Used ONLY to spot
// sentence items under a heading - never to reclassify an individual item.
const IMPERATIVE_EXTRA = new Set(['capitalise', 'capitalize', 'avoid', 'follow',
    'spell', 'format', 'prefer', 'replace', 'insert', 'treat']);

const RELATIVE_PRONOUNS = ['that', 'which', 'who', 'whom', 'whose', 'where', 'when'];

const cleanWord = w => w.toLowerCase().replace(/[^a-z'’-]/g, '');

// Does the item read as a complete sentence - a command, or a statement with a
// finite verb? Stand-alone list items are short noun phrases and fail this;
// instructions and rules pass it. Deliberately conservative to avoid promoting
// genuine stand-alone lists.
function looksLikeSentence(text) {
    const words = text.split(/\s+/);
    if (words.length < 4) return false;             // stand-alone items are short
    const fw = firstWord(text);
    if (fw === 'please' || isBaseVerb(fw) || IMPERATIVE_EXTRA.has(fw)) return true;
    // Imperative with a fronted adverbial: 'In legal material, use initial ...'
    for (let i = 0; i < words.length - 1 && i < 6; i++) {
        if (/,$/.test(words[i])) {
            const next = cleanWord(words[i + 1]);
            if (isBaseVerb(next) || IMPERATIVE_EXTRA.has(next)) return true;
            break;                                  // only the first comma clause
        }
    }
    // Statement with a finite verb (ignore verbs inside a relative clause).
    return words.some((w, i) => {
        const c = cleanWord(w);
        const prev = i > 0 ? cleanWord(words[i - 1]) : '';
        if (RELATIVE_PRONOUNS.includes(prev)) return false;
        return FINITE_VERBS.includes(c) || /n['’]t$/.test(c);
    });
}

// Classify the lead-in: 'sentence', 'phrase' or 'heading'.
function classifyLeadIn(rawLeadIn) {
    const trimmed = (rawLeadIn || '').trim();
    if (!trimmed) return 'heading';
    const noColon = trimmed.replace(/:\s*$/, '').trim();
    const endsColon = /:\s*$/.test(trimmed);
    const endsSentence = /[.!?]\s*$/.test(trimmed);

    const lastWord = noColon.replace(/[.!?]\s*$/, '').trim().split(/\s+/).pop()
        .toLowerCase().replace(/[^a-z'-]/g, '');
    const danglesOnPhrase = DANGLING_WORDS.includes(lastWord);

    const words = noColon.split(/\s+/);
    let hasFiniteClause = false;
    for (let i = 0; i < words.length - 1; i++) {
        const w = words[i].toLowerCase().replace(/[^a-z'-]/g, '');
        const next = words[i + 1].toLowerCase().replace(/[^a-z'-]/g, '');
        if ((SUBJECT_PRONOUNS.includes(w) || /^[a-z]+s?$/.test(w)) && FINITE_VERBS.includes(next)) {
            hasFiniteClause = true;
            break;
        }
    }

    if (!endsColon && !endsSentence) {
        if (danglesOnPhrase) return 'phrase';
        return 'heading';
    }
    if (danglesOnPhrase) return 'phrase';
    if (endsSentence) return 'sentence';
    if (hasFiniteClause) return 'sentence';
    return 'phrase';
}

// Keep the capital if the item looks like it starts with a proper noun,
// acronym or code.
function looksProper(word) {
    if (/\d/.test(word)) return true;            // codes/labels e.g. T1, M365
    if (/^[A-Z]+$/.test(word)) return true;      // all-caps acronym
    if (PROPER_HINT.test(word)) return true;
    return false;
}

/**
 * Find lists in the text: groups of 2 or more consecutive list lines
 * (from Word list formatting via listLines, or bullet/number markers in
 * pasted text), each with the nearest preceding non-blank line as lead-in.
 */
function findLists(text, listLines) {
    const lines = text.split(/\r?\n/);
    const lineStarts = [];
    let pos = 0;
    for (const line of lines) {
        lineStarts.push(pos);
        pos += line.length + 1;
    }
    const bulletPattern = /^[ \t]*([•●○◦▪▸\-*]|\d+[.)]|[a-z][.)])\s+/i;
    const isItem = i => (listLines && listLines.has(i)) ||
        bulletPattern.test(lines[i] || '');

    const lists = [];
    let current = null;
    for (let i = 0; i < lines.length; i++) {
        if (isItem(i) && lines[i].trim()) {
            if (!current) {
                let leadIn = '';
                for (let j = i - 1; j >= 0; j--) {
                    if (!lines[j].trim()) continue;
                    if (!isItem(j)) leadIn = lines[j];
                    break;
                }
                current = { leadIn, itemIdxs: [] };
            }
            current.itemIdxs.push(i);
        } else {
            if (current && current.itemIdxs.length >= 2) lists.push(current);
            current = null;
        }
    }
    if (current && current.itemIdxs.length >= 2) lists.push(current);

    for (const list of lists) {
        list.items = list.itemIdxs.map(i => {
            const raw = lines[i];
            const stripped = stripMarker(raw);
            const offset = stripped ? Math.max(raw.indexOf(stripped), 0) : 0;
            return { idx: i, raw, stripped, start: lineStarts[i] + offset };
        }).filter(it => it.stripped);
    }
    return lists.filter(l => l.items.length >= 2);
}

/** Decide the list type and whether the items are parallel. */
function analyseList(list) {
    const texts = list.items.map(it => it.stripped.replace(/[.!?;,]+\s*$/, ''));
    const granular = texts.map(classifyItem);
    const set = new Set(granular);
    const hasClause = set.has('clause');
    const hasImper = set.has('imperative');
    const hasGerund = set.has('gerund');

    let parallel = true, mismatch = null;
    if (hasClause && set.size > 1) { parallel = false; mismatch = 'statement'; }
    else if (hasImper && hasGerund) { parallel = false; mismatch = 'command'; }

    const allClause = granular.every(c => c === 'clause');
    const allPhrase = granular.every(c => c === 'phrase' || c === 'gerund');
    const leadInType = classifyLeadIn(list.leadIn);
    const allEndWithStop = list.items.every(it =>
        /^[A-Z]/.test(it.stripped) && /[.!?]\s*$/.test(it.stripped));

    // A stand-alone list is short noun phrases under a heading. If most items
    // are complete sentences (instructions or rules), it is really a sentence
    // list and each item needs a full stop - not a stand-alone list.
    const sentenceCount = texts.filter(looksLikeSentence).length;
    const mostlySentences = texts.length > 0 &&
        sentenceCount >= Math.ceil(texts.length * 0.6);

    let listType;
    if (leadInType === 'heading') {
        listType = (allClause || mostlySentences) ? 'sentence' : 'standAlone';
    } else if (allClause) {
        listType = 'sentence';
    } else if (allPhrase) {
        listType = 'fragment';
    } else {
        listType = (leadInType === 'sentence' || allEndWithStop) ? 'sentence' : 'fragment';
    }
    return { listType, leadInType, granular, parallel, mismatch };
}

const TYPE_LABEL = {
    sentence: 'sentence list (each item is a complete sentence)',
    fragment: 'fragment list (each item completes the lead-in)',
    standAlone: 'stand-alone list (a series of items under a heading)'
};

const LIST_LINK = 'https://www.stylemanual.gov.au/structuring-content/lists';

const LIST_RULES = [
    {
        id: 'list-parallel-structure',
        name: 'List items not parallel',
        category: 'lists',
        description: 'Every item in a list should follow the same grammatical pattern so they all read smoothly after the lead-in.',
        link: LIST_LINK,
        check: function(text, headingLines, listLines) {
            const issues = [];
            for (const list of findLists(text, listLines)) {
                const a = analyseList(list);
                if (a.parallel) continue;
                // Anchor on the item whose form differs from the majority
                const counts = {};
                a.granular.forEach(g => { counts[g] = (counts[g] || 0) + 1; });
                const majority = Object.keys(counts).sort((x, y) => counts[y] - counts[x])[0];
                const oddIndex = a.granular.findIndex(g => g !== majority);
                const odd = list.items[oddIndex] || list.items[0];
                const note = a.mismatch === 'command'
                    ? 'One item is a command while others are phrases. Rewrite the odd one out to match its neighbours, or move it out of the list.'
                    : 'Some items are complete statements while others are short phrases or commands. Rewrite the items so they all follow the same pattern.';
                issues.push({
                    found: odd.stripped,
                    suggestion: 'Rewrite this item to match the structure of the others',
                    note: note,
                    position: odd.start,
                    rule: this
                });
            }
            return issues;
        }
    },
    {
        id: 'list-item-capitals',
        name: 'List item capitalisation',
        category: 'lists',
        description: 'Sentence and stand-alone list items start with a capital letter. Fragment list items start lower case unless they begin with a proper noun.',
        link: LIST_LINK,
        check: function(text, headingLines, listLines) {
            const issues = [];
            for (const list of findLists(text, listLines)) {
                const a = analyseList(list);
                if (!a.parallel) continue; // structure first, then formatting
                for (const item of list.items) {
                    const first = item.stripped.split(/\s+/)[0];
                    if (!first) continue;
                    if (a.listType === 'fragment') {
                        if (/^[A-Z]/.test(first) && !looksProper(first)) {
                            issues.push({
                                found: first,
                                suggestion: first.charAt(0).toLowerCase() + first.slice(1),
                                autoFix: first.charAt(0).toLowerCase() + first.slice(1),
                                note: 'This looks like a ' + TYPE_LABEL.fragment + ', so items start lower case. Keep the capital if this is a proper noun.',
                                position: item.start,
                                rule: this
                            });
                        }
                    } else if (/^[a-z]/.test(first)) {
                        issues.push({
                            found: first,
                            suggestion: first.charAt(0).toUpperCase() + first.slice(1),
                            autoFix: first.charAt(0).toUpperCase() + first.slice(1),
                            note: 'This looks like a ' + TYPE_LABEL[a.listType] + ', so items start with a capital letter.',
                            position: item.start,
                            rule: this
                        });
                    }
                }
            }
            return issues;
        }
    },
    {
        id: 'list-item-end-punctuation',
        name: 'List item end punctuation',
        category: 'lists',
        description: 'Sentence list items end with a full stop. In fragment lists, only the last item ends with a full stop. Stand-alone list items have no end punctuation.',
        link: LIST_LINK,
        check: function(text, headingLines, listLines) {
            const issues = [];
            for (const list of findLists(text, listLines)) {
                const a = analyseList(list);
                if (!a.parallel) continue;
                list.items.forEach((item, i) => {
                    const last = i === list.items.length - 1;
                    const endsStop = /[.!?]\s*$/.test(item.stripped);
                    const endPos = item.start + item.stripped.length - 1;
                    const lastWordMatch = item.stripped.match(/(\S+)\s*$/);
                    const lastWord = lastWordMatch ? lastWordMatch[1] : item.stripped;
                    const lastWordPos = item.start + item.stripped.length - lastWord.length;
                    const typeNote = 'This looks like a ' + TYPE_LABEL[a.listType] + '.';

                    if (a.listType === 'sentence' && !endsStop &&
                        !/[;,]\s*$/.test(item.stripped)) {
                        issues.push({
                            found: lastWord,
                            suggestion: lastWord + '.',
                            autoFix: lastWord + '.',
                            note: typeNote + ' Each item ends with a full stop.',
                            position: lastWordPos,
                            rule: this
                        });
                    } else if (a.listType === 'fragment') {
                        if (!last && /[.!?]$/.test(item.stripped.trim())) {
                            issues.push({
                                found: lastWord,
                                suggestion: lastWord.replace(/[.!?]+$/, ''),
                                autoFix: lastWord.replace(/[.!?]+$/, ''),
                                note: typeNote + ' Only the last item ends with a full stop.',
                                position: lastWordPos,
                                rule: this
                            });
                        } else if (last && !endsStop && !/[;,]\s*$/.test(item.stripped)) {
                            issues.push({
                                found: lastWord,
                                suggestion: lastWord + '.',
                                autoFix: lastWord + '.',
                                note: typeNote + ' The last item ends with a full stop.',
                                position: lastWordPos,
                                rule: this
                            });
                        }
                    } else if (a.listType === 'standAlone' && endsStop) {
                        issues.push({
                            found: lastWord,
                            suggestion: lastWord.replace(/[.!?]+$/, ''),
                            autoFix: lastWord.replace(/[.!?]+$/, ''),
                            note: typeNote + ' Items have no end punctuation.',
                            position: lastWordPos,
                            rule: this
                        });
                    }
                });
            }
            return issues;
        }
    }
];

export { LIST_RULES };
