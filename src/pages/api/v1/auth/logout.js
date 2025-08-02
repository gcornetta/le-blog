// src/pages/api/v1/auth/logout.js
// This API endpoint handles admin logout by clearing the session cookie.

import { SESSION_COOKIE_NAME } from '../../../../utils/auth/auth.js';

export async function POST({ cookies }) {
  // Clear the session cookie
  cookies.delete(SESSION_COOKIE_NAME, { path: '/' });

  return new Response(JSON.stringify({ message: 'Logout successful' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}