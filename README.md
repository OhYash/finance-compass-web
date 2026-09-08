# INR Finance Compass — Website & Sovereign Blog

> Public marketing landing page, early-access waitlist, and SEO-optimized Indian personal finance blog with interactive MDX calculators for **INR Finance Compass**.

---

## Architecture & Stack

- **Framework**: [Astro 7](https://astro.build) with Static Site Generation (`output: 'static'`) for 0 KB baseline client JavaScript.
- **Styling**: Tailwind CSS v4 with `@tailwindcss/typography`.
- **Interactivity**: Selective React islands hydrated on demand (`client:visible`) for MDX financial calculators.
- **Blog Engine**: Astro Content Layer (`src/content.config.ts`) with strict Zod frontmatter schema validation.
- **Waitlist & Email Delivery**: [Resend](https://resend.com) integration executed via serverless Cloudflare Pages Functions (`functions/api/waitlist.ts`).
- **Hosting**:
  - **Cloudflare Pages** (Primary): Full root URL support, instant global edge CDN, and native edge functions for Resend.
  - **GitHub Pages** (Alternative): Automated via GitHub Actions workflow (`.github/workflows/deploy.yml`).

---

## Directory Structure

```text
finance-compass-web/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Pages deployment workflow
├── functions/
│   └── api/
│       └── waitlist.ts             # Cloudflare Pages Function (Resend API)
├── public/
│   └── favicon.svg                 # Brand icon
├── src/
│   ├── components/
│   │   ├── Header.astro            # Responsive navigation & brand header
│   │   ├── Footer.astro            # Sovereign pledge & footer links
│   │   ├── ThemeToggle.astro       # Dark/light mode switcher with zero FOUC
│   │   ├── WaitlistForm.astro      # Email capture connected to Resend
│   │   ├── SeoHead.astro           # Meta tags, OpenGraph, Twitter, RSS
│   │   └── widgets/                # Interactive MDX React islands
│   │       ├── CompoundCalc.tsx    # SIP & step-up compounding calculator
│   │       └── EpfTaxEstimator.tsx # Section 10(11)/(12) ₹2.5L EPF calculator
│   ├── content.config.ts           # Blog collection schema definition
│   ├── content/
│   │   └── blog/                   # Markdown / MDX articles
│   │       ├── epf-vs-ppf-compounding.mdx
│   │       ├── why-bank-balances-drift.mdx
│   │       └── sovereign-indian-wealth-tracking.mdx
│   ├── layouts/
│   │   ├── BaseLayout.astro        # Base HTML shell
│   │   └── BlogPostLayout.astro    # Editorial reading layout with progress bar
│   ├── pages/
│   │   ├── index.astro             # Landing page & self-hosting guide
│   │   ├── blog/
│   │   │   ├── index.astro         # Blog archive
│   │   │   └── [...slug].astro     # Dynamic post renderer
│   │   └── rss.xml.ts              # RSS 2.0 feed generator
│   └── styles/
│       └── global.css              # Tailwind v4 theme & typography
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Local Development Server

```bash
npm run dev
```

Visit `http://localhost:4321` in your browser.

### 3. Typecheck & Validate

```bash
npm run check
```

### 4. Build for Production

- **Cloudflare Pages / Custom Domain (Root `/`)**:
  ```bash
  npm run build
  ```
- **GitHub Pages (Subpath `/finance-compass-web`)**:
  ```bash
  npm run build:gh-pages
  ```

---

## Configuring Resend for Waitlist Emails

When deploying to **Cloudflare Pages**:
1. In the Cloudflare Dashboard, go to **Workers & Pages** > Your Project > **Settings** > **Environment Variables**.
2. Add the following production variables:
   - `RESEND_API_KEY`: Your Resend API key (`re_...`).
   - `RESEND_AUDIENCE_ID` *(optional)*: Your Resend Audience ID to automatically collect contacts into a mailing list.
   - `RESEND_FROM_EMAIL`: Verified sender email (e.g. `INR Finance Compass <waitlist@yourdomain.com>`).
   - `NOTIFY_ADMIN_EMAIL` *(optional)*: Email address to receive signup alerts.

*Note: In local development or when `RESEND_API_KEY` is omitted, the waitlist form automatically runs in mock mode with instant user feedback.*

---

## Authoring New Blog Articles

Add a new `.md` or `.mdx` file to `src/content/blog/<slug>.mdx`:

```mdx
---
title: "Your Article Title"
description: "A concise, engaging description for SEO and social preview cards."
pubDate: 2026-09-08
tags: ["EPF", "Taxes", "Investing"]
author: "Your Name"
featured: false
---
import CompoundCalc from '../../components/widgets/CompoundCalc';

Your markdown content here...

<CompoundCalc client:visible />
```

Astro automatically validates the frontmatter via Zod, generates the route at `/blog/<slug>`, includes it in `sitemap-index.xml`, and syndicates it to `/rss.xml`.
