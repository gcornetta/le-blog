// https://astro.build/db/seed.mjs

import 'dotenv/config';
import { db, Admins, Users, Courses, Engagement } from 'astro:db';
import { faker } from '@faker-js/faker';

export default async function seed() {
  console.log("🔵 Seed script started...");

  // --- Admin User Seeding ---
  const email = process.env.ADMIN_EMAIL;
  const password_hash = process.env.ADMIN_PASSWORD_HASH;

  if (!email || !password_hash) {
    console.log('ADMIN_EMAIL or ADMIN_PASSWORD_HASH not set; skipping admin bootstrap.');
  } else {
    if (!password_hash.startsWith('$2')) {
      console.warn('Warning: ADMIN_PASSWORD_HASH does not look like a bcrypt hash.');
    }
    const existingAdmin = await db.select().from(Admins).where('email', '=', email);
    if (existingAdmin.length > 0) {
      console.log(`Admin ${email} already exists; skipping creation.`);
    } else {
      await db.insert(Admins).values([
        {
          id: 1, 
          email,
          password_hash,
        }
      ]);
      console.log('Bootstrapped admin:', email);
    }
  }

  // --- Student User Seeding ---
  console.log("Seeding student users...");
  const usersToInsert = [];
  const existingUsers = await db.select().from(Users);
  
  if (existingUsers.length < 10) {
    const numToCreate = 10 - existingUsers.length;
    for (let i = 0; i < numToCreate; i++) {
      usersToInsert.push({
        name: faker.person.fullName(),
        email: faker.internet.email({ domain: 'usp.ceu.es' }),
        registration_date: faker.date.past({ years: 1 }),
        last_activity: faker.date.recent({ days: 30 }),
      });
    }
    
    if (usersToInsert.length > 0) {
      await db.insert(Users).values(usersToInsert);
      console.log(`Successfully seeded ${usersToInsert.length} new student users.`);
    } else {
      console.log('User table already contains 10 or more users; skipping student user seeding.');
    }
  } else {
    console.log('User table already contains 10 or more users; skipping student user seeding.');
  }

  // --- Course Seeding ---
  console.log("Seeding courses...");
  const existingCourses = await db.select().from(Courses);
  if (existingCourses.length === 0) {
    await db.insert(Courses).values([
      { id: 1, title: 'Circuit Theory', description: 'Understand the fundamentals of electric circuits.', created_at: faker.date.past({ months: 6 }) },
      { id: 2, title: 'Digital Electronics', description: 'Dive into logic gates, flip-flops, finite state machines.', created_at: faker.date.past({ months: 4 }) },
      { id: 3, title: 'Analog Electronics', description: 'Explore MOSFETs, opamps, and amplifiers.', created_at: faker.date.past({ months: 2 }) },
    ]);
    console.log("Successfully seeded 3 courses.");
  } else {
    console.log("Courses already exist; skipping course seeding.");
  }

  // --- Engagement Seeding ---
  console.log("Seeding engagement data...");
  const allUsers = await db.select().from(Users);
  const allCourses = await db.select().from(Courses);
  const engagementTypes = ['video_watch', 'material_download', 'quiz_completion'];

  // Seed some random engagement data for each user
  for (const user of allUsers) {
    for (let i = 0; i < faker.number.int({ min: 5, max: 20 }); i++) {
      const type = faker.helpers.arrayElement(engagementTypes);
      const contentId = faker.helpers.arrayElement([
        faker.string.alphanumeric(11), // Fake YouTube video ID
        `course-material-${faker.string.uuid()}.pdf`, // Fake material filename
        `quiz-${faker.string.uuid()}`, // Fake quiz ID
      ]);
      const metric = type === 'video_watch' 
        ? faker.number.int({ min: 10, max: 600 }) // Watch time in seconds
        : type === 'material_download'
        ? 1 // Download count
        : faker.number.int({ min: 0, max: 100 }); // Quiz score
      
      await db.insert(Engagement).values({
        user_id: user.id,
        type,
        content_id: contentId,
        metric,
        timestamp: faker.date.recent({ days: 30 }),
      });
    }
  }
  console.log("Successfully seeded engagement data for users.");

  console.log("✅ Seed script finished.");
}