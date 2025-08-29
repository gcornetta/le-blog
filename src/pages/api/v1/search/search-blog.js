// src/pages/api/v1/search/blog.js
import { getCollection } from 'astro:content';

export async function GET({ url }) {
  const q = (url.searchParams.get('q') || '').toLowerCase().trim();
  if (!q) {
    return new Response('[]', { headers: { 'Content-Type': 'application/json' } });
  }

  const all = await getCollection('blog');
  const filtered = all
    .filter(p => (p.data?.title || '').toLowerCase().includes(q))
    .sort((a,b)=> new Date(b.data.pubDate) - new Date(a.data.pubDate))
    .slice(0, 10)
    .map(p => ({ title: p.data?.title ?? 'Untitled', slug: p.slug, pubDate: p.data?.pubDate ?? null }));

  return new Response(JSON.stringify(filtered), { headers: { 'Content-Type': 'application/json' } });
}
