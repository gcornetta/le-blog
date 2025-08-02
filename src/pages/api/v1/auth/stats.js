// src/pages/api/v1/auth/stats.js
// This is a protected API endpoint to demonstrate the dashboard's functionality.
// It must be accessed with a valid JWT.

import { db, Admins, FailedLogins } from 'astro:db';
import { count } from 'astro:db';
import { verifyToken, SESSION_COOKIE_NAME } from '../../../../utils/auth/auth.js';

export async function GET({ cookies }) {
  // Get the session token from the cookie
  const token = cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized: No token provided' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Verify the JWT token
  const payload = await verifyToken(token);

  if (!payload) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get some dummy stats from the database to show authenticated access
  try {
    const adminCount = await db.select({ count: count() }).from(Admins);
    const failedLoginCount = await db.select({ count: count() }).from(FailedLogins);

    const stats = {
      message: `Welcome, admin! You are authenticated.`,
      adminCount: adminCount[0]?.count || 0,
      failedLoginCount: failedLoginCount[0]?.count || 0,
      lastLogin: new Date().toISOString(), // Example dynamic data
    };

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Failed to retrieve dashboard stats:', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}