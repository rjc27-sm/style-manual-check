# Proof Positive (IM2026) – handoff for the next Claude

You are taking over an established, deployed project. The owner is Jennifer
Robertson, Authoring Support Manager at the Australian Institute of Health
and Welfare (AIHW), Canberra. She is an expert editor, not a developer:
explain technical steps plainly, give exact commands, and never assume git
or cloud knowledge. She values accuracy over invention – never fabricate a
Style Manual rule, URL or citation. Use Australian English in everything.

## What this is

Proof Positive is Jennifer's entry in the APS Innovation Month 2026
'Build a Bureaucrat Bot' challenge (entry due **9am Monday 20 July 2026** to
InnovationMonth@finance.gov.au; category: Workday Wingmate). It is live:

- Site: https://rjc27-sm.github.io/style-manual-check/im2026/
- Worker: https://im2026-proof-positive.jcr27.workers.dev

Core design philosophy – hers, and the pitch of the entry: **you can't
prompt your way to reliability.** A deterministic rule engine (106 rules
codified from the Australian Government Style Manual) does everything
codifiable. Generative AI handles only judgement calls, and the rule engine
re-checks every AI output before the user sees it ('the bot marks the AI's
homework'). Protect this separation in everything you build.

## Repository map (C:\Projects\style-manual-check)

The repo root is ALSO her separate AIHW-internal tool ('Style Manual
Check'). Both tools share `src/`. **Changes to `src/` affect both tools** –
be careful and test both.

- `src/rules.js` – the rule engine, 106 rules in 12 categories. Source of
  truth for everything. Rule shape: `{id, name, category, description,
  link, check(text, headingLines, listLines, boldLines, italicLines,
  tableLines, docCtx)}`. Structure rules use `docCtx`
  (headingLevels/links/underlines from docx) and no-op without it.
- `src/list-analysis.js` – list-type detection + list rules.
- `src/spellings.js` – US→AU dictionary (~1,170 mappings) and word lists.
- `src/docx-annotate.js` – reads .docx, adds Word review comments
  (`annotateDocx(loaded, issues, env, {author, initials})`).
- `im2026/` – the public entry (this folder):
  - `index.html` – Check a document (docx/text) + 'Fix with AI'
  - `plain.html` – Make it plain (AI plain English rewrite, verified)
  - `lists.html` – list formatter (self-contained inline JS) + AI parallel rescue
  - `citations.html` – citation generator (self-contained inline JS) + AI messy-reference parser
  - `ask.html` – retrieval-grounded Q&A with verification badge
  - `src/ai.js` – Worker client; `WORKER_URL` lives here
  - `src/verify.js` – runs all rules over AI output; the homework marker
  - `assets/site.css` – shared chrome; versioned (see conventions)
  - `pages/*.md` – 146 scraped Style Manual page extracts (the Ask corpus)
  - `worker/worker.js` + `wrangler.toml` – Cloudflare Worker proxy
  - `skill/proof-positive-style/` – Claude skill generated from the engine
  - `DEPLOY.md` – Jennifer's step-by-step ops guide

## Architecture and data flow

1. Rule checks run 100% in the browser. No user text ever leaves the
   device for deterministic features. This is a hard promise made in the UI.
2. AI features (marked ✦) POST to the Worker, which holds the API key
   (Cloudflare secret – never in the repo), enforces per-IP (40/day) and
   global (500/day) limits and input caps, then calls the Claude API.
   Models: `claude-haiku-4-5` for fix/list/citation/plain,
   `claude-sonnet-5` for Ask (`ASK_MODEL` in wrangler.toml).
3. Ask retrieval: `worker/pages-index.js` (keyword index) picks the top 3
   pages; the Worker fetches their text from `im2026/pages/` on the site
   and grounds the answer in those extracts only. It returns
   `{answer, sources: {url: title}}`; the client renders links as
   'Page title | Style Manual'.
4. Verification: `verify.js` + `autoCorrect()` (in ask.html/plain.html)
   run all rules over AI text, auto-apply mechanical `autoFix`es (URLs
   masked first), and show '✔ Checked against N rules'.

## Cost safety (why Jennifer can relax)

Prepaid API credits are the hard ceiling – if abused, calls stop; no bill
shock is possible. Below that: workspace spend limits, Worker rate limits,
input caps, cheap models. Do not remove any layer.

## Conventions and gotchas

- **Cache-busting**: pages load `assets/site.css?v=N`. Any time you change
  site.css, bump N in all 5 HTML pages, or users get broken styling.
- **Two deploys**: site changes = `git add . && git commit && git push`
  (GitHub Pages, publishes repo root). Worker changes = `npx wrangler
  deploy` from `im2026/worker/`. Prompt changes live in the Worker!
- **GitHub Pages flakiness**: deploys sometimes fail with 'Deployment
  failed, try again later'. Remedy: Actions → Re-run failed jobs; if it
  persists, Settings → Pages → Source: None → Save → re-enable branch
  master / root. A zombie 'queued' run from 3 July may still be visible;
  it's harmless and uncancellable.
- **.gitignore**: aggressively excludes `*.md`, `Assets/` etc.; the block
  at the END re-includes `im2026/**`. Keep those negations last.
- **Category ids** were renamed when the rules were completed
  (dates-and-time, numbers-and-measurements, government-terms,
  inclusive-language, accessibility, links). `categoryLabel()` maps them in
  both app.js files.
- **AIHW pack** (`src/packs/aihw.js`) is used by the root tool only. The
  im2026 entry deliberately excludes it.
- **No impersonation**: the challenge forbids presenting as an official
  government service. Keep the disclaimers in every footer, keep 'IM2026'
  visible in the header, don't add the Coat of Arms.
- **Accessibility is non-negotiable**: WCAG 2.1 AA. Nav tooltips work on
  hover + keyboard focus with aria-describedby. Keep skip links, labels,
  aria-live regions, reduced-motion support.
- **Style Manual style in the UI**: all user-facing text follows the rules
  the tool enforces (spaced en dashes, no e.g., sentence case, single
  quotes). Check your own copy with the engine before shipping – the tool
  being non-compliant would be mortifying.
- **Never invent URLs.** Ask can only cite pages from its index. When
  adding Style Manual links anywhere, verify against
  `style_manual_urls.txt` (repo root, untracked) or `pages/`.

## Regenerating the Claude skill

`im2026/skill/proof-positive-style/` was generated from the engine
(rules.md from RULES + LIST_RULES metadata; spellings.md from SPELLINGS).
When rules change, regenerate those reference files the same way, re-zip
the folder as `proof-positive-style.skill` and give it to Jennifer to
reinstall. The engine is always the source of truth.

## State at handoff (4 July 2026)

Done: everything above is built; the site and Worker are deployed and
confirmed working. Recent additions possibly not yet pushed/deployed by
Jennifer: Make it plain page, Ask verification + titled links, plain
endpoint in the Worker (needs `npx wrangler deploy`), skill folder,
this handoff.

Outstanding, in rough priority order:

1. Lock `ALLOWED_ORIGINS = "https://rjc27-sm.github.io"` in wrangler.toml
   and redeploy the Worker (after Jennifer finishes ad-hoc testing).
2. Entry email + bot card by 9am 20 July (draft bot card exists –
   Jennifer has it; polish on request).
3. Pilot feedback tweaks as testers use it.
4. Post-competition roadmap, discussed and agreed with Jennifer:
   - tracked-change autofixes in the docx (deferred: requires destructive
     run-splitting with w:ins/w:del; start with spelling-only fixes;
     large corruption-risk testing burden – this is why it was deferred)
   - richer Ask retrieval (the index is keyword-based; genuine scoring
     improvements welcome, but keep it deterministic and inspectable)
   - the APSC ownership conversation: long-term she wants the Style
     Manual team to own a structured rule set (YAML) any tool can consume.

## Working with Jennifer

Ask before assuming scope. Offer options with a recommendation rather than
open questions. She'll say 'do not code anything yet' when she means it –
respect that. Explain git/Cloudflare/GitHub steps as exact commands with
one-line explanations. When something breaks mid-deploy, diagnose from the
actual error before proposing fixes. And keep her Style Manual philosophy
intact: deterministic where possible, AI only where judgement is needed,
and always verified.
