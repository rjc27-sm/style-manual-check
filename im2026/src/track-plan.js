/**
 * Proof Positive - tracked-changes planning
 * Decides which issues become Word tracked changes in the downloaded
 * document and computes the smallest text edit for each. Issues without
 * a plan stay as review comments (see src/docx-annotate.js).
 * The split was agreed with Jen on 15 July 2026: mechanical fixes only.
 */

// Rules whose autoFix stays a comment. Each fix is deterministic in code
// but can still be wrong in context, so the author decides.
export const COMMENT_ONLY_RULES = new Set([
    'heading-title-case',        // sentence-casing flattens proper nouns
    'heading-all-caps',          // same sentence-casing risk
    'heading-bold-not-styled',   // the fix is a style change, not a text change
    'punct-serial-comma',        // the Style Manual allows it for clarity
    'punct-capital-after-colon', // no proper-noun list can cover every name
    'numbers-words-to-numerals', // figures of speech trip it
    'govt-generic-department',   // house styles often capitalise these
    'govt-generic-minister',
    'govt-generic-agency',
    'list-and-or'                // depends on the inferred list type - the
                                 // Format a list tool handles whole lists
]);
// ('list-item-capitals' and 'list-item-end-punctuation' were retired on
// 28 July 2026 - lists now get a single 'list-check' comment with no autoFix.)

/**
 * Attach a trackPlan to every issue that qualifies for a tracked change:
 * { start, deleteText, insertText } in fullText coordinates. Issues left
 * without a plan become comments as before.
 */
export function planTrackedChanges(issues, fullText) {
    for (const issue of issues) {
        const fix = issue.autoFix;
        if (typeof fix !== 'string') continue;
        if (!issue.rule || COMMENT_ONLY_RULES.has(issue.rule.id)) continue;
        // Heading fixes are only tracked when the paragraph has a real
        // heading style; heuristic headings stay comments.
        if (issue.applyHeadingStyle) continue;
        if (typeof issue.position !== 'number') continue;

        // The list rules anchor at the line start and put the line text in
        // searchText; every other rule rewrites the matched text itself.
        const target = issue.searchText != null ? issue.searchText : issue.found;
        if (typeof target !== 'string' || target === fix) continue;
        if (target.indexOf('\n') !== -1) continue; // never span paragraphs
        if (fullText.slice(issue.position, issue.position + target.length) !== target) {
            continue; // position drift - leave it as a comment
        }

        // Smallest edit: trim the common prefix and suffix so Word shows
        // only the characters that actually change.
        let p = 0;
        const shared = Math.min(target.length, fix.length);
        while (p < shared && target[p] === fix[p]) p++;
        let s = 0;
        while (s < shared - p &&
               target[target.length - 1 - s] === fix[fix.length - 1 - s]) s++;
        let from = p;
        let to = target.length - s;
        let insertText = fix.slice(p, fix.length - s);

        // A pure insertion has nothing to strike out; widen it to cover one
        // neighbouring character so the revision pairs a w:del with a w:ins.
        if (to === from) {
            if (from > 0) {
                from--;
                insertText = target[from] + insertText;
            } else if (to < target.length) {
                insertText = insertText + target[to];
                to++;
            } else {
                continue;
            }
        }

        issue.trackPlan = {
            start: issue.position + from,
            deleteText: target.slice(from, to),
            insertText: insertText
        };
    }
    return issues;
}
