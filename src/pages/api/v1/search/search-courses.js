// src/pages/api/v1/search-courses.js
import { db, Courses, sql } from 'astro:db';

export async function GET({ url }) {
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();

  const rows = q
    ? await db
        .select()
        .from(Courses)
        .where(sql`LOWER(${Courses.title}) LIKE ${'%' + q + '%'}`)
        .limit(20)
    : await db
        .select()
        .from(Courses)
        .limit(20);

  return new Response(JSON.stringify(rows), {
    headers: { 'Content-Type': 'application/json' }
  });
}
