# LinkedIn Block Mitigation Runbook

## Purpose
Use this runbook when LinkedIn blocks the primary portfolio link with messages like `Malicious Website Suspected`. This runbook describes how to deploy the portfolio to a secondary custom domain or mirror (using Cloudflare Pages as a fallback target) to bypass the block.

---

## 1) Primary vs. Secondary Deployments

- **Primary Pipeline (GitHub Pages)**: Automatically builds and deploys to `https://daichunghy-ben.github.io/portfolio/index.html` on every push to the `main` branch.
- **Fallback Pipeline (Cloudflare Pages)**: Used to deploy a mirror or secondary domain (e.g. `https://portfolio.your-custom-domain.com`) to bypass a block. This uses Cloudflare Pages functions to automatically redirect stale links.

---

## 2) Prepare Deploy Variables (For Fallback Deployments)
If deploying a mirror on Cloudflare Pages, set these environment variables locally before staging/publishing:

```bash
export CF_PAGES_PROJECT="your-pages-project"
export SITE_URL="https://portfolio.your-custom-domain.com"
export LEGACY_PAGES_HOSTS="chunghy-portfolio.pages.dev,chunghy.pages.dev"
```

Notes:
- `SITE_URL` must be your final custom domain (HTTPS).
- `LEGACY_PAGES_HOSTS` is the list of old Pages hosts that should 301 redirect to `SITE_URL`.

---

## 3) Stage + Validate Metadata (All Deployments)

Before deploying or pushing changes, always run the build and validation scripts locally:

```bash
npm run stage:pages
npm run check:local
```

What this does:
- Compiles assets (CSS, JS, optimized images).
- Rewrites staged canonical and `og:url` tags to absolute URLs under the configured `SITE_URL` (or falls back to GitHub Pages URL if not set).
- Normalizes `og:image`, `og:image:secure_url`, and `twitter:image` to absolute URLs.
- Updates staged `assets/data/site-config.json` with deploy-time URL fields.

---

## 4) Deploying the Site

### Option A: Primary Deployment (GitHub Pages)
Simply commit and push your changes to the `main` branch. The GitHub Actions workflow will automatically compile, stage, and deploy the site:
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

### Option B: Fallback Deployment (Cloudflare Pages)
To deploy the staged site to Cloudflare Pages (which supports Serverless middleware functions like redirecting old domains), run:
```bash
npm run deploy:pages
```
*Note: Deploying to Cloudflare Pages includes the Functions middleware (`functions/_middleware.js`) which detects requests from legacy hosts and performs a 301 redirect to `SITE_URL`.*

## 5) Collect Evidence for LinkedIn Review

```bash
npm run evidence:linkedin
```

This writes a markdown report under `.audit/linkedin/` containing:
- Direct `HEAD` checks (normal and LinkedInBot UA).
- Snapshot of LinkedIn redirect/check page signals.

Attach this report when submitting a false-positive request.

## 6) Quick Link Hygiene Audit

```bash
npm run audit:externals
```

Review domains flagged as:
- non-HTTPS links,
- known shorteners,
- direct IP-host links.

## 7) LinkedIn Submission Template
Use this message in LinkedIn's report form:

> My portfolio domain was blocked as malicious, but the site serves clean static content and returns normal responses (`HTTP 200`) for both browser and bot user-agents. We also migrated to a dedicated custom domain and implemented permanent redirects from old Pages hosts. Please review and remove this false-positive block.

Include:
- blocked URL,
- custom domain URL,
- timestamp and evidence file content.

## 8) Acceptance Checks
- Desktop LinkedIn profile link opens site (no block page).
- Mobile LinkedIn app link opens site.
- `curl -I` on custom domain returns `2xx`.
- `curl -I` on legacy host returns `301` to custom domain.
- LinkedIn Post Inspector renders preview.
