// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

const isGithubPages = process.env.GITHUB_PAGES === 'true';

// https://astro.build/config
export default defineConfig({
  site: isGithubPages
    ? 'https://ohyash.github.io'
    : (process.env.PUBLIC_SITE_URL || 'https://finance-compass-web.pages.dev'),
  base: isGithubPages ? '/finance-compass-web' : '/',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    mdx(),
    sitemap(),
    react(),
  ],
});
