// src/pages/rss.xml.js
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';  // or however you load your posts

export async function GET({ site }) {
  const posts = await getCollection('blog');     // adjust to your content source

  return rss({
    title: 'My Blog',                             // ← required
    description: 'All the latest posts from me',  // ← required
    site,                                         // ← pulls from astro.config
    items: posts.map(post => ({
      title:   post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.excerpt,
      link:    `/blog/${post.slug}/`,
    })),
    // you can add other options like `customData`, `trailingSlash`, etc.
  });
}
