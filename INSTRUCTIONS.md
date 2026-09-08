# Instructions: INR Finance Compass Website & Sovereign Blog

This guide outlines setup, local development, email integration with Resend, deployment to Cloudflare Pages or GitHub Pages, and editorial blog authoring.

---

## Table of Contents

1. [Local Development Setup](#1-local-development-setup)
2. [Hosting & Deployment](#2-hosting--deployment)
   - [Option A: Cloudflare Pages (Recommended)](#option-a-cloudflare-pages-recommended)
   - [Option B: GitHub Pages](#option-b-github-pages)
3. [Configuring Resend for Waitlist Emails](#3-configuring-resend-for-waitlist-emails)
4. [Authoring New Blog Articles](#4-authoring-new-blog-articles)
5. [Interactive MDX Financial Widgets](#5-interactive-mdx-financial-widgets)
6. [Quality Gates & Validation](#6-quality-gates--validation)

---

## 1. Local Development Setup

### Requirements
- **Node.js**: `>= 22.12.0` (v26+ supported)
- **npm**: `>= 10.0.0`

### Step-by-Step Commands

```bash
# 1. Clone or navigate to the repository
cd /path/to/finance-compass-web

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Visit **`http://localhost:4321`** in your browser to view the landing page and blog.

---

## 2. Hosting & Deployment

### Option A: Cloudflare Pages (Recommended)

Cloudflare Pages provides global edge hosting, instant previews for git branches, and native edge functions for processing Resend emails securely without a standalone server.

#### Steps to Deploy:
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Compute (Workers & Pages)** > **Create application** > **Pages** > **Connect to Git**.
3. Select the `OhYash/finance-compass-web` repository.
4. Set the build configuration:
   - **Framework Preset**: `Astro` (or `None`)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node.js version**: In Environment Variables, set `NODE_VERSION` to `22` or `24`.
5. Under **Environment Variables**, add your Resend credentials (see [Section 3](#3-configuring-resend-for-waitlist-emails)).
6. Click **Save and Deploy**.

> **How Resend works on Cloudflare Pages**:
> The function in `functions/api/waitlist.ts` automatically runs on Cloudflare's edge network under `https://<your-project>.pages.dev/api/waitlist`. The `RESEND_API_KEY` stays completely confidential and is never exposed to browser clients.

---

### Option B: GitHub Pages

The repository includes a ready-to-use GitHub Actions workflow at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

#### Steps to Enable:
1. Push your code to the `main` branch of `OhYash/finance-compass-web`.
2. Go to your GitHub repository: **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, choose **GitHub Actions**.
4. The workflow will automatically trigger on push, running:
   - `npm run check` (typecheck validation)
   - `npm run build:gh-pages` (builds static site with base path `/finance-compass-web`)
   - Deploying directly to `https://ohyash.github.io/finance-compass-web/`.

> **Note on Waitlist Submissions on GitHub Pages**:
> Because GitHub Pages is purely static and cannot execute server-side Node code, the waitlist form automatically defaults to graceful client-side capture / mock acknowledgment. To send live Resend emails with GitHub Pages, set Cloudflare Pages as the primary host or point `data-endpoint` to an external serverless endpoint.

---

## 3. Configuring Resend for Waitlist Emails

### Step 1: Obtain Resend API Key
1. Sign up or log in at [Resend.com](https://resend.com).
2. Navigate to **API Keys** > **Create API Key**.
3. Copy the key (starts with `re_...`).

### Step 2: (Optional) Set up an Audience List
1. In Resend, go to **Audiences** > **Add Audience**.
2. Name it (e.g. `INR Finance Compass Waitlist`).
3. Copy the `Audience ID` (e.g. `d3b2...`).

### Step 3: Configure Environment Variables
Add these environment variables in your Cloudflare Pages dashboard (under **Settings** > **Environment Variables**) or in a local `.env` file:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `RESEND_API_KEY` | Secret API key from Resend | `re_123456789...` |
| `RESEND_FROM_EMAIL` | Verified sender email address | `INR Finance Compass <waitlist@financecompass.in>` |
| `RESEND_AUDIENCE_ID` | *(Optional)* Audience list ID | `d3b2ca48-...` |
| `NOTIFY_ADMIN_EMAIL` | *(Optional)* Admin email to receive alerts on new signups | `you@yourdomain.com` |
| `PUBLIC_SITE_URL` | Canonical website base URL | `https://financecompass.in` |

*When `RESEND_API_KEY` is not present (such as in local preview), the waitlist endpoint automatically logs a notice and returns a mock success response so forms can be visually tested without errors.*

---

## 4. Authoring New Blog Articles

Articles are stored as `.md` or `.mdx` files in `src/content/blog/`.

### Creating a New Post
Create a file such as `src/content/blog/my-new-guide.mdx`:

```mdx
---
title: "Understanding Sovereign Gold Bonds vs Physical Gold"
description: "Why the 2.50% semi-annual RBI coupon and tax-free redemption at maturity make SGBs mathematically superior to digital gold."
pubDate: 2026-09-08
tags: ["Gold", "SGB", "Taxation", "Sovereign Wealth"]
author: "Yash Sharma"
featured: true
---
import CompoundCalc from '../../components/widgets/CompoundCalc';

Your editorial content goes here. You can write standard Markdown with headers, bold text, tables, and lists.

## Mathematical Projection

<CompoundCalc client:visible />
```

### Frontmatter Schema Reference
- `title` *(string, required)*: Headline of the article.
- `description` *(string, required)*: Summary used for social preview cards and SEO description.
- `pubDate` *(date, required)*: Publishing date (`YYYY-MM-DD`).
- `updatedDate` *(date, optional)*: Date of last major revision.
- `tags` *(string[], default: `[]`)*: Category badges.
- `author` *(string, default: `'INR Finance Compass Team'`)*: Author attribution.
- `featured` *(boolean, default: `false`)*: Set `true` to highlight on the blog homepage.

> **Automatic Syndication**:
> Any valid post added to `src/content/blog/` is automatically:
> 1. Rendered at `/blog/<file-slug>/`
> 2. Added to `/blog/` archive
> 3. Included in the RSS feed at `/rss.xml`
> 4. Listed in the XML sitemap at `/sitemap-index.xml`

---

## 5. Interactive MDX Financial Widgets

Interactive components live in `src/components/widgets/` and can be embedded in any `.mdx` post using the `client:visible` directive:

- **`CompoundCalc.tsx`**: Interactive SIP and wealth compounding simulator with annual step-up calculation and Indian Rupee (`₹ Lakh` / `₹ Crore`) formatting.
- **`EpfTaxEstimator.tsx`**: Real-time Section 10(11)/(12) ₹2.5 Lakh tax threshold calculator modeling EPF + VPF interest taxation.

*Because components use `client:visible`, the JavaScript payload is only downloaded when the user scrolls the calculator into view, keeping initial page load at 0 KB client JS.*

---

## 6. Quality Gates & Validation

Run these commands before pushing any changes:

```bash
# 1. Typecheck all Astro files, TypeScript components, and content schemas
npm run check

# 2. Test standard production build (Root / Cloudflare Pages)
npm run build

# 3. Test GitHub Pages subpath build
npm run build:gh-pages

# 4. Preview local production build
npm run preview
```
