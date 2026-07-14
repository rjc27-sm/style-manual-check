# Proof Positive (IM2026) / Style Manual Check

Tools that check writing against the
[Australian Government Style Manual](https://www.stylemanual.gov.au) using a
deterministic rule engine – the same check gives the same answer every time.
Where fixing an issue takes judgement, generative AI drafts a suggestion and
the rule engine checks the output before anyone sees it: **AI drafts,
deterministic rules verify.**

**Live site:** https://rjc27-sm.github.io/style-manual-check/im2026/

Proof Positive is an entry in the APS Innovation Month 2026 'Build a
Bureaucrat Bot' challenge (IM2026). It is a personal project by Jen
Robertson, not an official government service.

## The five tools

| Tool | What it does | AI |
|---|---|---|
| Check a document | Upload a .docx, get it back with a Word review comment on every style issue. Runs entirely in the browser – nothing is uploaded. | Optional ✦ rewrites |
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
  `src/spellings.js`): 106 rules across 12 categories, 1,170 US→AU spelling
  mappings. Runs in the browser; documents never leave the user's device.
- **Cloudflare Worker** (`im2026/worker/`): the only server component. Holds
  the Claude API key, enforces per-IP and global daily limits, and serves
  the Ask retrieval index over 160+ saved Style Manual pages
  (`im2026/pages/`). See [im2026/DEPLOY.md](im2026/DEPLOY.md).
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
  pages/                Saved Style Manual pages used by Ask (CC BY 4.0)
  src/                  Page logic + AI client + verification (autoCorrect)
  worker/               Cloudflare Worker proxy + retrieval index
  skill/                Claude skill mirroring the rule engine
src/                    Canonical shared rule engine
  rules.js              The rules (id, name, category, description, link, check)
  list-analysis.js      List-type detection and list rules
  spellings.js          US→AU spellings, watch words, wordy phrases
  docx-annotate.js      .docx reading and Word-comment insertion
StyleManualCheck/       Word add-in (Office.js)
style-manual-check/     Pre-2026 browser checker (superseded)
tests/                  End-to-end test for the annotator (npm test)
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

The test loads a sample document, runs all rules, writes an annotated copy
and verifies: body text unchanged, comment markers balanced, comment ids
unique, comments part well formed, content type and relationship registered.
Always open annotated output in Word as a final check.

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
- Style Manual content (rules' source guidance and the saved pages used by
  Ask): © Commonwealth of Australia, used under
  [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

## History

Earlier versions of this repository held the Word add-in, a plain-text
browser checker and a proof-of-concept upload tool. The rule engine carries
over from the add-in; Proof Positive (July 2026) added the AI draft-and-
verify loop, retrieval-grounded Ask, the list formatter and the citation
tool. Old versions remain in the git history.
