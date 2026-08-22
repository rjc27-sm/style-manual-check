/**
 * Unit tests for individual rules: trigger and non-trigger cases.
 *
 * Usage:  node tests/rule-cases.mjs
 *
 * Each case: [ruleId, text, shouldFlag, expectedFix?]
 * - shouldFlag true  -> the rule must report at least one issue on the text
 * - shouldFlag false -> the rule must report no issues on the text
 * - expectedFix (optional) -> the first issue's autoFix must equal this
 */
import { RULES, RULE_OPTIONS } from '../src/rules.js';

const CASES = [
    // ---- punct-and-or (PU-01) ----
    ['punct-and-or', 'applicants and/or partners', true],
    ['punct-and-or', 'AND/OR is unclear', true],
    ['punct-and-or', 'apples and oranges or pears', false],

    // ---- punct-ellipsis (PU-03 + PU-04) ----
    ['punct-ellipsis', 'the story continued...', true],
    ['punct-ellipsis', 'wait for it....', true],
    ['punct-ellipsis', 'work…There was more', true],
    ['punct-ellipsis', 'the end … . Next sentence', true],
    ['punct-ellipsis', 'she said … then left', false],
    ['punct-ellipsis', 'Did it work …?', false],
    ['punct-ellipsis', 'It worked …!', false],

    // ---- punct-exclamation-multiple (PU-05) ----
    ['punct-exclamation-multiple', 'Nearly half do!!!', true, '!'],
    ['punct-exclamation-multiple', 'Nearly half do!', false],

    // ---- punct-parentheses-nested (PU-07) ----
    ['punct-parentheses-nested', 'the building (architects MGT (New York)) opened', true],
    ['punct-parentheses-nested', 'the building (architects MGT [New York]) opened', false],
    ['punct-parentheses-nested', 'an unclosed (parenthesis in this line', true],
    ['punct-parentheses-nested', 'a stray closing parenthesis) in this line', true],
    ['punct-parentheses-nested', 'a balanced (pair) of parentheses', false],
    ['punct-parentheses-nested', '1) first item in a list', false],

    // ---- punct-possessive-pronoun (PU-08) ----
    ['punct-possessive-pronoun', "the report is their's", true, 'theirs'],
    ['punct-possessive-pronoun', "is this your's?", true, 'yours'],
    ['punct-possessive-pronoun', "the choice is our's", true, 'ours'],
    ['punct-possessive-pronoun', "the book is her's", true, 'hers'],
    ['punct-possessive-pronoun', "the dog wagged its' tail", true, 'its'],
    ['punct-possessive-pronoun', 'the report is theirs', false],
    ['punct-possessive-pronoun', "it's a good report", false],

    // ---- punct-plural-time-apostrophe (PU-10) ----
    ['punct-plural-time-apostrophe', "in 6 weeks' time", true, '6 weeks'],
    ['punct-plural-time-apostrophe', "owed 3 months' wages", true, '3 months'],
    ['punct-plural-time-apostrophe', "a day's work", false],
    ['punct-plural-time-apostrophe', "the year's cycle", false],
    ['punct-plural-time-apostrophe', 'in 6 weeks time', false],

    // ---- latin-eg / latin-ie (the fix always carries the comma) ----
    ['latin-eg', 'some drugs (e.g., lithium) need monitoring', true, 'for example,'],
    ['latin-eg', 'some drugs (e.g. lithium) need monitoring', true, 'for example,'],
    ['latin-ie', 'the main one (i.e., lithium)', true, 'that is,'],
    ['latin-ie', 'the main one (i.e. lithium)', true, 'that is,'],

    // ---- spelling-ize derived forms (17 Aug 2026) ----
    // A user reported 'organizational' passing the check. The dictionary had
    // 'organize' and 'organization' but nothing built on them, AND the rule's
    // own suffix regex stopped at -ization, so both had to be widened.
    ['spelling-ize', 'we will organize the files', true, 'organise'],
    ['spelling-ize', 'the organization is changing', true, 'organisation'],
    ['spelling-ize', 'our organizational structure is changing', true, 'organisational'],
    ['spelling-ize', 'we work organizationally across teams', true, 'organisationally'],
    ['spelling-ize', 'speak to the event organizer today', true, 'organiser'],
    ['spelling-ize', 'the organizers met on Tuesday', true, 'organisers'],
    ['spelling-ize', 'apply fertilizer to the beds', true, 'fertiliser'],
    ['spelling-ize', 'Organizational change is hard', true, 'Organisational'],
    // already correct Australian spelling - must not fire
    ['spelling-ize', 'our organisational structure is changing', false],
    ['spelling-ize', 'the organiser met the team', false],
    ['spelling-ize', 'we work organisationally across teams', false],
    // legitimate -ize words that are correct in Australian English
    ['spelling-ize', 'she won a prize for the design', false],
    ['spelling-ize', 'the sample size is small', false],
    ['spelling-ize', 'resize the image before upload', false],
    ['spelling-ize', 'the boat could capsize in that swell', false],

    // ---- spelling-yze derived forms ----
    ['spelling-yze', 'we will analyze the data', true, 'analyse'],
    ['spelling-yze', 'connect the analyzer to the port', true, 'analyser'],
    ['spelling-yze', 'the analyzers were calibrated', true, 'analysers'],
    ['spelling-yze', 'we will analyse the data', false],
    ['spelling-yze', 'the analyser was calibrated', false],

    // ---- spelling-other (US words that are correct AU words elsewhere) ----
    ['spelling-other', 'we will draft a message to staff', false],
    ['spelling-other', 'measures to curb spending growth', false],
    ['spelling-other', 'participants tire quickly', false],
    ['spelling-other', 'the gray areas of policy', true, 'grey'],

    // ---- spelling-er (bare meter only in measurement contexts) ----
    ['spelling-er', 'install a smart meter at each site', false],
    ['spelling-er', 'read the water meters quarterly', false],
    ['spelling-er', 'a buffer of 100 meters', true, 'metres'],
    ['spelling-er', 'a 50-meter setback applies', true, 'metre'],
    ['spelling-er', 'floor area in square meters', true, 'metres'],
    ['spelling-er', 'the route is 3 kilometers long', true, 'kilometres'],
    ['spelling-er', 'rainfall in millimeters', true, 'millimetres'],

    // ---- time-ampm-case (sentence stop is not abbreviation punctuation) ----
    ['time-ampm-case', 'the meeting ends at 5.30 pm.', false],
    ['time-ampm-case', 'it ends at 5.30 pm. Then we leave.', false],
    ['time-ampm-case', '(doors close at 5 pm.)', false],
    ['time-ampm-case', 'we meet at 5 pm. tomorrow at the office', true, '5 pm'],
    ['time-ampm-case', 'arrive by 9.15 AM.', true, '9.15 am.'],
    ['time-ampm-case', 'it runs until 3 p.m. daily', true, '3 pm'],

    // ---- punct-ratio-colon-space (PU-14) ----
    ['punct-ratio-colon-space', 'a 50 : 50 split', true, '50:50'],
    ['punct-ratio-colon-space', 'a ratio of 16 :9', true, '16:9'],
    ['punct-ratio-colon-space', 'a 50:50 split', false],
    ['punct-ratio-colon-space', 'the meeting at 10:30 am', false],

    // ---- punct-hyphen-hanging (PU-15) ----
    ['punct-hyphen-hanging', 'full- and part-time positions', true],
    ['punct-hyphen-hanging', 'short- or long-term stays', true],
    ['punct-hyphen-hanging', 'full-time and part-time positions', false],

    // ---- punct-dash-from-between (DS-01) ----
    ['punct-dash-from-between', 'from 2017–2019 rainfall fell', true, 'from 2017 to 2019'],
    ['punct-dash-from-between', 'open between 9 am – 4 pm daily', true, 'between 9 am and 4 pm'],
    ['punct-dash-from-between', 'from 10 - 28 January', true, 'from 10 to 28'],
    ['punct-dash-from-between', 'from 2017 to 2019 rainfall fell', false],
    ['punct-dash-from-between', 'between 2017 and 2019', false],
    ['punct-dash-from-between', 'from 2017–18 to 2018–19 funding rose', false],
    ['punct-dash-from-between', 'rainfall in 2017–2019 was lower', false],

    // ---- time-ampm-space (DT-01) ----
    ['time-ampm-space', 'the meeting is at 3pm', true, '3 pm'],
    ['time-ampm-space', 'starts at 6:30pm sharp', true, '6:30 pm'],
    ['time-ampm-space', 'the meeting is at 3 pm', false],

    // ---- time-ampm-case (DT-02) ----
    ['time-ampm-case', 'arrive by 10 A.M. tomorrow', true],
    ['time-ampm-case', 'arrive by 10 AM tomorrow', true, '10 am'],
    ['time-ampm-case', 'arrive by 10 a.m. tomorrow', true],
    ['time-ampm-case', 'arrive by 10 am tomorrow', false],
    ['time-ampm-case', 'the AM radio band', false],
    ['time-ampm-case', 'the PM said today', false],

    // ---- time-noon-midnight (DT-03) ----
    ['time-noon-midnight', 'lunch at 12 noon', true, 'noon'],
    ['time-noon-midnight', 'closes at 12 midnight', true, 'midnight'],
    ['time-noon-midnight', 'lunch at noon', false],

    // ---- time-24hour-ampm (DT-04) ----
    ['time-24hour-ampm', 'the train leaves at 23:18 pm', true, '23:18'],
    ['time-24hour-ampm', 'briefing at 0930 am', true, '0930'],
    ['time-24hour-ampm', 'the train leaves at 11:18 pm', false],
    ['time-24hour-ampm', 'the train leaves at 23:18', false],

    // ---- numbers-currency-space (NM-01) ----
    ['numbers-currency-space', 'a fee of $ 19.49 applies', true, '$'],
    ['numbers-currency-space', 'a fee of $19.49 applies', false],

    // ---- numbers-percent-noun (NM-03) ----
    ['numbers-percent-noun', 'the per cent of Australians who smoke', true, 'the percentage'],
    ['numbers-percent-noun', 'the percentage of Australians who smoke', false],
    ['numbers-percent-noun', 'about 15 per cent of Australians', false],

    // ---- numbers-comparison-operators (NM-10) ----
    ['numbers-comparison-operators', 'a score >= 90 is required', true],
    ['numbers-comparison-operators', 'a score <= 10 is excluded', true],
    ['numbers-comparison-operators', 'a score ≥ 90 is required', false],

    // ---- numbers-comma-thousands extension (NM-06) ----
    ['numbers-comma-thousands', 'we received 6 500 complaints', true, '6,500'],
    ['numbers-comma-thousands', 'we received 6,500 complaints', false],
    ['numbers-comma-thousands', 'call 0491 570 159 for help', false],
    ['numbers-comma-thousands', 'see Figure 1 500 people attended', false],

    // ---- numbers-comma-thousands: phone numbers and identifiers are not
    // quantities. 'numbers-phone-format' owns the phone shapes (shared
    // detection in phoneSpans); this rule must keep out of them entirely.
    ['numbers-comma-thousands', 'Phone 0262162000 for details.', false],
    ['numbers-comma-thousands', 'Mobile 0491570159 today.', false],
    ['numbers-comma-thousands', 'Phone 6244-1000 during hours.', false],
    ['numbers-comma-thousands', 'Call us on 02 6244 1000 or 1300 975 707.', false],
    ['numbers-comma-thousands', '+61 2 6216 2000 is the number', false],
    ['numbers-comma-thousands', 'ABN 51 824 753 556 applies.', false],
    ['numbers-comma-thousands', 'ISBN 9781760542818 is listed.', false],
    ['numbers-comma-thousands', 'Extension 4321 reaches the desk.', false],
    ['numbers-comma-thousands', 'account 00012345 was closed', false],
    ['numbers-comma-thousands', 'the suburb postcode 2601 applies', false],
    ['numbers-comma-thousands', 'ACT 2601 office', false],
    // An unlabelled four-plus-four pair: a range ascends, so a descending
    // pair is a local phone number
    ['numbers-comma-thousands', 'reception is on 6244-1000', false],
    ['numbers-comma-thousands', 'growth from 2500-4500 cases', true, '2,500'],
    ['numbers-comma-thousands', 'pages 1200-1300 of the report', true, '1,200'],
    // ...but a short word before a real quantity must not suppress the fix
    ['numbers-comma-thousands', 'the total was 4500 people', true, '4,500'],
    ['numbers-comma-thousands', 'of 7500 records', true, '7,500'],
    ['numbers-comma-thousands', 'sales hit 6200 units', true, '6,200'],
    ['numbers-comma-thousands', '26000000 people live here', true, '26,000,000'],

    // ---- readability-double-negative (PL-02) ----
    ['readability-double-negative', 'such delays are not uncommon', true],
    ['readability-double-negative', 'the increase was not insignificant', true],
    ['readability-double-negative', 'such delays are common', false],
    ['readability-double-negative', 'the form is not under review', false],

    // ---- readability-if-unless (PL-03) ----
    ['readability-if-unless', 'If you apply, we can accept it unless you are exempt.', true],
    ['readability-if-unless', 'If you apply, we can accept it. We cannot accept it unless you are exempt.', false],

    // ---- inclusive-atsi (FN-01) ----
    ['inclusive-atsi', 'services for ATSI people', true],
    ['inclusive-atsi', 'services for Aboriginal and Torres Strait Islander people', false],

    // ---- inclusive-aborigines (FN-02) ----
    ['inclusive-aborigines', 'the report described Aborigines in remote areas', true],
    ['inclusive-aborigines', 'programs for Aboriginals were funded', true],
    ['inclusive-aborigines', 'Aboriginal communities were consulted', false],

    // ---- inclusive-indigenous-capital (FN-03) ----
    ['inclusive-indigenous-capital', 'health outcomes for indigenous Australians', true, 'Indigenous'],
    ['inclusive-indigenous-capital', 'support for aboriginal communities', true, 'Aboriginal'],
    ['inclusive-indigenous-capital', 'programs for torres strait islander people', true, 'Torres Strait Islander'],
    ['inclusive-indigenous-capital', 'health outcomes for Indigenous Australians', false],
    ['inclusive-indigenous-capital', 'indigenous species of eucalypt', false],
    ['inclusive-indigenous-capital', 'indigenous plants in the region', false],

    // ---- inclusive-christian-name (CD-01) ----
    ['inclusive-christian-name', 'enter your Christian name on the form', true, 'given name'],
    ['inclusive-christian-name', 'enter your Christian names on the form', true, 'given names'],
    ['inclusive-christian-name', 'enter your given name on the form', false],

    // ---- RF-01: latin-etal citation exemption ----
    ['latin-etal', 'as several studies note (Smith et al. 2008), rates rose', false],
    ['latin-etal', 'Smith et al. (2008) found that rates rose', false],
    ['latin-etal', 'the authors et al. wrote to the department', true],

    // ---- RF-02: numbers-ordinal-words century exception ----
    ['numbers-ordinal-words', 'in the 9th century the region changed', false],
    ['numbers-ordinal-words', 'she came 9th in the race', true],

    // ---- spelling-prefix-hyphen (PU-17) ----
    ['spelling-prefix-hyphen', 'staff must reenter the building', true, 're-enter'],
    ['spelling-prefix-hyphen', 'a preexisting condition', true, 'pre-existing'],
    ['spelling-prefix-hyphen', 'Preeclampsia rates rose', true, 'Pre-eclampsia'],
    ['spelling-prefix-hyphen', 'the team will co-ordinate the response', true, 'coordinate'],
    ['spelling-prefix-hyphen', 'Co-operation with the states', true, 'Cooperation'],
    ['spelling-prefix-hyphen', 'members were co-opted onto the board', true, 'coopted'],
    ['spelling-prefix-hyphen', 'micro-organisms in the water supply', true, 'microorganisms'],
    ['spelling-prefix-hyphen', 'staff must re-enter the building', false],
    ['spelling-prefix-hyphen', 'coordinate the response', false],
    ['spelling-prefix-hyphen', 'the reef and the reel', false],

    // ---- numbers-unit-space (NM-05) ----
    ['numbers-unit-space', 'a 5kg weight', true, '5 kg'],
    ['numbers-unit-space', 'the label says 750mL', true, '750 mL'],
    ['numbers-unit-space', 'a 2GB file', true, '2 GB'],
    ['numbers-unit-space', 'a limit of 50km/h applies', true, '50 km/h'],
    ['numbers-unit-space', 'wait 30min before retesting', true, '30 min'],
    ['numbers-unit-space', 'a 5 kg weight', false],
    ['numbers-unit-space', 'print it on an A4 page', false],
    ['numbers-unit-space', 'the 1990s were different', false],
    ['numbers-unit-space', 'a $5m program', false],
    ['numbers-unit-space', 'the 5G network rollout', false],
    ['numbers-unit-space', 'the COVID-19t strain', false],

    // ---- numbers-phone-format (NM-07) ----
    ['numbers-phone-format', 'call (02) 5550-4321 today', true, '02 5550 4321'],
    ['numbers-phone-format', 'call 0255504321 today', true, '02 5550 4321'],
    ['numbers-phone-format', 'mobile 0491570159', true, '0491 570 159'],
    ['numbers-phone-format', 'phone 1300 975707', true, '1300 975 707'],
    ['numbers-phone-format', 'call 132468 now', true, '13 24 68'],
    ['numbers-phone-format', 'call 02 6244 1000 today', false],
    ['numbers-phone-format', 'mobile 0491 570 159', false],
    ['numbers-phone-format', 'call 13 24 68 now', false],
    ['numbers-phone-format', 'ABN 51 824 753 556', false],
    ['numbers-phone-format', 'the fee was $1300 this year', false],
    // Recognised but not rewritten: no standard chunking to offer
    ['numbers-phone-format', '+61 2 6216 2000 is the number', false],
    ['numbers-phone-format', 'Phone 6244-1000 during hours.', false],
    // Already carrying this engine's own non-breaking spaces. The separators
    // below are real NBSPs, not spaces - check with charCodeAt before editing.
    ['numbers-phone-format', 'call 02 6244 1000 today', false],
    ['numbers-phone-format', 'mobile 0491 570159 here', true,
        '0491 570 159'],

    // ---- readability-passive-voice (PL-01, by-agent only) ----
    ['readability-passive-voice', 'the report was approved by the board', true],
    ['readability-passive-voice', 'staff are employed by RACHs under the measure', true],
    ['readability-passive-voice', 'the framework has been endorsed by ministers', true],
    ['readability-passive-voice', 'the board approved the report', false],
    ['readability-passive-voice', 'data were collected in 2024', false],
    ['readability-passive-voice', 'the venue is located by the river', false],
    ['readability-passive-voice', 'people aged by decade groupings', false],

    // ---- inclusive-gendered-term (advisory: never an autoFix) ----
    ['inclusive-gendered-term', 'The chairman opened the meeting.', true],
    ['inclusive-gendered-term', 'We are manning the front desk.', true],
    ['inclusive-gendered-term', 'Manpower planning starts in July.', true],
    ['inclusive-gendered-term', 'The spokeswoman confirmed the date.', true],
    // Known false positives (brief, section 5.1)
    ['inclusive-gendered-term', 'Peggy Manning chaired the review.', false],
    ['inclusive-gendered-term', 'She met the Chairman of the Board on Tuesday.', false],
    ['inclusive-gendered-term', 'His title was “Chairman” until 2019.', false],
    ['inclusive-gendered-term', 'The panel appointed a chair.', false],

    // ---- inclusive-disability-term ----
    ['inclusive-disability-term', 'He suffers from asthma.', true],
    ['inclusive-disability-term', 'Services for the disabled are funded.', true],
    ['inclusive-disability-term', 'The centre supports hearing impaired students.', true],
    // 'suffers from' outside any disability context
    ['inclusive-disability-term', 'The sector suffers from underfunding.', false],
    ['inclusive-disability-term', 'The system suffers from long delays.', false],
    ['inclusive-disability-term', 'People with disability use the service.', false],

    // ---- inclusive-age-term ----
    ['inclusive-age-term', 'Support for the elderly is increasing.', true],
    ['inclusive-age-term', 'Elderly patients wait longer.', true],
    ['inclusive-age-term', 'Older Australians wait longer.', false],

    // ---- abbrev-first-use-not-expanded (judgement: never an autoFix) ----
    ['abbrev-first-use-not-expanded', 'The AIHW reported a rise.', true],
    ['abbrev-first-use-not-expanded', 'Two NDIS participants joined.', true],
    ['abbrev-first-use-not-expanded', 'The AIHW, ABS and ATO agreed.', true],
    // Expanded before the short form, small words ignored
    ['abbrev-first-use-not-expanded',
        'The Australian Institute of Health and Welfare (AIHW) reported a rise. ' +
        'The AIHW also noted a fall.', false],
    ['abbrev-first-use-not-expanded', 'Return on Investment (ROI) was low.', false],
    // Expanded after the short form - still an expansion
    ['abbrev-first-use-not-expanded',
        'AIHW (Australian Institute of Health and Welfare) reported a rise.', false],
    // Stoplisted: states, universally known short forms, all-caps headings, URLs
    ['abbrev-first-use-not-expanded', 'The report covers NSW and the ACT.', false],
    ['abbrev-first-use-not-expanded', 'Send the PDF before 5 pm.', false],
    ['abbrev-first-use-not-expanded', 'PDFs and URLs are fine.', false],
    ['abbrev-first-use-not-expanded', 'EXECUTIVE SUMMARY OF FINDINGS', false],
    ['abbrev-first-use-not-expanded', 'See https://example.gov.au/ABC/page for detail.', false],

    // ---- abbrev-expanded-after-first-use (autofixable) ----
    ['abbrev-expanded-after-first-use',
        'The Australian Institute of Health and Welfare (AIHW) reported a rise. ' +
        'The Australian Institute of Health and Welfare (AIHW) also noted a fall.',
        true, 'AIHW'],
    ['abbrev-expanded-after-first-use',
        'The Australian Institute of Health and Welfare (AIHW) reported a rise.', false],
    ['abbrev-expanded-after-first-use',
        'A total of 5 mg (MGT) was recorded.', false]
];

// Batch 3 structure rules: [ruleId, text, docCtx, shouldFlag, expectedFix?]
// docCtx mimics the object returned by loadDocx.
const CTX_CASES = [
    // ---- heading-skipped-level (HS-01) ----
    ['heading-skipped-level', 'Report title\nSome body text\nDeep subsection',
        { headingLevels: new Map([[0, 1], [2, 3]]) }, true],
    ['heading-skipped-level', 'Report title\nSome body text\nNext section',
        { headingLevels: new Map([[0, 1], [2, 2]]) }, false],
    ['heading-skipped-level', 'Deep start heading\nSome body text',
        { headingLevels: new Map([[0, 3]]) }, false],
    ['heading-skipped-level', 'Plain text\nwith no headings', null, false],

    // ---- heading-title-case ----
    // Styled headings: a capitalised small word, or one capitalised word in a
    // paragraph we know is a heading, is enough on its own.
    ['heading-title-case', 'Background And Context',
        { headingLines: new Set([0]) }, true, 'Background and context'],
    ['heading-title-case', 'Terms Of Reference',
        { headingLines: new Set([0]) }, true, 'Terms of reference'],
    ['heading-title-case', 'Executive Summary',
        { headingLines: new Set([0]) }, true, 'Executive summary'],
    ['heading-title-case', 'Report On Program Delivery',
        { headingLines: new Set([0]) }, true, 'Report on program delivery'],
    ['heading-title-case', 'Background and context',
        { headingLines: new Set([0]) }, false],
    ['heading-title-case', 'Recommendations.',
        { headingLines: new Set([0]) }, false],
    ['heading-title-case', 'Unicorn crossing modernisation program: interim briefing',
        { headingLines: new Set([0]) }, false],
    ['heading-title-case', 'Data on unicorn movements in Australia',
        { headingLines: new Set([0]) }, false],
    // Bold pseudo-headings keep the stricter two-word test
    ['heading-title-case', 'Key Numbers Summary',
        { boldLines: new Set([0]) }, true, 'Key numbers summary'],
    ['heading-title-case', 'Background And Context',
        { boldLines: new Set([0]) }, true, 'Background and context'],
    ['heading-title-case', 'Report on program delivery',
        { boldLines: new Set([0]) }, false],

    // ---- format-underline-not-link (HS-03) ----
    ['format-underline-not-link', 'This is an important note here',
        { underlines: [{ text: 'important note', position: 11, length: 14, line: 0 }] }, true],
    ['format-underline-not-link', 'This is an important note here',
        { underlines: [] }, false],
    ['format-underline-not-link', 'This is an important note here', null, false],

    // ---- link-generic-text (LK-01) ----
    ['link-generic-text', 'To apply, click here for the form',
        { links: [{ text: 'click here', position: 10, length: 10, target: 'https://example.gov.au', line: 0 }] }, true],
    ['link-generic-text', 'Read more about the changes',
        { links: [{ text: 'Read more', position: 0, length: 9, target: 'https://example.gov.au', line: 0 }] }, true],
    ['link-generic-text', 'See the permit application form online',
        { links: [{ text: 'permit application form', position: 8, length: 23, target: 'https://example.gov.au', line: 0 }] }, false],

    // ---- link-full-stop (LK-02) ----
    ['link-full-stop', 'Complete the application form. Then wait.',
        { links: [{ text: 'application form.', position: 13, length: 17, target: 'https://example.gov.au', line: 0 }] }, true],
    ['link-full-stop', 'Complete the application form. Then wait.',
        { links: [{ text: 'application form', position: 13, length: 16, target: 'https://example.gov.au', line: 0 }] }, false],
    ['link-full-stop', 'Visit www.health.gov.au. for details',
        { links: [{ text: 'www.health.gov.au.', position: 6, length: 18, target: 'https://www.health.gov.au', line: 0 }] }, false],

    // ---- accessibility-nonbreaking-space (DT-06) ----
    ['accessibility-nonbreaking-space', 'the meeting is at 3:30 pm today',
        { paragraphs: [] }, true, '3:30 pm'],
    ['accessibility-nonbreaking-space', 'a dose of 5 mg daily',
        { paragraphs: [] }, true, '5 mg'],
    ['accessibility-nonbreaking-space', 'call 02 6244 1000 for help',
        { paragraphs: [] }, true, '02 6244 1000'],
    ['accessibility-nonbreaking-space', 'the meeting is at 3:30 pm today',
        { paragraphs: [] }, false],
    ['accessibility-nonbreaking-space', 'the meeting is at 3:30 pm today', null, false]
];

const ruleById = new Map(RULES.map(r => [r.id, r]));
let pass = 0;
let fail = 0;

for (const [ruleId, text, shouldFlag, expectedFix] of CASES) {
    const rule = ruleById.get(ruleId);
    if (!rule) {
        console.log('FAIL - unknown rule id: ' + ruleId);
        fail++;
        continue;
    }
    let issues;
    try {
        issues = rule.check(text);
    } catch (err) {
        console.log('FAIL - ' + ruleId + ' threw on ' + JSON.stringify(text) + ' :: ' + err.message);
        fail++;
        continue;
    }
    const flagged = issues.length > 0;
    let ok = flagged === shouldFlag;
    let detail = '';
    if (ok && shouldFlag && expectedFix !== undefined) {
        const fix = issues[0].autoFix !== undefined ? issues[0].autoFix : issues[0].suggestion;
        if (fix !== expectedFix) {
            ok = false;
            detail = ' :: expected fix ' + JSON.stringify(expectedFix) + ', got ' + JSON.stringify(fix);
        }
    }
    if (!ok && detail === '') {
        detail = ' :: expected ' + (shouldFlag ? 'flag' : 'no flag') + ', got ' +
            issues.length + ' issue(s)' +
            (issues.length ? ' [' + issues.map(i => JSON.stringify(i.found)).join(', ') + ']' : '');
    }
    console.log((ok ? 'PASS' : 'FAIL') + ' - ' + ruleId + ' :: ' + JSON.stringify(text) + detail);
    ok ? pass++ : fail++;
}

// Structure rules (Batch 3): run with a synthetic docCtx
const NONE = undefined;
for (const [ruleId, text, docCtx, shouldFlag, expectedFix] of CTX_CASES) {
    const rule = ruleById.get(ruleId);
    if (!rule) {
        console.log('FAIL - unknown rule id: ' + ruleId);
        fail++;
        continue;
    }
    let issues;
    try {
        // Heading rules read headingLines/boldLines positionally, so pass them
        // through when the case supplies them (loadDocx returns them too).
        issues = rule.check(text,
            (docCtx && docCtx.headingLines) || NONE, NONE,
            (docCtx && docCtx.boldLines) || NONE, NONE, NONE, docCtx);
    } catch (err) {
        console.log('FAIL - ' + ruleId + ' threw :: ' + err.message);
        fail++;
        continue;
    }
    const flagged = issues.length > 0;
    let ok = flagged === shouldFlag;
    let detail = '';
    if (ok && shouldFlag && expectedFix !== undefined) {
        const fix = issues[0].autoFix !== undefined ? issues[0].autoFix : issues[0].suggestion;
        if (fix !== expectedFix) {
            ok = false;
            detail = ' :: expected fix ' + JSON.stringify(expectedFix) + ', got ' + JSON.stringify(fix);
        }
    }
    if (ok && flagged) {
        // Position integrity for structure rules too
        for (const issue of issues) {
            if (text.substr(issue.position, issue.found.length) !== issue.found) {
                ok = false;
                detail = ' :: position mismatch for ' + JSON.stringify(issue.found);
            }
        }
    }
    if (!ok && detail === '') {
        detail = ' :: expected ' + (shouldFlag ? 'flag' : 'no flag') + ', got ' + issues.length + ' issue(s)';
    }
    console.log((ok ? 'PASS' : 'FAIL') + ' - ' + ruleId + ' (ctx) :: ' + JSON.stringify(text.slice(0, 40)) + detail);
    ok ? pass++ : fail++;
}

// Issue-count cases: [ruleId, text, expectedCount, options?]
// Some behaviour is only visible in the count - overlapping term-list entries
// must produce one issue, not two, and the advisory switch must produce none.
const COUNT_CASES = [
    // 'the elderly' and 'elderly' are both AGE_TERMS entries; longest wins.
    ['inclusive-age-term', 'Support for the elderly is increasing.', 1],
    // 'wheelchair-bound' must not also match as a bare 'wheelchair bound'.
    ['inclusive-disability-term', 'A wheelchair-bound resident applied.', 1],
    // The switch turns all three advisory rules off, and nothing else.
    ['inclusive-age-term', 'Support for the elderly is increasing.', 0,
        { inclusiveTerms: false }],
    ['inclusive-gendered-term', 'The chairman opened the meeting.', 0,
        { inclusiveTerms: false }],
    ['inclusive-disability-term', 'He suffers from asthma.', 0,
        { inclusiveTerms: false }],
    ['inclusive-atsi', 'The ATSI population grew.', 1, { inclusiveTerms: false }],
    // Only the FIRST use of a short form is flagged.
    ['abbrev-first-use-not-expanded', 'The NDIS funds it. The NDIS also reports on it.', 1]
];

for (const [ruleId, text, expected, options] of COUNT_CASES) {
    const rule = ruleById.get(ruleId);
    if (!rule) {
        console.log('FAIL - unknown rule id: ' + ruleId);
        fail++;
        continue;
    }
    const saved = RULE_OPTIONS.inclusiveTerms;
    if (options) Object.assign(RULE_OPTIONS, options);
    let issues = [];
    let threw = null;
    try { issues = rule.check(text); } catch (err) { threw = err; }
    RULE_OPTIONS.inclusiveTerms = saved;
    if (threw) {
        console.log('FAIL - ' + ruleId + ' threw :: ' + threw.message);
        fail++;
        continue;
    }
    const ok = issues.length === expected;
    console.log((ok ? 'PASS' : 'FAIL') + ' - ' + ruleId + ' (count) :: ' +
        JSON.stringify(text) +
        (ok ? '' : ' :: expected ' + expected + ', got ' + issues.length));
    ok ? pass++ : fail++;
}

// Position integrity: every reported position must match the found text
let posErrors = 0;
for (const [ruleId, text] of CASES) {
    const rule = ruleById.get(ruleId);
    if (!rule) continue;
    let issues = [];
    try { issues = rule.check(text); } catch { continue; }
    for (const issue of issues) {
        if (text.substr(issue.position, issue.found.length) !== issue.found) {
            console.log('FAIL - ' + ruleId + ' position mismatch: found ' +
                JSON.stringify(issue.found) + ' not at position ' + issue.position +
                ' in ' + JSON.stringify(text));
            posErrors++;
        }
    }
}
if (posErrors === 0) console.log('PASS - all issue positions match their found text');

console.log('\n' + pass + ' passed, ' + (fail + posErrors) + ' failed, ' + (CASES.length + CTX_CASES.length + COUNT_CASES.length) + ' cases');
process.exit(fail + posErrors ? 1 : 0);
