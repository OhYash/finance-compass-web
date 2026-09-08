import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const blog = await getCollection('blog');
  const siteBase = import.meta.env.BASE_URL.replace(/\/$/, '');

  return rss({
    title: 'INR Finance Compass — Sovereign Indian Wealth Blog',
    description: 'Pragmatic Indian personal finance deep dives with zero surveillance, zero fluff, and mathematical precision.',
    site: context.site || 'https://financecompass.in',
    items: blog
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.description,
        link: `${siteBase}/blog/${post.id.replace(/\.(md|mdx)$/, '')}/`,
      })),
    customData: `<language>en-in</language>`,
  });
}
