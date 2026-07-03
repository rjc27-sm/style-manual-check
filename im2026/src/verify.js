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
        return 'Verified - 0 issues across ' + result.ruleCount + ' Style Manual rules.';
    }
    const n = result.issues.length;
    return 'The rule engine flagged ' + n + (n === 1 ? ' issue' : ' issues') +
        ' in this AI suggestion - shown below.';
}
