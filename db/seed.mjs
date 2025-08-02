// https://astro.build/db/seed

import 'dotenv/config';
import { db, Admins } from 'astro:db';

export default async function seed() {
  const email = process.env.ADMIN_EMAIL;
  const password_hash = process.env.ADMIN_PASSWORD_HASH;

  console.log("🔵 Seed script started...");

  if (!email) {
    console.log('ADMIN_EMAIL not set; skipping admin bootstrap.');
    return;
  }
  if (!password_hash) {
    console.log('ADMIN_PASSWORD_HASH not set; skipping admin bootstrap.');
    return;
  }

  // Optionally rudimentary sanity check that it looks like a bcrypt hash
  if (!password_hash.startsWith('$2')) {
    console.warn('Warning: ADMIN_PASSWORD_HASH does not look like a bcrypt hash.');
  }

  // Check if admin already exists
  const existing = await db.select().from(Admins).where('email', '=', email);
  if (existing.length > 0) {
    console.log(`Admin ${email} already exists; skipping creation.`);
    return;
  }

  // Insert the admin with the provided hashed password
  await db.insert(Admins).values([
		{
			id: 1, 
    		email,
    		password_hash,
  		}
	]);
  console.log('Bootstrapped admin:', email);
}
