/**
 * Proof Positive (IM2026) - deterministic list conventions for AI answers.
 *
 * The Ask and Make-it-plain prompts require the model to declare each
 * bulleted list's Style Manual type on its own line before the list
 * ('[[list:sentence]]', '[[list:fragment]]' or '[[list:standalone]]').
 * This module strips those markers and imposes the declared type's
 * punctuation, the same drafts-then-impose split that makes Format-a-list
 * reliable: the model judges the type, deterministic code does the
 * mechanics. It runs in the Worker, so the marker syntax never reaches a
 * browser.
 *
 * A list with no marker is left completely untouched - the engine's own
 * type guess is deliberately never used here (a short imperative sentence
 * list reads as 'phrase' to list-analysis.js, so guessing repunctuates
 * correct lists; rejected three times, see the 17-18 Aug 2026 notes).
 *
 * The conventions match lists.html's formatFragment/formatSentence/
 * formatStandAlone. That duplication is deliberate (agreed 18 Aug 2026):
 * those formatters are exercised daily by the tool that works best and
 * have no automated coverage, so they stay untouched. If a convention
 * ever changes, change BOTH files.
 *
 * Capitals are only ever imposed UPWARDS. Forcing lower case on a
 * fragment item is what wrongly lower-cased 'Blocker'; like
 * formatFragmentAI, this trusts the model's case where the convention
 * does not demand a capital.
 */

// A marker on its own line. 'stand-alone' is accepted for 'standalone' -
// the Style Manual itself hyphenates the word, so the model may too.
const MARKER = /^[ \t]*\[\[[ \t]*list[ \t]*:[ \t]*(sentence|fragment|stand-?alone)[ \t]*\]\][ \t]*$/i;

// A marker that leaked into a line with other text on it. Never imposed
// from, but always removed - a reader must never see marker syntax.
const INLINE_MARKER = /[ \t]*\[\[[ \t]*list[ \t]*:[ \t]*(?:sentence|fragment|stand-?alone)[ \t]*\]\]/gi;

// A flat markdown list item: bullet at column 0. Leading whitespace means
// a nested level, which this module refuses to repunctuate (group 1 is
// the indent, kept so a mixed block can be detected and skipped whole).
const ITEM = /^([ \t]*)([-•*])([ \t]+)(.*)$/;

// Closing quotes and brackets that end punctuation may sit inside or
// outside of ('two weeks.' vs 'two weeks'.).
const CLOSERS = "['’\"”)\\]]";
const ENDS_STOPPED = new RegExp('[.!?]' + CLOSERS + '*$');
const TRAILING_PUNCT = new RegExp('[.;,:]+(' + CLOSERS + '*)[ \t]*$');

/** Capitalise the first letter, skipping markdown and quote prefixes such
 *  as '**' or '\'' - sentence capitalisation applies to '**essential**'
 *  too (the 18 Aug 2026 minimal-capitals collision). Never lower-cases. */
function upperFirst(text) {
    return text.replace(/^([*_'‘"“(\[]{0,6})([a-z])/, (m, pre, ch) => pre + ch.toUpperCase());
}

/** Remove a trailing full stop, semicolon, comma or colon, whichever side
 *  of a closing quote it sits on. '!' and '?' are left alone: an item the
 *  model ended that emphatically is safer echoed than silently flattened. */
function stripStop(text) {
    return text.replace(TRAILING_PUNCT, '$1').replace(/[ \t]+$/, '');
}

/** End the item with a full stop (after any closing quote), converting a
 *  trailing semicolon, comma or colon rather than stacking on top of it. */
function ensureStop(text) {
    if (ENDS_STOPPED.test(text)) return text;
    const t = text.replace(TRAILING_PUNCT, '$1').replace(/[ \t]+$/, '');
    return t && t + '.';
}

function imposeType(type, text, last) {
    if (!text) return text;
    if (type === 'sentence') return ensureStop(upperFirst(text));
    if (type === 'standalone') return stripStop(upperFirst(text));
    return last ? ensureStop(text) : stripStop(text); // fragment
}

/**
 * Strip every [[list:type]] marker from the markdown and impose each
 * declared type on the flat bulleted list that follows it. Input with no
 * marker anywhere is returned byte-identical.
 */
export function applyListConventions(markdown) {
    if (typeof markdown !== 'string' || !/\[\[[ \t]*list[ \t]*:/i.test(markdown)) {
        return markdown;
    }
    const lines = markdown.split('\n');
    const out = [];
    let pending = null;   // declared type waiting for its list
    let proseGap = 0;     // non-blank, non-item lines seen since the marker
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        const m = line.match(MARKER);
        if (m) {
            // A second marker before the first found its list orphans the
            // first; both stay stripped either way.
            pending = m[1].toLowerCase().replace('-', '');
            proseGap = 0;
            i++;
            continue;
        }
        if (ITEM.test(line)) {
            const block = [];
            let nested = false;
            while (i < lines.length && ITEM.test(lines[i])) {
                const im = lines[i].match(ITEM);
                if (im[1]) nested = true;
                block.push(im);
                i++;
            }
            if (pending && !nested) {
                block.forEach((im, idx) => {
                    const text = imposeType(pending, im[4], idx === block.length - 1);
                    out.push(im[1] + im[2] + im[3] + text);
                });
            } else {
                // Unmarked, or multilevel (which this module never touches).
                block.forEach(im => out.push(im[0]));
            }
            pending = null;
            continue;
        }
        if (pending && line.trim()) {
            // Allow a lead-in (and little else) between marker and list; a
            // marker stranded further from any list must not grab one later.
            proseGap++;
            if (proseGap > 2) pending = null;
        }
        out.push(line);
        i++;
    }
    // Belt and braces: a marker the model wrote mid-line was not imposed
    // from, but it must still never be shown to a reader.
    return out.join('\n').replace(INLINE_MARKER, '');
}
