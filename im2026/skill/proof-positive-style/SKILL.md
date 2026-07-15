---
name: proof-positive-style
description: Apply the Proof Positive rule engine's 106 codified Australian Government Style Manual rules when writing, editing or reviewing text. Use whenever drafting Australian Government or AIHW content, when the user asks for Style Manual compliance, plain English rewrites, or a style check, or when producing any user-facing text for the Proof Positive / Style Manual Check projects.
---

# Proof Positive style rules

This skill mirrors the deterministic rule engine of Proof Positive (IM2026),
the Style Manual checking tool. The engine is the source of truth: these
rules were generated from `src/rules.js` and `src/list-analysis.js` in the
style-manual-check repository. If the engine and this skill disagree, the
engine wins - regenerate this skill from the code.

## When to apply

Apply these rules to ALL user-facing text you write for Australian
Government contexts: documents, web content, emails, UI copy, examples.
Also use them as a checklist when reviewing or rewriting someone else's text.

## Core workflow

1. Draft (or read) the text.
2. Check it against every category in `references/rules.md`.
3. For spelling, check US forms against `references/spellings.md`.
4. Fix mechanical breaches directly. For judgement calls (passive voice,
   noun strings, long sentences), rewrite with minimal change to meaning.
5. When flagging an issue for a user rather than fixing it, cite the
   Style Manual link given for that rule.

## The rules that matter most (quick digest)

- Australian spelling: -ise, -yse, -our, -re; program not programme.
- Numbers: words for zero and one; numerals for 2 and above; comma
  separators over 1,000; numerals for all ages, measurements, percentages.
- Dates and time: 15 October 2023; 3:30 pm (colon, non-breaking space
  before am/pm); spans with an unspaced en dash (2021-22).
- Punctuation: single quotes; spaced en dashes for asides - like this - and
  never unspaced em dashes; unspaced en dashes join equal words (author–date,
  cost–benefit) and spans (2021–22); no serial comma unless needed; one space
  after a full stop; % closed up (15%).
- Latin forms: never e.g., i.e., etc. in body text - write 'for example',
  'that is', 'and so on'.
- Capitals: minimal; proper nouns only; sentence case headings; 'Australian
  Government' capped, generic 'the government' lower case.
- Lists: 3 types. Sentence lists (capital + full stop each item); fragment
  lists (lower case, full stop only on the last); stand-alone lists
  (capital, no punctuation). No 'and', 'or', semicolons or trailing commas
  at item ends. Items must be grammatically parallel.
- Links: descriptive link text, never 'click here' or a raw URL. Style
  Manual pages cite as 'Page title | Style Manual'.
- Inclusive language: person-first for disability; 'First Nations people'
  (never 'ATSI', 'Aborigines' or lower-case 'indigenous' for peoples);
  'older people', never 'elderly'.
- Readability: sentences of 25 words or fewer where possible; active
  voice; everyday words; front-load key information.

The full rule set, with every check and its Style Manual source link, is in
`references/rules.md`. Consult it when reviewing text or when unsure.

## Output conventions

- When rewriting, change as little as possible and never alter meaning.
- When reviewing, report issues grouped by category, quoting the exact text
  found, the suggested fix, and the Style Manual link.
- Never invent a Style Manual rule or URL. Only cite links that appear in
  `references/rules.md`.
