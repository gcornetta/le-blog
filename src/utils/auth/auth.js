// src/utils/auth/auth.js
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db, Admins, FailedLogins } from 'astro:db';
import { eq, gte, or, and } from 'astro:db';
import { SignJWT, jwtVerify, base64url } from 'jose';

export const SESSION_COOKIE_NAME = 'auth_session';

// Security configuration
const MAX_FAILED_ATTEMPTS_BY_IP = 5; // New: More specific rate limiting for IPs
const MAX_FAILED_ATTEMPTS_BY_EMAIL = 3; // New: Account-specific rate limiting
const LOCKOUT_MINUTES = 30;
const JWT_ALGORITHM = 'HS256';
const JWT_ISSUER = 'urn:blog-admin';
const JWT_AUDIENCE = 'urn:blog-admin';
// Hardcoded dummy hash for timing attacks. This must be a valid bcrypt hash.
const DUMMY_HASH = '$2a$10$abcdefghijklmnopqrstuvwxABCDEFGHIJKLMNOPQRSTUVWXYZ123456'; 

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

/**
 * A centralized function for logging security-relevant events.
 * This can be easily extended to push logs to an external service like Sentry or Datadog.
 * @param {string} type - The type of event (e.g., 'login_failed', 'login_success', 'account_locked').
 * @param {object} details - A JSON object with relevant details.
 */
function logSecurityEvent(type, details) {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({ timestamp, type, ...details }));
}

async function recordFailedLogin(email, ip) {
  try {
    await db.insert(FailedLogins).values([{ email, ip }]);
    logSecurityEvent('login_failed', { email, ip });
  } catch (err) {
    console.error('FAILED to record login attempt:', err);
  }
}

async function clearFailedLogins(email, ip) {
  try {
    await db.delete(FailedLogins).where(
      or(eq(FailedLogins.email, email), eq(FailedLogins.ip, ip))
    );
    logSecurityEvent('failed_attempts_cleared', { email, ip });
  } catch (err) {
    console.error('FAILED to clear failed login attempts:', err);
  }
}

export async function authenticateAdmin(email, password, ip) {
  const lockoutTime = new Date(Date.now() - LOCKOUT_MINUTES * 60 * 1000);

  // Hybrid Rate Limiting: Check by IP and by Email
  // Check for too many failed attempts from this IP
  const recentByIp = await db.select()
    .from(FailedLogins)
    .where(and(
      eq(FailedLogins.ip, ip),
      gte(FailedLogins.attempt_time, lockoutTime)
    ));
  if (recentByIp.length >= MAX_FAILED_ATTEMPTS_BY_IP) {
    logSecurityEvent('account_locked_ip', { ip });
    throw new Error('Too many failed attempts. Try again later.');
  }

  // Check for too many failed attempts on this specific email
  const recentByEmail = await db.select()
    .from(FailedLogins)
    .where(and(
      eq(FailedLogins.email, email),
      gte(FailedLogins.attempt_time, lockoutTime)
    ));
  if (recentByEmail.length >= MAX_FAILED_ATTEMPTS_BY_EMAIL) {
    logSecurityEvent('account_locked_email', { email });
    throw new Error('Account temporarily locked due to too many failed attempts');
  }

  // Lookup admin
  const [admin] = await db.select()
    .from(Admins)
    .where(eq(Admins.email, email))
    .limit(1);

  // Time-Constant Authentication: Use a dummy hash if the user is not found
  let passwordMatch = false;
  if (admin) {
    passwordMatch = await bcrypt.compare(password, admin.password_hash);
  } else {
    // This is the mitigation for timing attacks.
    // A dummy hash is compared to a dummy password to ensure the operation takes a consistent amount of time.
    await bcrypt.compare('dummy-password', DUMMY_HASH);
  }
  
  if (!admin || !passwordMatch) {
    // Record the failed attempt with the email if we know it, or null if the email was not found.
    await recordFailedLogin(admin ? email : null, ip); 
    throw new Error('Invalid credentials');
  }

  // Clear failed attempts (by email or IP) since login was successful
  await clearFailedLogins(email, ip);

  // Create JWT
  const token = await createSessionToken({
    id: admin.id,
    email: admin.email,
  });

  logSecurityEvent('login_success', { id: admin.id, email, ip });

  return { token, admin };
}

// ... (other functions remain the same) ...

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

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, jwtSecret, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    return payload;
  } catch (err) {
    logSecurityEvent('jwt_verification_failed', { error: err.message });
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