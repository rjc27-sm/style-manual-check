# Proof Positive (IM2026) – deployment guide

Proof Positive is a static site (GitHub Pages) plus one Cloudflare Worker.
There is no build step: plain HTML and vanilla JavaScript ES modules.

## The two deployment surfaces

| Surface | What lives there | How to deploy |
|---|---|---|
| GitHub Pages | Every file in the repo (master branch, repo root publishes) | `git push` |
| Cloudflare Worker `im2026-proof-positive` | API proxy: holds the Claude API key, rate limits, the retrieval index and the Style Manual page text | `npx wrangler deploy` from `im2026/worker/` |

The site works without the worker: rule-based tools (document check, citation
form) keep working; AI features show as unavailable.

## Worker setup (one-off)

1. Install wrangler and log in: `npx wrangler login`
2. Create the rate-limit KV namespace and paste its id into `wrangler.toml`:
   `npx wrangler kv namespace create RATE_KV`
3. Set the API key as a secret (never a var, never in the repo):
   `npx wrangler secret put ANTHROPIC_API_KEY`
4. Set the salt that turns a visitor's address into a one-way daily code for
   the rate limiter (any long random string):
   `npx wrangler secret put IP_HASH_SALT`
5. Switch on Analytics Engine for the account, once, in the Cloudflare
   dashboard under Workers -> Analytics Engine. Until it is on, `wrangler
   dev` and `wrangler deploy` both fail with `code: 10089` and the message
   'You need to enable Analytics Engine'. It is an account toggle, not a paid
   plan: the free tier allows 100,000 writes a day against a busiest day so
   far of 165 AI calls.
6. Deploy: `npx wrangler deploy`

## Configuration (wrangler.toml `[vars]`)

- `ALLOWED_ORIGINS` – locked to the GitHub Pages origin. Browser calls from
  any other site are refused. Set to `""` temporarily for local testing, then
  re-lock and redeploy.
- `MODEL` / `STRONG_MODEL` – the Claude model. All endpoints run Sonnet
  (`claude-sonnet-5`) as of 26 July 2026; `STRONG_MODEL` / `ASK_MODEL` are kept
  equal to `MODEL` for the `spec.strong` code path but no longer select a
  different model. To change the model, edit the var and redeploy the worker.
- `IP_DAILY_LIMIT` – AI requests per IP per day; **400** as of 22 August 2026
  (was 150). An office NAT shares one IP across everyone in the building, so
  this is not really ‘per person’ – that, not any single heavy user, is what
  the number has to cover.
- `GLOBAL_DAILY_LIMIT` – shared daily cap across all users; the cost
  safety-net, and the one that actually matters. Raised to 1000 for the IM2026
  judging window (July 2026) – consider dropping back afterwards. At the
  measured ~1.9c a call that caps a day at roughly $19; the busiest day so far
  was 165 calls ($3.10, 17 August 2026), and a whole month runs about $10.
- `RATE_KEY_PREFIX` – leave EMPTY in production. Prefixes every rate-counter
  key so a test session keeps its own counters (see ‘Testing without spending
  the users’ budget’ below).

### Reading the counters

Refusals are counted as well as requests, because a user who runs out sees
‘try AI again tomorrow’ and usually just closes the tab – nothing that looks
like a bug to report. So ‘nobody has reported hitting the cap’ is not evidence
that nobody has. Check it:

```
npx wrangler kv key get --namespace-id 3cace9b99cdd430ba1a873add185c670 --remote "g:$(date -u +%F)"
npx wrangler kv key get --namespace-id 3cace9b99cdd430ba1a873add185c670 --remote "blocked:ip:$(date -u +%F)"
npx wrangler kv key get --namespace-id 3cace9b99cdd430ba1a873add185c670 --remote "blocked:global:$(date -u +%F)"
```

Request counters expire after 25 hours; the `blocked:` counters are kept for
30 days so a fortnightly look back still finds them. A missing key means zero.

The per-IP key holds a one-way daily code, not an address (22 August 2026).
`dailyId()` in `worker.js` hashes the address with the `IP_HASH_SALT` secret and
the date, so the limiter still recognises a caller within a day but nothing that
identifies anyone is ever written. Before that change the key was
`ip:<the actual address>:<day>`, which meant a list of the day's visitors sat in
KV for 25 hours. If `IP_HASH_SALT` is unset every caller shares one bucket, so a
missing secret throttles hard rather than failing open.

### Reading the usage data

The counters above say how much. Analytics Engine says who, roughly: which
feature, which country and state, and the NAME OF THE NETWORK the request came
from, which is the only thing that distinguishes one agency from another when
everyone in a building shares an address. Page loads are counted too - Check a
document runs entirely in the browser, so without the beacon the main feature
would not appear in any figure. Written by `record()` in `worker.js`; nothing
but the counts listed on the About page is recorded.

```
node read_analytics.mjs
node read_analytics.mjs --days 7
node read_analytics.mjs --month 2026-08
```

`read_analytics.mjs` lives at the repo root and is **gitignored, permanently**:
its output carries agency network names and this repo is public. It needs a
`.env` beside it holding `CF_ACCOUNT_ID` and a `CF_ANALYTICS_TOKEN` with the
`Account | Account Analytics | Read` permission. Without the script:

```
curl -X POST "https://api.cloudflare.com/client/v4/accounts/<account-id>/analytics_engine/sql" \
  -H "Authorization: Bearer <token>" \
  -d "SELECT blob3 AS network, SUM(double1) AS requests FROM pp_usage
      WHERE timestamp > NOW() - INTERVAL '30' DAY GROUP BY network ORDER BY requests DESC"
```

**The counts are estimates, and you must count with `SUM(_sample_interval)`.**
Analytics Engine SAMPLES per index, keeping a fraction of rows and giving each
survivor a weight in `_sample_interval`. `COUNT()` and `SUM(double1)` both ignore
that weight and undercount badly. Measured 22 August 2026: 20 beacons sent to the
deployed Worker came back as 10 raw rows whose `_sample_interval` summed to 22 -
so the corrected figure was right to within about 10%, and the naive one was half.
`read_analytics.mjs` uses the corrected form everywhere. Two consequences:
`COUNT(DISTINCT blob6)` for 'people' CANNOT be sample-corrected and reads low, and
no figure here is exact. That is fine for the question being asked - reach, and
which networks - but do not quote these as precise counts.

**Analytics Engine keeps three months.** That is why there is a monthly summary
task; without it the record simply falls off the back. The dataset has to be
switched on for the account before any of this works - the Worker degrades to
writing nothing at all if it is not, silently and by design, because a usage
counter must never break a request.

Two numbers worth remembering when quoting any of this. Everyone behind an
agency gateway shares one address, so the 'people' column is a floor and the
network breakdown is the trustworthy figure. And a page count is not a person:
somebody who opens four tools counts four times.


### Testing without spending the users’ budget

`wrangler dev --remote` uses the REAL KV, so an ordinary test round eats the
same daily budget as the users – which is how the cap was exhausted twice.
Namespace the counters away instead, and lift your own limit while you are
there:

```
npx wrangler dev --remote --var RATE_KEY_PREFIX:dev- --var IP_DAILY_LIMIT:100000
```

Both are command-line overrides; neither touches the deployed Worker.
- `PAGES_BASE_URL` – removed 17 August 2026. The page text is bundled into the
  Worker; there is nothing to fetch.

## Refreshing the Ask source pages

The Style Manual page text lives INSIDE the Worker, not on the public site.
Two generated files, both bundled by `npx wrangler deploy`:

- `im2026/worker/pages-content.js` - the page markdown, keyed by slug.
- `im2026/worker/pages-index.js` - the retrieval index over SECTIONS of it.

**Both are gitignored and must stay that way.** They hold Style Manual content
(the index carries every section heading), and the manual is Crown copyright
with no open licence. They go from your machine to Cloudflare via
`wrangler deploy` without passing through the repository. A fresh clone will
not have them: run the two scripts below before deploying. `npm test` skips the
retrieval tests when they are absent rather than failing.

Both come from one script in one pass, which is what keeps them consistent:
the index stores a chunk NUMBER and the worker re-derives chunks from the text,
so a mismatch would silently serve the wrong text under the right heading.
Never regenerate one without the other.

```
python scrape_stylemanual.py    # stylemanual.gov.au -> scraped_pages/ (gitignored)
python build_pages_index.py     # scraped_pages/ -> both worker files
node tests/retrieval.mjs        # checks they agree, and the known questions
cd im2026/worker && npx wrangler deploy
```

`scrape_stylemanual.py` reads `style_manual_urls.txt` and writes complete
markdown - `*italics*`, `**bold**`, tables, and the Example / Correct /
Incorrect cards with their labels. Both scripts are at the repo root and are
gitignored, like the other build scripts.

This is a Worker-only change now: no `git push` needed for a source refresh,
and no deploy-order trap, because the index and the text it numbers ship
together.

### Why the pages are not published

Until 17 August 2026 the page text was served as static files from
`im2026/pages/` and fetched by the Worker over HTTP. That made this public
repository a browsable copy of the Style Manual.

The Style Manual carries no open licence. Its disclaimer and copyright page
asserts Crown copyright and has said nothing about Creative Commons since the
site went live in 2020. The APSC's CC BY 4.0 grant is worded to cover material
on `apsc.gov.au`, a different site. An earlier version of this file, and the
site footer, claimed the content was used under CC BY 4.0. That was wrong and
has been corrected.

The content is © Commonwealth of Australia, Australian Government Style Manual,
published by the Australian Public Service Commission. It is used to produce an
answer and is not republished. Every answer links back to the source page.

## The sample briefing

`im2026/assets/sample-briefing.docx` (the fictional Department of Unicorn
Management) is generated by `build_sample_briefing.py` at the repo root
(local-only, gitignored). The planted style issues are deliberate – if you
edit the wording, keep the issues, and keep the disclaimer paragraph
style-clean.

## Shared rule engine – blast radius

`src/rules.js`, `src/list-analysis.js` and `src/spellings.js` at the repo
root are the canonical rules, shared by four tools: the Word add-in, the
browser checker, Format-a-list, and the verification step applied to every
AI answer. Any rule change needs regression testing across all four, and
extra care with rules that carry an `autoFix` – every AI-output verifier
applies those automatically (Make-it-plain, Ask, Format-a-list items and
Check-a-document rewrites), so a wrong `autoFix` silently corrupts text.
Create-a-citation is the one exemption: it preserves source wording verbatim.
