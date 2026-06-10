/**
 * AIHW rule pack - Australian Institute of Health and Welfare house style
 *
 * This is a scaffold. Rules added here are run IN ADDITION to the core
 * Style Manual rules when the user turns on the AIHW pack in the UI.
 *
 * Each rule uses exactly the same shape as the core rules in ../rules.js:
 *
 * {
 *     id: 'aihw-example',
 *     name: 'Short rule name',
 *     category: 'aihw',          // keep 'aihw' so the UI can badge them
 *     description: 'What the rule checks and why.',
 *     link: 'https://...',       // link to the AIHW writing guidance
 *     check: function(text, headingLines, listLines, boldLines, italicLines, tableLines) {
 *         const issues = [];
 *         // push { found, suggestion, autoFix, position, rule: this }
 *         return issues;
 *     }
 * }
 *
 * Candidate rules to add (from 'Writing for the AIHW'):
 * - 'data are' not 'data is' (data is plural)
 * - 'data set' (two words), 'database' (one word)
 * - geographic remoteness categories in italics (Major cities, Remote, ...)
 * - 'First Nations people' terminology; never 'elderly'
 * - 'X times as high as', not 'X times higher than'
 * - percentage change vs percentage point change
 * - no 'e.g.'/'i.e.'/'etc.' in body text (already core, but AIHW allows in tables)
 * - rounding conventions for large numbers
 */

const AIHW_RULES = [
    // No rules yet - this pack is a scaffold for the AIHW-specific module.
];

export { AIHW_RULES };
