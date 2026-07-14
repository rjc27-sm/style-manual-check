/**
 * Proof Positive (IM2026) – deterministic verification of AI output.
 * This is the point of the whole tool: generative AI drafts, the rule
 * engine marks its homework before anything is shown as 'clean'.
 */

import { RULES } from '../../src/rules.js';
import { LIST_RULES } from '../../src/list-analysis.js';

export const RULE_COUNT = RULES.length + LIST_RULES.length;

/**
 * Run every rule over a piece of AI-generated text.
 * Structure sets are empty: AI rewrites are plain prose passages, so
 * heading/list/bold-specific rules simply pass.
 * Returns { clean: boolean, issues: [...], ruleCount: number }
 */
export function verifyText(text) {
    const empty = new Set();
    const issues = [];
    for (const rule of RULES.concat(LIST_RULES)) {
        try {
            issues.push(...rule.check(text, empty, empty, empty, empty, empty, null));
        } catch (err) {
            // A rule failure must never hide the text - log and continue.
            console.error('Verification rule failed: ' + rule.id, err);
        }
    }
    issues.sort((a, b) => a.position - b.position);
    return { clean: issues.length === 0, issues, ruleCount: RULE_COUNT };
}

/** Short human summary of a verification result. */
export function verifySummary(result) {
    if (result.clean) {
        return 'Checked against ' + result.ruleCount + ' Style Manual rules. No issues found.';
    }
    const n = result.issues.length;
    return 'The rule engine flagged ' + n + (n === 1 ? ' issue' : ' issues') +
        ' in this AI suggestion, shown below.';
}

/**
 * Mask spans the rule engine must not touch: markdown syntax (link targets,
 * heading markers), URLs (addresses, not prose) and quoted examples. Quoted
 * examples are mentions of style, not uses of it - the Manual's exceptions
 * live inside them, so 'correcting' them is wrong. Masking preserves length,
 * so issue positions still line up with the text.
 * (Link text inside '[...]' stays visible and is still checked.)
 */
export function maskProtected(s) {
    const x = m => 'x'.repeat(m.length);
    return s
        .replace(/\]\([^)\n]{1,400}\)/g, x)
        .replace(/^#{1,4}[ \t]/gm, x)
        .replace(/https:\/\/[^\s]+/g, x)
        .replace(/“[^”\n]{1,160}”/g, x)
        .replace(/"[^"\n]{1,160}"/g, x)
        .replace(/‘(?:[^‘’\n]|’(?=[a-z])){1,160}’(?=[\s.,;:!?)\]]|$)/g, x)
        .replace(/(^|[\s(])'(?:[^'\n]|'(?=[a-z])){1,160}'(?=[\s.,;:!?)\]]|$)/gm,
            (m, p) => p + x(m.slice(p.length)));
}

/**
 * The homework-marking step: run the deterministic rule engine over an AI
 * answer, apply its mechanical fixes automatically, and report what happened.
 * Detection runs on the masked copy; each fix is translated back onto the
 * real text and skipped if it would touch a protected quote or URL.
 * Returns { text, fixes, remaining } - remaining is the array of issues
 * still flagged after the fixes.
 */
export function autoCorrect(text) {
    let fixes = 0;
    for (let pass = 0; pass < 3; pass++) {
        const masked = maskProtected(text);
        const { issues } = verifyText(masked);
        const fixable = issues.filter(i => i.autoFix && i.autoFix !== i.found);
        if (fixable.length === 0) break;
        fixable.sort((a, b) => b.position - a.position);
        let changed = false;
        for (const i of fixable) {
            const pos = i.position, found = i.found, fix = i.autoFix;
            const end = pos + found.length;
            // Detection ran on the MASKED copy, so `found`/`fix` may contain mask
            // characters where they overlap a quote or URL. Confirm the position
            // still lines up in the masked domain first.
            if (masked.slice(pos, end) !== found) continue;
            // Translate the edit onto the real text: the common prefix/suffix are
            // unchanged, only the middle differs. Comparing against `found` (not
            // `fix`) keeps the mask characters aligned by length.
            let p = 0;
            while (p < found.length && p < fix.length && found[p] === fix[p]) p++;
            let s = 0;
            while (s < found.length - p && s < fix.length - p &&
                   found[found.length - 1 - s] === fix[fix.length - 1 - s]) s++;
            // The part being replaced must fall OUTSIDE any masked span - i.e. the
            // masked and real characters there must be identical. If they differ,
            // the fix would touch a protected quote/URL, so skip it (never rewrite
            // example content or link addresses).
            if (found.slice(p, found.length - s) !== text.slice(pos + p, end - s)) continue;
            text = text.slice(0, pos + p) + fix.slice(p, fix.length - s) +
                text.slice(end - s);
            fixes++;
            changed = true;
        }
        if (!changed) break;
    }
    const remaining = verifyText(maskProtected(text)).issues;
    return { text, fixes, remaining };
}
