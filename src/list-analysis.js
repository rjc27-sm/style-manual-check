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
// (support, report, order, plan, record, review, monitor, contact, etc. -
// 'contact details for the party office' is a noun phrase, not a command).
const VERB_LIST = ['be','have','do','say','get','make','go','know','take','see','come','think','use','find','give','tell','call','try','ask','need','feel','become','leave','put','keep','let','begin','seem','help','talk','turn','show','hear','run','move','believe','hold','bring','happen','write','provide','sit','lose','meet','include','continue','learn','change','lead','understand','speak','allow','spend','grow','open','walk','win','offer','remember','consider','appear','buy','wait','serve','send','expect','build','stay','reach','remain','suggest','sell','require','decide','pull','explain','develop','carry','break','eat','catch','choose','gather','apply','produce','prevent','operate','communicate','achieve','complete','obtain','attend','register','submit','ensure','identify','describe','select','enter','confirm','attach','sign','arrange','prepare','update','assess'];

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
    // A base-form verb followed by 'of' is a noun ('use of restraints',
    // 'register of interests', 'change of address'), not a command.
    if (isBaseVerb(fw) && words[1] && words[1].replace(/[^A-Za-z]/g, '').toLowerCase() === 'of') return 'phrase';
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
    'spell', 'format', 'prefer', 'replace', 'insert', 'treat', 'start']);

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
    const secondIsOf = words[1] && cleanWord(words[1]) === 'of';
    if (fw === 'please' ||
        ((isBaseVerb(fw) || IMPERATIVE_EXTRA.has(fw)) && !secondIsOf)) return true;
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
    const bulletPattern = /^[ \t]*([•●○◦▪▸–—\-*]|\d+[.)]|[a-z][.)])\s+/i;
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

    // Are the items really complete sentences (instructions or rules)? The
    // shallow item classifier tags a sentence with a fronted adverbial - 'In a
    // fragment list ..., use a lower-case letter' - as a 'phrase', so a list of
    // them looks stand-alone or fragment when it is a sentence list. Only trust
    // this when the lead-in is NOT a dangling stem ('phrase'): after a stem like
    // 'you will need to:' the items legitimately complete it as a fragment list.
    const sentenceCount = texts.filter(looksLikeSentence).length;
    const mostlySentences = texts.length > 0 &&
        sentenceCount >= Math.ceil(texts.length * 0.6);

    let listType;
    if (allClause) {
        listType = 'sentence';
    } else if (mostlySentences && leadInType !== 'phrase') {
        listType = 'sentence';
    } else if (leadInType === 'heading') {
        listType = 'standAlone';
    } else if (allPhrase) {
        listType = 'fragment';
    } else {
        // Mixed item forms: let the majority of items decide, not the lead-in.
        // One misread item (a noun phrase taken for a command) must not drag a
        // whole fragment list into sentence formatting (AEC list, 28 July 2026).
        const phraseCount = granular.filter(g => g === 'phrase' || g === 'gerund').length;
        if (!allEndWithStop && phraseCount >= Math.ceil(granular.length * 0.6)) {
            listType = 'fragment';
        } else {
            listType = (leadInType === 'sentence' || allEndWithStop) ? 'sentence' : 'fragment';
        }
    }
    return { listType, leadInType, granular, parallel, mismatch };
}

const LIST_LINK = 'https://www.stylemanual.gov.au/structuring-content/lists';

/*
 * One comment per list (agreed with Jen, 28 July 2026). The item-level
 * checks below still decide WHETHER a list needs attention, but the
 * comment no longer names the inferred list type or suggests per-item
 * fixes: a wrong type guess (broken paragraphs, misread items) produced
 * confident wrong diagnoses, one per item. The Format a list tool is the
 * place to fix a whole list.
 */

// Would the detailed item checks flag this list? Mirrors the retired
// per-item rules: parallel structure, item capitalisation and item end
// punctuation for the inferred list type.
function listNeedsAttention(list) {
    const a = analyseList(list);
    if (!a.parallel) return true;
    const items = list.items;
    for (let i = 0; i < items.length; i++) {
        const stripped = items[i].stripped;
        const first = stripped.split(/\s+/)[0];
        if (!first) continue;
        const last = i === items.length - 1;
        const endsStop = /[.!?]\s*$/.test(stripped);
        const endsSoft = /[;,]\s*$/.test(stripped);
        if (a.listType === 'fragment') {
            if (/^[A-Z]/.test(first) && !looksProper(first)) return true;
            if (!last && endsStop) return true;
            if (last && !endsStop && !endsSoft) return true;
        } else {
            if (/^[a-z]/.test(first)) return true;
            if (a.listType === 'sentence' && !endsStop && !endsSoft) return true;
            if (a.listType === 'standAlone' && endsStop) return true;
        }
    }
    return false;
}

const LIST_RULES = [
    {
        id: 'list-check',
        name: 'Check this list',
        category: 'lists',
        description: 'List formatting can be complex.',
        link: LIST_LINK,
        check: function(text, headingLines, listLines) {
            const issues = [];
            for (const list of findLists(text, listLines)) {
                if (!listNeedsAttention(list)) continue;
                // Anchor on the first word of the first item: highlighting the
                // whole item would overlap tracked changes inside it, and the
                // overlap rule in annotateDocx would demote those to comments.
                const first = list.items[0];
                const word = first.stripped.split(/\s+/)[0];
                issues.push({
                    found: word,
                    position: first.start,
                    rule: this
                });
            }
            return issues;
        }
    }
];

export { LIST_RULES };
