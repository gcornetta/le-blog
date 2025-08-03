// src/utils/auth/auth.js
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db, Admins, FailedLogins } from 'astro:db';
import { eq, gte, or, and } from 'astro:db';
import { SignJWT, jwtVerify, base64url } from 'jose';

export const SESSION_COOKIE_NAME = 'auth_session';

// Security configuration
const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_MINUTES = 30;
const JWT_ALGORITHM = 'HS256';
const JWT_ISSUER = 'urn:blog-admin';
const JWT_AUDIENCE = 'urn:blog-admin';

// Initialize JWT secret (try base64url decode, fallback to raw UTF-8)
let jwtSecret;
try {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) throw new Error('Missing JWT_SECRET');

  try {
    jwtSecret = base64url.decode(secretKey);
  } catch {
    jwtSecret = new TextEncoder().encode(secretKey);
  }
} catch (err) {
  throw new Error(`JWT config error: ${err.message}`);
}

async function recordFailedLogin(email, ip) {
  await db.insert(FailedLogins).values([{ email, ip }]);
}

async function clearFailedLogins(email, ip) {
  await db.delete(FailedLogins).where(
    or(eq(FailedLogins.email, email), eq(FailedLogins.ip, ip))
  );
}

export async function authenticateAdmin(email, password, ip) {
  // Rate limiting by IP
  const recentByIp = await db.select()
    .from(FailedLogins)
    .where(and(
      eq(FailedLogins.ip, ip),
      gte(FailedLogins.attempt_time, new Date(Date.now() - LOCKOUT_MINUTES * 60 * 1000))
    ));
  if (recentByIp.length >= MAX_FAILED_ATTEMPTS) {
    throw new Error('Too many failed attempts. Try again later.');
  }

  // Lookup admin
  const [admin] = await db.select()
    .from(Admins)
    .where(eq(Admins.email, email))
    .limit(1);
  if (!admin) {
    await recordFailedLogin(null, ip);
    throw new Error('Invalid credentials');
  }

  // Password verify
  const passwordMatch = await bcrypt.compare(password, admin.password_hash);
  if (!passwordMatch) {
    await recordFailedLogin(email, ip);
    throw new Error('Invalid credentials');
  }

  // Clear failed attempts (by email or IP)
  await clearFailedLogins(email, ip);

  // Create JWT
  const token = await createSessionToken({
    id: admin.id,
    email: admin.email,
  });

  return { token, admin };
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, jwtSecret, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    return payload;
  } catch (err) {
    console.error('JWT Error:', err.message);
    throw new Error('Invalid token');
  }
}

export async function checkAuthStatus(request) {
  const token = getTokenFromRequest(request);
  if (!token) return { isAuthenticated: false };
  try {
    const payload = await verifyToken(token);
    return { isAuthenticated: true, admin: payload };
  } catch {
    return { isAuthenticated: false };
  }
}

function getTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader
        .split(';')
        .map(c => c.trim().split('='))
        .filter(([k, v]) => k && v)
    );
    return cookies[SESSION_COOKIE_NAME];
  }
  return null;
}

async function createSessionToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN || '2h')
    .setSubject(payload.id.toString())
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .sign(jwtSecret);
}
