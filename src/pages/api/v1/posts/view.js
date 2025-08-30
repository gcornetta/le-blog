// src/pages/api/v1/posts/view.js
import { db, PostStats } from "astro:db";

/**
 * Increment post view count
 * POST /api/v1/posts/view
 * Body: { slug: "my-post-slug" }
 */
export async function POST({ request }) {
  try {
    const { slug } = await request.json();
    if (!slug) {
      return new Response(JSON.stringify({ error: "Missing slug" }), { status: 400 });
    }

    // Insert or update stats
    await db.run(
      `INSERT INTO post_stats (slug, views, last_viewed_at)
       VALUES (?, 1, CURRENT_TIMESTAMP)
       ON CONFLICT(slug) DO UPDATE SET
         views = views + 1,
         last_viewed_at = CURRENT_TIMESTAMP`,
      [slug]
    );

    // Return updated row
    const rows = await db.select().from(PostStats).where("slug", "=", slug).limit(1);
    const stat = rows[0] ?? { slug, views: 1 };

    return new Response(JSON.stringify(stat), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
