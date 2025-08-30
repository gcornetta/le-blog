// src/pages/api/v1/posts/most-read.js
import { db, PostStats } from "astro:db";

/**
 * Get most read posts
 * GET /api/v1/posts/most-read?limit=5
 */
export async function GET({ url }) {
  try {
    const limit = parseInt(url.searchParams.get("limit") || "5", 10);

    const rows = await db
      .select()
      .from(PostStats)
      .orderBy("views", "desc")
      .limit(limit);

    return new Response(JSON.stringify(rows), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
