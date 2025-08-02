// src/utils/auth/password.js
// This module provides a simple wrapper for bcrypt.compare.

import bcrypt from 'bcryptjs';

/**
 * Compares a plain-text password to a bcrypt hash.
 * @param {string} password - The plain-text password.
 * @param {string} hash - The bcrypt hash to compare against.
 * @returns {Promise<boolean>} A promise that resolves to true if the passwords match, false otherwise.
 */
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}