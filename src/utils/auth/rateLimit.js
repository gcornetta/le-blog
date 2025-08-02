// src/utils/auth/rateLimit.js
// This module handles rate limiting for failed login attempts using Astro DB.

import { db, FailedLogins } from 'astro:db';
import { eq, count, sql } from 'astro:db';

const MAX_FAILED_ATTEMPTS = 3;

/**
 * Records a failed login attempt for an email and IP address.
 * @param {string} email - The email address.
 * @param {string} ip - The IP address of the request.
 * @returns {Promise<void>}
 */
export async function recordFailedLogin(email, ip) {
  await db.insert(FailedLogins).values({
    email,
    ip,
    attempt_time: new Date(),
  });
}

/**
 * Gets the number of recent failed login attempts for a given email.
 * This function counts attempts within the last 15 minutes.
 * @param {string} email - The email address.
 * @returns {Promise<number>} The number of failed attempts.
 */
export async function getFailedLoginAttempts(email) {
  const cutoffTime = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes ago
  const result = await db.select({ count: count() }).from(FailedLogins).where(
    sql`${FailedLogins.email} = ${email} AND ${FailedLogins.attempt_time} > ${cutoffTime}`
  );
  return result[0]?.count || 0;
}

/**
 * Clears failed login attempts for a given email.
 * @param {string} email - The email address.
 * @returns {Promise<void>}
 */
export async function clearFailedLogins(email) {
  await db.delete(FailedLogins).where(eq(FailedLogins.email, email));
}