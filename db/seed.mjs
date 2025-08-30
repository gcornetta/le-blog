// https://astro.build/db/seed.mjs

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

import { db, Admins, Users, Courses, Engagement, FeaturedCourses, FeaturedVideo, LatestVideos, PostStats } from 'astro:db';
import { faker } from '@faker-js/faker';


const BLOG_DIR = path.resolve(process.cwd(), 'src/content/blog');
const MARKDOWN_RX = /\.(md|mdx|mdoc)$/i;

function readFrontmatter(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(src);
  return data || {};
}

function discoverBlogEntries(dir = BLOG_DIR) {
  if (!fs.existsSync(dir)) return [];

  const out = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // index.* inside a folder → slug = folder name
      const indexName = ['index.md', 'index.mdx', 'index.mdoc'].find(n =>
        fs.existsSync(path.join(full, n))
      );
      if (indexName) {
        const fm = readFrontmatter(path.join(full, indexName));
        out.push({ slug: entry.name, data: fm });
      } else {
        // recurse (allows nested dirs if you ever use them)
        out.push(...discoverBlogEntries(full));
      }
      continue;
    }

    if (MARKDOWN_RX.test(entry.name)) {
      // single file → slug = filename (no extension)
      const fm = readFrontmatter(full);
      const slug = path.basename(entry.name, path.extname(entry.name));
      out.push({ slug, data: fm });
    }
  }

  return out;
}


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
  // Clear existing users to ensure a clean slate and all users have the correct domain.
  await db.delete(Users);
  console.log("Existing student users cleared.");

  const usersToInsert = [];
  const numToCreate = 10;
  for (let i = 0; i < numToCreate; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const fullName = `${firstName} ${lastName}`;
    const emailName = faker.helpers.slugify(`${firstName}.${lastName}`).toLowerCase();

    usersToInsert.push({
      name: fullName,
      email: `${emailName}@usp.ceu.es`,
      registration_date: faker.date.past({ years: 1 }),
      last_activity: faker.date.recent({ days: 30 }),
    });
  }

  if (usersToInsert.length > 0) {
    await db.insert(Users).values(usersToInsert);
    console.log(`Successfully seeded ${usersToInsert.length} new student users with domain 'usp.ceu.es'.`);
  } else {
    console.log('No new student users to seed.');
  }

  // --- Course Seeding ---
  console.log("Seeding courses...");
  const existingCourses = await db.select().from(Courses);
  if (existingCourses.length === 0) {
    await db.insert(Courses).values([
      { id: 1, title: 'Circuit Theory', description: 'Understand the fundamentals of electric circuits.', created_at: faker.date.past({ months: 6 }) },
      { id: 2, title: 'Digital Electronics', description: 'Dive into logic gates, flip-flops, finite state machines.', created_at: faker.date.past({ months: 4 }) },
      { id: 3, title: 'Analog Electronics', description: 'Explore MOSFETs, opamps, and amplifiers.', created_at: faker.date.past({ months: 2 }) },
      { id: 4, title: 'RF & Microwave Electronics', description: 'Analyze high-frequency circuit design principles.', created_at: faker.date.past({ months: 3 }) },
    ]);
    console.log("Successfully seeded 4 courses.");
  } else {
    console.log("Courses already exist; skipping course seeding.");
  }

  // --- Featured Courses Seeding ---
  console.log("Seeding featured courses...");
  await db.delete(FeaturedCourses);

  const courseByTitle = {};
  const allCourses = await db.select().from(Courses);
  for (const c of allCourses) courseByTitle[c.title] = c.id;

  const featuredPayload = [
    {
      id: 1,
      course_id: courseByTitle['Circuit Theory'] ?? null,
      title: 'Circuit Theory',
      level: 'beginner',
      instructor: 'Dr. Gianluca Cornetta',
      rating: 4.5,
      excerpt: 'Understand the fundamentals of electric circuits, including Ohm’s law, Kirchhoff’s rules, and basic network theorems.',
      image: '/images/courses/circuit-theory.jpg',
      featured_order: 1,
    },
    {
      id: 2,
      course_id: courseByTitle['Digital Electronics'] ?? null,
      title: 'Digital Electronics',
      level: 'intermediate',
      instructor: 'Dr. Gianluca Cornetta',
      rating: 4.2,
      excerpt: 'Dive into logic gates, flip-flops, finite state machines and the design of combinational and sequential circuits.',
      image: '/images/courses/digital-electronics.jpg',
      featured_order: 2,
    },
    {
      id: 3,
      course_id: courseByTitle['Analog Electronics'] ?? null,
      title: 'Analog Electronics',
      level: 'intermediate',
      instructor: 'Dr. Gianluca Cornetta',
      rating: 4.8,
      excerpt: 'Explore MOSFETs, opamps, and amplifiers in the context of analog circuit design and signal conditioning.',
      image: '/images/courses/analog-electronics.jpg',
      featured_order: 3,
    },
    {
      id: 4,
      course_id: courseByTitle['RF & Microwave Electronics'] ?? null,
      title: 'RF & Microwave Electronics',
      level: 'advanced',
      instructor: 'Dr. Gianluca Cornetta',
      rating: 4.7,
      excerpt: 'Analyze high-frequency circuit design principles, including transmission lines, S-parameters, and impedance matching.',
      image: '/images/courses/rf-microwave.jpg',
      featured_order: 4,
    },
  ];

  await db.insert(FeaturedCourses).values(featuredPayload);
  console.log("Successfully seeded featured courses.");

  // --- Engagement Seeding ---
  console.log("Seeding engagement data...");
  const allUsers = await db.select().from(Users);
  const engagementTypes = ['video_watch', 'material_download', 'quiz_completion'];

  for (const user of allUsers) {
    for (let i = 0; i < faker.number.int({ min: 5, max: 20 }); i++) {
      const type = faker.helpers.arrayElement(engagementTypes);
      const contentId = faker.helpers.arrayElement([
        faker.string.alphanumeric(11),
        `course-material-${faker.string.uuid()}.pdf`,
        `quiz-${faker.string.uuid()}`,
      ]);
      const metric = type === 'video_watch'
        ? faker.number.int({ min: 10, max: 600 })
        : type === 'material_download'
        ? 1
        : faker.number.int({ min: 0, max: 100 });

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

  // --- Featured Video ---
  console.log("Seeding featured video…");
  await db.delete(FeaturedVideo);
  await db.insert(FeaturedVideo).values([
    {
      id: 1,
      title: "Understanding GFET Design",
      description:
        "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.",
      youtubeId: "bTqVqk7FSmY",
    },
  ]);
  console.log("Featured video seeded.");

  // --- Latest Videos ---
  console.log("Seeding latest videos…");
  await db.delete(LatestVideos);
  await db.insert(LatestVideos).values([
    {
      id: 1,
      title: "GFET Layout Optimization",
      thumbnail: "layout-opt",
      youtubeId: "bTqVqk7FSmY",
      duration: "12:34",
      date: new Date("2025-07-20"),
    },
    {
      id: 2,
      title: "Compact Model Extraction",
      thumbnail: "compact-model",
      youtubeId: "bTqVqk7FSmY",
      duration: "9:02",
      date: new Date("2025-07-18"),
    },
    {
      id: 3,
      title: "AI-assisted Circuit Design",
      thumbnail: "ai-circuit",
      youtubeId: "bTqVqk7FSmY",
      duration: "14:58",
      date: new Date("2025-07-15"),
    },
    {
      id: 4,
      title: "Charge Pump Simulation",
      thumbnail: "charge-pump",
      youtubeId: "bTqVqk7FSmY",
      duration: "11:21",
      date: new Date("2025-07-14"),
    },
    {
      id: 5,
      title: "Intro to Metasurface Design",
      thumbnail: "metasurface",
      youtubeId: "bTqVqk7FSmY",
      duration: "13:45",
      date: new Date("2025-07-13"),
    },
    {
      id: 6,
      title: "Rectenna Matching Networks",
      thumbnail: "rectenna",
      youtubeId: "bTqVqk7FSmY",
      duration: "10:50",
      date: new Date("2025-07-11"),
    },
    {
      id: 7,
      title: "ML for GFET Optimization",
      thumbnail: "ml-optimization",
      youtubeId: "bTqVqk7FSmY",
      duration: "15:12",
      date: new Date("2025-07-09"),
    },
    {
      id: 8,
      title: "DRC and LVS Basics",
      thumbnail: "drc-lvs",
      youtubeId: "bTqVqk7FSmY",
      duration: "8:59",
      date: new Date("2025-07-07"),
    },
    {
      id: 9,
      title: "GFET Layout from Scratch",
      thumbnail: "layout-from-scratch",
      youtubeId: "bTqVqk7FSmY",
      duration: "16:04",
      date: new Date("2025-07-05"),
    },
    {
      id: 10,
      title: "Capacitor Modeling Deep Dive",
      thumbnail: "capacitor-model",
      youtubeId: "bTqVqk7FSmY",
      duration: "10:30",
      date: new Date("2025-07-03"),
    },
    {
      id: 11,
      title: "Energy Scavenging Circuits",
      thumbnail: "energy-scavenging",
      youtubeId: "bTqVqk7FSmY",
      duration: "14:11",
      date: new Date("2025-07-01"),
    },
    {
      id: 12,
      title: "Graphene Bandgap Engineering",
      thumbnail: "graphene-bandgap",
      youtubeId: "bTqVqk7FSmY",
      duration: "9:47",
      date: new Date("2025-06-28"),
    },
  ]);
  console.log("Latest videos seeded.");

// --- PostStats Seeding (from filesystem; no astro:content) ---
console.log("Seeding post view statistics (PostStats)…");

// Clear existing stats for deterministic dev seeding
await db.delete(PostStats);

const rawPosts = discoverBlogEntries(); // [{ slug, data }, …]
if (rawPosts.length === 0) {
  console.log('No blog entries found in src/content/blog; skipping PostStats seeding.');
} else {
  // Align draft filtering with your page logic:
  const includeDrafts = !process.env.NODE_ENV || process.env.NODE_ENV !== 'production';
  const posts = rawPosts.filter(p => (includeDrafts ? true : !p.data?.draft));

  const rows = posts.map(p => {
    const isMain = (p.data?.main === true || p.data?.main === 'true');
    const base = Math.floor(Math.random() * (800 - 20 + 1)) + 20; // 20–800
    const boost = isMain ? (1.6 + Math.random() * 0.9) : 1;      // 1.6–2.5
    const noise = Math.floor(Math.random() * 36) - 15;           // -15..+20
    const views = Math.max(0, Math.min(5000, Math.round(base * boost + noise)));

    // more recent for popular posts (roughly)
    const daysBack = Math.max(1, Math.round(30 - Math.min(views / 50, 25))); // 1..30
    const last_viewed_at = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    return { slug: p.slug, views, last_viewed_at };
  });

  if (rows.length > 0) {
    await db.insert(PostStats).values(rows);
    console.log(`Seeded PostStats for ${rows.length} posts.`);
  } else {
    console.log('All posts filtered out; no PostStats seeded.');
  }
}


  console.log("✅ Seed script finished.");
}
