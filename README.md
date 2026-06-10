# Style Manual Check

A web tool that checks documents against the [Australian Government Style Manual](https://www.stylemanual.gov.au). Users upload a Word document and download the same document back with review comments marking each style issue. Every comment links to the relevant Style Manual page. A quick text check handles pasted text.

**Live tool:** https://rjc27-sm.github.io/style-manual-check/

The tool runs entirely in the browser. Documents are never uploaded to a server and no data leaves the user's device.

## How it works

1. The browser reads the .docx as a ZIP (JSZip) and parses `word/document.xml`.
2. The rule engine (74 rules in 9 categories) runs over the extracted text, with paragraph-level context for headings, lists, bold, italics and tables read straight from the document XML.
3. For each issue, a Word comment range is anchored to the exact text. Runs are split where needed, keeping identical run properties, so formatting is untouched.
4. Comments are written to `word/comments.xml` (created, or appended if the document already has comments) with the matching content-type and relationship entries.
5. The user downloads the modified ZIP as a .docx and reviews the comments in Word.

No document rebuild, no server, no build step.

## Files

```
docs/                   The published site (GitHub Pages serves this folder)
  index.html            The app - document check and quick text check
  src/
    rules.js            74 rules in 9 categories (canonical rule engine)
    spellings.js        US-to-AU spelling dictionaries and word lists
    docx-annotate.js    docx reading and comment insertion
    app.js              UI logic
    packs/
      aihw.js           AIHW house style rule pack (scaffold - no rules yet)
tests/
  run-tests.mjs         End-to-end test (Node)
  sample.docx           Test document with known issues
```

## Rule packs

Core Style Manual rules always run. Agency packs add rules on top - same rule shape, separate file, toggled in the UI. `docs/src/packs/aihw.js` is the scaffold for the AIHW module. The toggle stays disabled until the pack has rules.

## Running locally

ES modules will not load from `file://`. Serve the folder:

```
cd docs
python -m http.server 8000
```

then open http://localhost:8000.

## Testing

```
npm install
npm test
```

The test loads the sample document, runs all rules, writes an annotated copy and verifies: body text unchanged, comment markers balanced, comment ids unique, comments part well formed, content type and relationship registered.

Always open the annotated output in Word as a final check - automated verification cannot confirm how Word renders the comments.

## Updating rules

Edit `docs/src/rules.js` (or a pack file). Each rule is:

```js
{
    id: 'unique-id',
    name: 'Short name',
    category: 'spelling',
    description: 'What and why.',
    link: 'https://www.stylemanual.gov.au/...',
    check: function(text, headingLines, listLines, boldLines, italicLines, tableLines) {
        // return [{ found, suggestion, autoFix, position, rule: this }]
    }
}
```

`position` is a character offset into the full text (paragraphs joined with `\n`); the line Sets hold paragraph indices.

## History

Earlier versions of this repository held a Word add-in (Office.js), a plain-text browser checker and a proof-of-concept upload tool. They were consolidated into this single version in June 2026 - the rule engine carries over unchanged from the add-in. The old versions remain in the git history.
