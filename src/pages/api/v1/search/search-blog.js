// src/pages/api/v1/search/blog.js
import { getCollection } from 'astro:content';

export async function get({ url }) {
  const q = (url.searchParams.get('q') || '').toLowerCase().trim();

  // Load posts from the "blog" collection
  const all = await getCollection('blog');

  // Filter by title (case-insensitive). If q is empty, return latest 10.
  const filtered = (q
    ? all.filter((p) => (p.data?.title || '').toLowerCase().includes(q))
    : all
  )
    .sort((a, b) => new Date(b.data.pubDate) - new Date(a.data.pubDate))
    .slice(0, 10)
    .map((p) => ({
      title: p.data?.title ?? 'Untitled',
      slug: p.slug,
      pubDate: p.data?.pubDate ?? null,
    }));

  return new Response(JSON.stringify(filtered), {
    headers: { 'Content-Type': 'application/json' }
  });
}
