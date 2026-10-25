import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const blog = await getCollection('blog');
  const siteBase = import.meta.env.BASE_URL.replace(/\/$/, '');

  return rss({
    title: 'paise fit — Wealth & Financial Fitness Blog',
    description: 'Pragmatic personal finance and goal planning guides with zero surveillance, zero fluff, and mathematical precision.',
    site: context.site || 'https://paise.fit',
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
