/**
 * Tests for im2026/src/list-convention.js - the deterministic pass that
 * imposes a model-declared list type on Ask / Make-it-plain output.
 *
 * Run: node tests/list-convention.mjs
 */
import { applyListConventions } from '../im2026/src/list-convention.js';

let failures = 0;
const fail = msg => { console.log('  FAIL ' + msg); failures++; };
const pass = msg => console.log('  ok   ' + msg);

function check(name, input, expected) {
    const got = applyListConventions(input);
    if (got === expected) pass(name);
    else fail(name + '\n    expected: ' + JSON.stringify(expected) +
        '\n    got:      ' + JSON.stringify(got));
}

console.log('list-convention.mjs');

// --- sentence lists ---

check('sentence: capitals and stops imposed on every item',
    'Do this:\n[[list:sentence]]\n- start each item with a capital letter\n- end every item with a full stop',
    'Do this:\n- Start each item with a capital letter.\n- End every item with a full stop.');

check('sentence: bolded first word still gets its capital',
    '[[list:sentence]]\n- **essential** information identifies the noun\n- **non-essential** information adds detail',
    '- **Essential** information identifies the noun.\n- **Non-essential** information adds detail.');

check('sentence: trailing semicolon and colon become full stops',
    '[[list:sentence]]\n- Check the spelling;\n- Check the punctuation:',
    '- Check the spelling.\n- Check the punctuation.');

check('sentence: stop lands after a closing quote',
    "[[list:sentence]]\n- The note should say 'follow up in two weeks'\n- Keep it short",
    "- The note should say 'follow up in two weeks'.\n- Keep it short.");

check('sentence: an item already stopped inside its quote is untouched',
    "[[list:sentence]]\n- The note should say 'Follow up.'\n- Keep it short.",
    "- The note should say 'Follow up.'\n- Keep it short.");

// --- fragment lists ---

check('fragment: stop stripped from every item but the last, case untouched',
    'It covers:\n[[list:fragment]]\n- state and territory governments.\n- local councils.\n- non-government organisations.',
    'It covers:\n- state and territory governments\n- local councils\n- non-government organisations.');

check('fragment: closing stop added when missing',
    '[[list:fragment]]\n- state and territory governments\n- local councils',
    '- state and territory governments\n- local councils.');

check('fragment: proper-noun items keep their capitals (never lower-cased)',
    "[[list:fragment]]\n- 'Big Australia' (a population policy).\n- 'the Lucky Country' (a book by Donald Horne).",
    "- 'Big Australia' (a population policy)\n- 'the Lucky Country' (a book by Donald Horne).");

check('fragment: mid-item stop inside a quote survives, trailing stop after it goes',
    "[[list:fragment]]\n- notes like 'Do this.' in running text.\n- a second item.",
    "- notes like 'Do this.' in running text\n- a second item.");

// --- stand-alone lists ---

check('standalone: capitals imposed, no stops anywhere',
    'Examples:\n[[list:standalone]]\n- canberra.\n- melbourne.\n- perth.',
    'Examples:\n- Canberra\n- Melbourne\n- Perth');

check('standalone: the hyphenated spelling of the marker works',
    '[[list:stand-alone]]\n- canberra\n- melbourne',
    '- Canberra\n- Melbourne');

// --- leaving things alone ---

check('no marker anywhere: input returned byte-identical',
    'Lead-in:\n- item one.\n- item two\n\nA paragraph.',
    'Lead-in:\n- item one.\n- item two\n\nA paragraph.');

check('an unmarked list next to a marked one stays untouched',
    '[[list:sentence]]\n- fix this item\n\nBut not:\n- this one.\n- or this one',
    '- Fix this item.\n\nBut not:\n- this one.\n- or this one');

check('multilevel list: marker stripped, list left alone',
    '[[list:sentence]]\n- parent item\n  - child item\n- another parent',
    '- parent item\n  - child item\n- another parent');

check('orphan marker with no list following is stripped safely',
    'Some prose.\n[[list:fragment]]\nMore prose.\nEven more prose.\nStill more.\n- a much later list.\n- second item.',
    'Some prose.\nMore prose.\nEven more prose.\nStill more.\n- a much later list.\n- second item.');

check('a lead-in line between marker and list still associates',
    '[[list:fragment]]\nThe review covers:\n- staffing levels.\n- funding.',
    'The review covers:\n- staffing levels\n- funding.');

check('blank line between marker and list still associates',
    '[[list:standalone]]\n\n- canberra\n- melbourne',
    '\n- Canberra\n- Melbourne');

// --- marker hygiene ---

check('marker leaked mid-line is removed without imposing',
    'The list below: [[list:sentence]]\n- item one\n- item two',
    'The list below:\n- item one\n- item two');

check('two markers in a row: the first is dropped, the second wins',
    '[[list:sentence]]\n[[list:fragment]]\n- first thing.\n- second thing.',
    '- first thing\n- second thing.');

check('empty item text is left alone',
    '[[list:sentence]]\n- \n- real item',
    '- \n- Real item.');

check('non-string input is returned as-is',
    null, null);

console.log(failures ? failures + ' failure(s)' : 'all list-convention tests passed');
process.exit(failures ? 1 : 0);
