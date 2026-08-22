/**
 * Format a list - client-side tests.
 *
 * lists.html is a page, not a module, so nothing covered it until now. The
 * deterministic engine lives in the page's first classic <script> block; this
 * harness lifts that block out and imports it as a module, the same technique
 * tests/retrieval.mjs uses on worker.js.
 *
 * The cases come from the 50-list test set Jen ran on 21 August 2026
 * (List formatting test set_Results.docx), where 16 of 48 scored outputs were
 * wrong. They pin the three faults fixed on 22 August:
 *   - a lead-in list formatted as a stand-alone list (7 of the 16)
 *   - marker and numbering faults reported as 'correctly formatted' (3)
 *   - a flat list of mixed markers read as a 2-level hierarchy (part of those 3)
 *
 * Run: node tests/list-format-client.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..');

const html = readFileSync(join(repo, 'im2026/lists.html'), 'utf8');
const block = html.match(/<script(?![^>]*type=)[^>]*>([\s\S]*?)<\/script>/);
if (!block) {
    console.error('Could not find the classic <script> block in im2026/lists.html.');
    console.error('The extraction pattern has stopped matching - fix the pattern, not the engine.');
    process.exit(1);
}
const EXPORTS = ['looksLikeHeading', 'markerFaults', 'markerFaultNote', 'parseHierarchy',
    'restoreTruncatedLeadIn', 'resolveAiListType', 'classifyLeadIn', 'lowerFirstUnlessProper'];
for (const name of EXPORTS) {
    if (!block[1].includes('function ' + name)) {
        console.error('lists.html no longer defines ' + name + ' at the top level of its script block.');
        process.exit(1);
    }
}

// The block ends with DOM wiring (paste handlers, button listeners) that runs
// on load. Node has no DOM, so a permissive no-op proxy stands in for it: every
// property lookup and every call returns the proxy itself, which is enough for
// addEventListener registration. Nothing under test touches it.
const STUB = 'const __dom = new Proxy(function () {}, ' +
    '{ get: () => __dom, apply: () => __dom, set: () => true });\n' +
    'var document = __dom, window = __dom, navigator = __dom;\n';

const lists = await import('data:text/javascript;base64,' + Buffer.from(
    STUB + block[1] + '\nexport { ' + EXPORTS.join(', ') + ' };', 'utf8').toString('base64'));

let pass = 0;
const failures = [];
function check(label, actual, expected) {
    const a = JSON.stringify(actual), e = JSON.stringify(expected);
    if (a === e) pass += 1;
    else failures.push(label + '\n    expected ' + e + '\n    got      ' + a);
}

// ---- looksLikeHeading ----
// A stand-alone list needs a HEADING. These seven first lines are lead-ins the
// items complete, and every one of them came back as a stand-alone list: the
// colon stripped, every item capitalised, the closing full stop gone.
const LEAD_INS = [
    'The dataset includes:',                                    // fragment list 3
    'The team completed the annual review.',                    // fragment list 6
    'The checklist below covers the following items.',          // fragment list 7
    'The kit includes:',                                        // fragment list 8
    'The rollout will involve:',                                // fragment list 10
    'The following business units contributed to this report:', // numbered list 1
    'The induction pack contains:',                             // numbered list 5
];
// The ten first lines the tool got right. 'Document status:' is the trap:
// classifyLeadIn calls it a phrase, and it IS a heading over a stand-alone list.
const HEADINGS = [
    'Report sections', 'Meeting attendees', 'Key contacts', 'Document status:',
    'Available templates', 'Related publications', 'Site locations',
    'Project risks', 'Standard equipment', 'Approval stages',
    // Controls: a short determiner-led heading, and longer verbless ones.
    'The Style Manual', 'Related publications from 2024',
    'Key findings from the 2025 survey',
];
for (const line of LEAD_INS) {
    check('looksLikeHeading(' + line + ') is a lead-in', lists.looksLikeHeading(line), false);
}
for (const line of HEADINGS) {
    check('looksLikeHeading(' + line + ') is a heading', lists.looksLikeHeading(line), true);
}

// ---- resolveAiListType ----
// The model's answers for the seven failures, as returned on 21 August: type
// standAlone with the items already capitalised.
const asStandAlone = (items, leadIn) => lists.resolveAiListType('standAlone', items, leadIn);
check('a noun-phrase list under a lead-in becomes a fragment list',
    asStandAlone(['A laptop', 'A headset', 'A security token', 'A lanyard'], 'The kit includes:'),
    { type: 'fragment', downgraded: true });
check('a lead-in ending in a full stop still downgrades',
    asStandAlone(['Data linkage approvals', 'Ethics clearance'],
        'The checklist below covers the following items.'),
    { type: 'fragment', downgraded: true });
check('clause items under a lead-in become a sentence list',
    asStandAlone(['The vendor may withdraw', 'Data migration could be delayed'],
        'The review found the following:'),
    { type: 'sentence', downgraded: true });
check('a genuine stand-alone list is left alone',
    asStandAlone(['Executive summary', 'Background', 'Methodology'], 'Report sections'),
    { type: 'standAlone', downgraded: false });
check('a stand-alone list under a colon-ended heading is left alone',
    asStandAlone(['Draft', 'Under review', 'Approved'], 'Document status:'),
    { type: 'standAlone', downgraded: false });
check('a fragment answer is never second-guessed',
    lists.resolveAiListType('fragment', ['a laptop'], 'Report sections'),
    { type: 'fragment', downgraded: false });
check('a sentence answer is never second-guessed',
    lists.resolveAiListType('sentence', ['The kit is issued on day one'], 'Report sections'),
    { type: 'sentence', downgraded: false });

// ---- restoreTruncatedLeadIn ----
check('a truncated lead-in is restored from the writer line',
    lists.restoreTruncatedLeadIn('The checklist below covers the following',
        'The checklist below covers the following items.'),
    'The checklist below covers the following items.');
check('a lead-in the model only repunctuated is left alone',
    lists.restoreTruncatedLeadIn('The kit includes', 'The kit includes:'),
    'The kit includes');
check('a genuine rewrite is left alone',
    lists.restoreTruncatedLeadIn('The training covers:', 'The training will cover the following:'),
    'The training covers:');

// ---- markerFaults ----
const faults = lines => lists.markerFaults(lines);
check('mixed bullet characters are a fault',                       // stand-alone list 10
    faults(['* Team leader sign-off', '- Branch head approval',
        '• Final executive clearance', '- Publication']).mixedMarkers, true);
check('numbering that restarts is a fault',                        // numbered list 3
    faults(['1. Go to the login page.', '2. Select ‘Forgot password’.',
        '1. Enter your work email.', '2. Check your inbox for a reset link.']).badSequence, true);
check('a duplicated number is a fault',                            // numbered list 8
    faults(['1. Send the welcome email.', '1. Set up system access.',
        '2. Schedule the induction session.', '3. Assign a buddy.']).badSequence, true);
check('consistent bullets are not a fault',
    faults(['• age at diagnosis', '• postcode of usual residence']),
    { mixedMarkers: false, badSequence: false });
check('numbering that runs 1 to 4 is not a fault',
    faults(['1. Finalise the content.', '2. Send for editorial sign-off.',
        '3. Upload to the CMS.', '4. Notify stakeholders.']),
    { mixedMarkers: false, badSequence: false });
check('unmarked lines are not a fault',
    faults(['age at diagnosis', 'postcode of usual residence']),
    { mixedMarkers: false, badSequence: false });
check('a marker fault produces a note',
    lists.markerFaultNote({ mixedMarkers: true, badSequence: false }).length > 0, true);
check('a clean list produces no note',
    lists.markerFaultNote({ mixedMarkers: false, badSequence: false }), '');

// ---- parseHierarchy ----
// A flat list bulleted with a mix of '*', '-' and a bullet is FLAT. Reading the
// dashes as a child level sent it down the multilevel path, where it
// round-tripped unchanged and was reported as already correctly formatted.
check('mixed flat markers stay flat',
    lists.parseHierarchy(['* Team leader sign-off', '- Branch head approval',
        '• Final executive clearance', '- Publication']).multilevel, false);
check('an indented dash still nests',
    lists.parseHierarchy(['• Content review', '    - Fact-check',
        '• Accessibility check']).rows.map(r => r.level), [0, 1, 0]);
// Word pastes give 'o' sub-items the same indent as their bullet parents, so a
// hollow bullet must keep nesting with no indent to go on.
check('an unindented hollow bullet still nests (Word paste)',
    lists.parseHierarchy(['• tree nuts:', 'o\talmonds', 'o\tcashews',
        '• dairy products:', 'o\tcow’s milk']).rows.map(r => r.level),
    [0, 1, 1, 0, 1]);
check('an indented lettered marker still nests',
    lists.parseHierarchy(['1. Notify team leader', '   a. advise within 1 hour',
        '2. Notify branch head']).rows.map(r => r.level), [0, 1, 0]);

if (failures.length) {
    console.error('\nFormat a list client tests: ' + pass + ' passed, ' + failures.length + ' FAILED\n');
    failures.forEach(f => console.error('  ✗ ' + f));
    process.exit(1);
}
console.log('Format a list client tests: ' + pass + ' cases passed.');
