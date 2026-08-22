# Proof Positive (IM2026) / Style Manual Check

Tools that check writing against the
[Australian Government Style Manual](https://www.stylemanual.gov.au) using a
deterministic rule engine – the same check gives the same answer every time.
Where fixing an issue takes judgement, generative AI drafts a suggestion and
the rule engine checks the output before anyone sees it: **AI drafts,
deterministic rules verify.**

**Live site:** https://rjc27-sm.github.io/style-manual-check/im2026/

Proof Positive was entered in the APS Innovation Month 2026 'Build a
Bureaucrat Bot' challenge (IM2026) and is now in wider APS testing. It is a
personal project by Jen Robertson, not an official government service.

## The five tools

| Tool | What it does | AI |
|---|---|---|
| Check a document | Upload a .docx, get it back with mechanical fixes as tracked changes and a comment on every other style issue. Runs entirely in the browser – nothing is uploaded. | Optional ✦ rewrites |
| Ask the Style Manual | Ask a style question; the answer is grounded in retrieved extracts of the actual Style Manual pages and links only to pages it read. | ✦ |
| Make it plain | Plain English rewrite of a dense passage, auto-corrected by the rule engine. | ✦ |
| Format a list | Rewrites rough bullets into a parallel, correctly punctuated Style Manual list. | ✦ |
| Create a citation | Author–date citations from a DOI, a manual form or an AI-parsed messy reference. The deterministic formatter builds every citation. | Optional ✦ parsing |

Every AI output is re-checked by the rule engine before display: mechanical
breaches are corrected automatically and anything left is flagged, never
hidden. See the [About page](https://rjc27-sm.github.io/style-manual-check/im2026/about.html)
for the full bot card, limitations and accessibility statement.

## Architecture

- **Static site** (`im2026/`): plain HTML + vanilla JavaScript ES modules,
  no framework, no build step. Published by GitHub Pages from the repo root.
- **Rule engine** (`src/rules.js`, `src/list-analysis.js`,
  `src/spellings.js`): 107 rules across 12 categories, 1,829 US→AU spelling
  mappings. Runs in the browser; documents never leave the user's device.
- **Cloudflare Worker** (`im2026/worker/`): the only server component. Holds
  the Claude API key, enforces per-IP and global daily limits, and answers Ask
  from a section-level retrieval index over 171 Style Manual pages. The page
  text and index are bundled into the Worker and deployed straight to
  Cloudflare – they are deliberately not in this repository. See
  [im2026/DEPLOY.md](im2026/DEPLOY.md).
- **Word add-in** (`StyleManualCheck/`, Office.js): the original Style
  Manual Check tool the rule engine grew from; shares the same rules.

The shared rule files are used by four tools (Word add-in, browser checker,
Format-a-list, and AI-output verification) – changes to them need regression
testing across all four.

## Repository layout

```
im2026/                 Proof Positive – the current tool (published site)
  index.html            Check a document
  ask.html              Ask the Style Manual (retrieval-grounded chat)
  plain.html            Make it plain
  lists.html            Format a list
  citations.html        Create a citation
  about.html            How it works, bot card, accessibility statement
  src/                  Page logic + AI client + verification (autoCorrect)
  worker/               Cloudflare Worker proxy + bundled Ask corpus and index
src/                    Canonical shared rule engine
  rules.js              The rules (id, name, category, description, link, check)
  list-analysis.js      List-type detection and list rules
  spellings.js          US→AU spellings, watch words, wordy phrases
  docx-annotate.js      .docx reading, Word comments and tracked changes
StyleManualCheck/       Word add-in (Office.js)
style-manual-check/     Pre-2026 browser checker (superseded)
tests/                  Annotator, tracked changes and retrieval (npm test),
                        plus rule-cases.mjs (run separately)
```

## Running locally

ES modules will not load from `file://`. Serve the repo root:

```
python -m http.server 8000
```

then open http://localhost:8000/im2026/. AI features refuse non-allowed
origins, so locally the rule-based features work and AI calls fail politely.

## Testing

```
npm install
npm test
```

The first test loads a sample document, runs all rules, writes an annotated
copy and verifies: body text unchanged, comment markers balanced, comment ids
unique, comments part well formed, content type and relationship registered.
The second (`tests/tracked-changes.mjs`) runs the tracked-changes path on the
Proof Positive sample briefing and verifies the revision XML: rejecting every
change reconstructs the original text exactly, accepting them applies every
fix, and documents that already contain revisions fall back to comments.
The third (`tests/retrieval.mjs`) checks that the Ask index and the bundled
page text agree on every section boundary, and that known questions retrieve
the section that answers them; it skips rather than fails when the bundled
corpus is absent, since that file is not in the repository.
Always open annotated output in Word as a final check.

Per-rule trigger and non-trigger cases live in `tests/rule-cases.mjs` and are
**not** part of `npm test`:

```
node tests/rule-cases.mjs
```

Note that `npm test` rewrites `tests/sample - annotated.docx`, which is
tracked – commit it after a test run to keep the tree clean.

## Updating rules

Edit `src/rules.js` or `src/list-analysis.js`. Each rule is:

```js
{
    id: 'unique-id',
    name: 'Short name',
    category: 'spelling',
    description: 'What and why.',
    link: 'https://www.stylemanual.gov.au/...',
    check: function(text, headingLines, listLines, boldLines, italicLines, tableLines, docCtx) {
        // return [{ found, suggestion, autoFix, position, rule: this }]
    }
}
```

`position` is a character offset into the full text (paragraphs joined with
`\n`); the line Sets hold paragraph indices. Be careful with `autoFix`: the
AI-answer verifiers apply it automatically, so a wrong fix corrupts text.

## Licensing

- Code: CC BY-NC 4.0 (see `LICENSE`).
- Style Manual content: © Commonwealth of Australia, published by the
  Australian Public Service Commission. The Style Manual carries **no open
  licence** – stylemanual.gov.au asserts copyright without granting one, and
  the APSC's CC BY 4.0 grant covers material on apsc.gov.au, a different site.
  Earlier versions of this file and the site claimed CC BY 4.0; that was
  wrong and was corrected on 17 August 2026. The tool reads Style Manual page
  text to ground an answer and does not republish it: the text is bundled into
  the Cloudflare Worker and is not served from this repository.

## History

Earlier versions of this repository held the Word add-in, a plain-text
browser checker and a proof-of-concept upload tool. The rule engine carries
over from the add-in; Proof Positive (July 2026) added the AI draft-and-
verify loop, retrieval-grounded Ask, the list formatter and the citation
tool. Old versions remain in the git history.
