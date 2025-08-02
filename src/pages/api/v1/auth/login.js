// src/pages/api/v1/auth/login.js
import { authenticateAdmin } from '../../../../src/utils/auth/auth.js'; // adjust if your folder layout differs
import { SESSION_COOKIE_NAME } from '../../../../src/utils/auth/auth.js';

/**
 * Parse duration strings like "2h", "30m", "45s" into seconds.
 */
function parseDurationToSeconds(str, defaultSeconds) {
  if (typeof str !== 'string') return defaultSeconds;
  const m = str.match(/^(\d+)([smh])$/);
  if (!m) return defaultSeconds;
  const val = parseInt(m[1], 10);
  const unit = m[2];
  switch (unit) {
    case 's':
      return val;
    case 'm':
      return val * 60;
    case 'h':
      return val * 60 * 60;
    default:
      return defaultSeconds;
  }
}

export async function POST({ request, cookies }) {
  try {
    const { email, password } = await request.json();
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('fastly-client-ip') ||
      'unknown';

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let result;
    try {
      result = await authenticateAdmin(email, password, ip);
    } catch (err) {
      const msg = (err.message || '').toLowerCase();
      if (msg.includes('too many failed')) {
        return new Response(
          JSON.stringify({
            error: 'Account temporarily locked due to too many failed attempts',
          }),
          {
            status: 429,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { token } = result;

    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '2h';
    const maxAge = parseDurationToSeconds(jwtExpiresIn, 2 * 60 * 60); // fallback 2h

    cookies.set(SESSION_COOKIE_NAME, token, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'strict',
      maxAge,
    });

    return new Response(JSON.stringify({ message: 'Login successful' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
