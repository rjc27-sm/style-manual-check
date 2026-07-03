# Proof Positive (IM2026) – deployment guide

Two parts to deploy: the **site** (GitHub Pages – you already do this) and the
**Worker** (Cloudflare – one-time setup, about 20 minutes). The site works
without the Worker; AI features stay hidden or show 'not configured' until the
Worker URL is added.

## Part 1 – publish the site

The site lives in `im2026/` in this repo. Commit and push as usual:

```
git add im2026
git commit -m "Add IM2026 Proof Positive entry"
git push
```

It will appear at:
`https://rjc27-sm.github.io/style-manual-check/im2026/`

Check all 4 pages load. AI features are off at this point – that's expected.

## Part 2 – set up the Worker (one time)

### 2.1 Create a Cloudflare account

1. Go to https://dash.cloudflare.com/sign-up and sign up (free plan).
2. Verify your email.

### 2.2 Install Wrangler and log in

In a terminal, from the `im2026/worker/` folder:

```
npx wrangler login
```

A browser window opens – approve the access request.

### 2.3 Create the rate-limit store

```
npx wrangler kv namespace create RATE_KV
```

It prints an `id`. Open `wrangler.toml` and replace
`PASTE_KV_NAMESPACE_ID_HERE` with that id.

### 2.4 Lock the Worker to your site

In `wrangler.toml`, set:

```
ALLOWED_ORIGINS = "https://rjc27-sm.github.io"
```

### 2.5 Deploy

```
npx wrangler deploy
```

It prints your Worker URL, something like
`https://im2026-proof-positive.YOURNAME.workers.dev` – copy it.

### 2.6 Add the API key (the only time you handle it)

1. In the Anthropic Console, create the API key inside your
   'IM2026 Style Manual Check' workspace.
2. Straight away, run:

```
npx wrangler secret put ANTHROPIC_API_KEY
```

3. Paste the key at the prompt and press Enter. It is stored encrypted in
   Cloudflare and cannot be read back out – not even by you.
4. Delete the key from your clipboard/notepad. Done. If you ever suspect a
   leak: revoke it in the Anthropic Console, create a new one, repeat step 2.

### 2.7 Connect the site to the Worker

In `im2026/src/ai.js`, set:

```js
export const WORKER_URL = 'https://im2026-proof-positive.YOURNAME.workers.dev';
```

Commit and push. The ✦ AI features now appear on the site.

## Cost controls – what protects you

| Layer | What it does |
|---|---|
| Prepaid credits | Hard ceiling. When credits run out, AI stops. You cannot be charged more than you loaded. |
| Workspace spend limit | Set a monthly limit + email alerts in Console → Settings → Limits. |
| `GLOBAL_DAILY_LIMIT` (500) | Total AI requests per day across all users. At Haiku prices, a full day of hits costs well under $1. |
| `IP_DAILY_LIMIT` (40) | Requests per person per day. |
| Input caps | Each AI request is capped at a few thousand characters (documents themselves are checked locally with no limit). |

Models: Haiku for rewrites, list and citation parsing; Sonnet for Ask
(`ASK_MODEL` in wrangler.toml), because Ask carries the credibility load.
Ask answers are grounded in the scraped Style Manual pages: the Worker picks
the most relevant pages from an index and reads the actual page text from
`im2026/pages/` on your site (`PAGES_BASE_URL`). Push the `pages` folder with
the rest of `im2026` or Ask will report it can't find guidance.

To change limits, edit `wrangler.toml` and run `npx wrangler deploy` again.

## Testing checklist after deploy

- [ ] Each of the 4 pages loads at the public URL
- [ ] Check a document: upload a .docx, download with comments
- [ ] An issue card shows '✦ Fix with AI' and returns a verified rewrite
- [ ] Format a list: a non-parallel list is refused and the ✦ rescue button appears and works
- [ ] Create a citation: '✦ Messy reference' tab appears and fills the form
- [ ] Ask: a question returns an answer ending in a real stylemanual.gov.au link
- [ ] Rate limit: after your daily cap, a polite limit message appears (test by temporarily setting IP_DAILY_LIMIT = "2")

## Entry email reminders (due 9am Monday 20 July)

- To InnovationMonth@finance.gov.au, from or cc your .gov.au address
- Subject: 'Build a Bureaucrat Bot entry'
- Include: name, position, agency; bot name (IM2026 included); intent +
  category (Workday Wingmate); bot card; acknowledgement it's your own work
- The link to share: your GitHub Pages URL above
