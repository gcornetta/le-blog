// https://astro.build/db/seed.mjs

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

import { db, Admins, Users, Courses, Engagement, Videos, PostStats, CourseMeta, CourseOutcomes, CourseModules, CourseVideos, ModuleVideos, PostVideos, eq } from 'astro:db';
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
    const existingAdmin = await db.select().from(Admins).where(eq(Admins.email, email));
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

  // --- Course Seeding (enriched; all featured) ---
console.log("Seeding courses...");
const existingCourses = await db.select().from(Courses);

const COURSE_ROWS = [
  {
    id: 1,
    slug: 'circuit-theory',
    title: 'Circuit Theory',
    description: 'Understand the fundamentals of electric circuits.',
    level: 'beginner',
    instructor: 'Dr. Gianluca Cornetta',
    avatar: '/images/authors/gcornetta.png',
    rating: 4.5,
    excerpt: 'Understand the fundamentals of electric circuits, including Ohm’s law, Kirchhoff’s rules, and basic network theorems.',
    image: '/images/courses/circuit-theory.jpg',
    featured: true,
    featured_order: 1,
    created_at: faker.date.past({ months: 6 }),
  },
  {
    id: 2,
    slug: 'digital-electronics',
    title: 'Digital Electronics',
    description: 'Dive into logic gates, flip-flops, finite state machines.',
    level: 'intermediate',
    instructor: 'Dr. Gianluca Cornetta',
    avatar: '/images/authors/gcornetta.png',
    rating: 4.2,
    excerpt: 'Dive into logic gates, flip-flops, finite state machines and the design of combinational and sequential circuits.',
    image: '/images/courses/digital-electronics.jpg',
    featured: true,
    featured_order: 2,
    created_at: faker.date.past({ months: 4 }),
  },
  {
    id: 3,
    slug: 'analog-electronics',
    title: 'Analog Electronics',
    description: 'Explore MOSFETs, opamps, and amplifiers.',
    level: 'intermediate',
    instructor: 'Dr. Gianluca Cornetta',
     avatar: '/images/authors/gcornetta.png',
    rating: 4.8,
    excerpt: 'Explore MOSFETs, opamps, and amplifiers in the context of analog circuit design and signal conditioning.',
    image: '/images/courses/analog-electronics.jpg',
    featured: true,
    featured_order: 3,
    created_at: faker.date.past({ months: 2 }),
  },
  {
    id: 4,
    slug: 'rf-and-microwave-electronics',
    title: 'RF & Microwave Electronics',
    description: 'Analyze high-frequency circuit design principles.',
    level: 'advanced',
    instructor: 'Dr. Gianluca Cornetta',
    avatar: '/images/authors/gcornetta.png',
    rating: 4.7,
    excerpt: 'Analyze high-frequency circuit design principles, including transmission lines, S-parameters, and impedance matching.',
    image: '/images/courses/rf-microwave.jpg',
    featured: true,
    featured_order: 4,
    created_at: faker.date.past({ months: 3 }),
  },
];

if (existingCourses.length === 0) {
  await db.insert(Courses).values(COURSE_ROWS);
  console.log("Inserted base courses.");
} else {
  console.log("Courses exist; updating/enriching…");
  for (const row of COURSE_ROWS) {
    await db.update(Courses).set({
      slug: row.slug,
      level: row.level,
      instructor: row.instructor,
      avatar: row.avatar,
      rating: row.rating,
      excerpt: row.excerpt,
      image: row.image,
      featured: true,
      featured_order: row.featured_order,
    }).where(eq(Courses.title, row.title));
  }
}

// Build lookup (slug -> id)
const allCourses = await db.select().from(Courses);
const CID = Object.fromEntries(allCourses.map(c => [c.slug, c.id]));

// --- CourseMeta Seeding ---
console.log("Seeding course meta…");
await db.delete(CourseMeta); // idempotent dev seeding

const META = {
  'circuit-theory': {
    hero_image: '/images/courses/hero-circuit-theory.jpg',
    badge: 'Core',
    duration_hours: 18,
    lessons_count: 14,
    projects_count: 6,
    quizzes_count: 8,
    students_count: 5120,
    cta_primary_href: '/signup?course=circuit-theory',
    cta_primary_label: 'Start learning',
    cta_secondary_href: '/syllabus/circuit-theory',
    cta_secondary_label: 'View syllabus',
  },
  'digital-electronics': {
    hero_image: '/images/courses/hero-digital-electronics.jpg',
    badge: 'Updated',
    duration_hours: 20,
    lessons_count: 16,
    projects_count: 7,
    quizzes_count: 10,
    students_count: 4380,
    cta_primary_href: '/signup?course=digital-electronics',
    cta_primary_label: 'Start learning',
    cta_secondary_href: '/syllabus/digital-electronics',
    cta_secondary_label: 'View syllabus',
  },
  'analog-electronics': {
    hero_image: '/images/courses/hero-analog-electronics.jpg',
    badge: 'New',
    duration_hours: 24,
    lessons_count: 18,
    projects_count: 8,
    quizzes_count: 10,
    students_count: 3290,
    cta_primary_href: '/signup?course=analog-electronics',
    cta_primary_label: 'Start learning',
    cta_secondary_href: '/syllabus/analog-electronics',
    cta_secondary_label: 'View syllabus',
  },
  'rf-and-microwave-electronics': {
    hero_image: '/images/courses/hero-rf-microwave.jpg',
    badge: 'Advanced',
    duration_hours: 26,
    lessons_count: 17,
    projects_count: 6,
    quizzes_count: 9,
    students_count: 2210,
    cta_primary_href: '/signup?course=rf-and-microwave-electronics',
    cta_primary_label: 'Start learning',
    cta_secondary_href: '/syllabus/rf-and-microwave-electronics',
    cta_secondary_label: 'View syllabus',
  },
};

await db.insert(CourseMeta).values(
  Object.entries(META).map(([slug, m]) => ({
    course_id: CID[slug],
    ...m,
  }))
);

// --- Outcomes (“What you’ll learn”) ---
console.log("Seeding course outcomes…");
await db.delete(CourseOutcomes);

const OUTCOMES = {
  'circuit-theory': [
    "Apply KCL/KVL and Ohm’s law to analyze DC/AC circuits",
    "Use Thevenin/Norton to simplify networks",
    "Solve first-/second-order transients (RC/RL/RLC)",
    "Master phasors, impedance, and power in sinusoidal steady state",
  ],
  'digital-electronics': [
    "Design combinational circuits with Boolean algebra & K-maps",
    "Build synchronous systems with FFs, counters, and registers",
    "Model Moore/Mealy FSMs and reason about timing",
    "Complete a tiny HDL-based mini-project (optional)",
  ],
  'analog-electronics': [
    "Bias and analyze BJT/MOSFET stages (small-signal)",
    "Design common source/emitter & follower amplifiers",
    "Understand gain-bandwidth limits & Miller effect",
    "Use op-amps in linear applications and active filters",
  ],
  'rf-and-microwave-electronics': [
    "Model transmission lines, reflections, and standing waves",
    "Use the Smith Chart for matching/visualization",
    "Work with S-parameters and basic RF measurements",
    "Understand LNA design trade-offs and noise basics",
  ],
};

const outcomeRows = [];
for (const [slug, arr] of Object.entries(OUTCOMES)) {
  arr.forEach((text, i) => {
    outcomeRows.push({ course_id: CID[slug], order_index: i + 1, text });
  });
}
await db.insert(CourseOutcomes).values(outcomeRows);

// --- Modules (Syllabus preview) ---
console.log("Seeding course modules…");
await db.delete(CourseModules);

const MODULES = {
  'circuit-theory': [
    { n: 1, title: "Units, signals, and circuit elements", type: "lesson" },
    { n: 2, title: "Ohm’s law, KCL/KVL, and power", type: "lesson" },
    { n: 3, title: "Series/parallel, source transformations", type: "lesson" },
    { n: 4, title: "Thevenin & Norton equivalents", type: "lesson" },
    { n: 5, title: "Op-amp ideal intro (as a tool)", type: "lesson" },
    { n: 6, title: "Transient analysis: RC, RL, RLC", type: "lesson" },
    { n: 7, title: "Sinusoidal steady state & phasors", type: "lesson" },
    { n: 8, title: "Power, complex power, PF correction", type: "lesson" },
  ],
  'digital-electronics': [
    { n: 1, title: "Number systems & logic variables", type: "lesson" },
    { n: 2, title: "Logic gates & Boolean identities", type: "lesson" },
    { n: 3, title: "K-maps & combinational design", type: "lesson" },
    { n: 4, title: "Adders, mux/demux, encoders/decoders", type: "lesson" },
    { n: 5, title: "Flip-flops & latches", type: "lesson" },
    { n: 6, title: "Counters & shift registers", type: "lesson" },
    { n: 7, title: "Finite state machines", type: "lesson" },
    { n: 8, title: "Timing: setup/hold, clocking basics", type: "lesson" },
    { n: 9, title: "Mini HDL lab (bonus)", type: "project" },
  ],
  'analog-electronics': [
    { n: 1, title: "Semiconductor basics & diodes", type: "lesson" },
    { n: 2, title: "BJT models, biasing, small-signal", type: "lesson" },
    { n: 3, title: "MOSFET operation & regions", type: "lesson" },
    { n: 4, title: "CS/CE & followers", type: "lesson" },
    { n: 5, title: "Frequency response & Miller effect", type: "lesson" },
    { n: 6, title: "Op-amp non-idealities & stability intro", type: "lesson" },
    { n: 7, title: "Active filters & instrumentation amps", type: "lesson" },
    { n: 8, title: "Mini project: audio preamp", type: "project" },
  ],
  'rf-and-microwave-electronics': [
    { n: 1, title: "High-frequency effects & TL basics", type: "lesson" },
    { n: 2, title: "Reflections, SWR, and impedance", type: "lesson" },
    { n: 3, title: "Smith Chart methods & matching", type: "lesson" },
    { n: 4, title: "S-parameters & measurement intro", type: "lesson" },
    { n: 5, title: "Amplifier stability & noise figure", type: "lesson" },
    { n: 6, title: "Filters and passive networks", type: "lesson" },
    { n: 7, title: "Mini project: L-section match", type: "project" },
  ],
};

const moduleRows = [];
for (const [slug, arr] of Object.entries(MODULES)) {
  arr.forEach((m) => moduleRows.push({ course_id: CID[slug], ...m }));
}
await db.insert(CourseModules).values(moduleRows);

console.log("Courses + meta + outcomes + modules seeded.");

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

  // --- Videos ---
  console.log("Seeding videos…");
  await db.delete(Videos);
  await db.insert(Videos).values([
// Featured (first video)
  {
    id: 1,
    title: "Understanding GFET Design",
    featured: true,
    description:
       "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.",
    thumbnail: null,
    youtubeId: "bTqVqk7FSmY",
    duration: "12:00",
    date: new Date("2025-07-22"),
    created_at: faker.date.past({ months: 2 }),
  },

  // Non-featured (former LatestVideos) — thumbnails UNCHANGED
  {
    id: 2,
    title: "GFET Layout Optimization",
    featured: false,
    description: "Practical tips to optimize GFET layout for performance and reliability.",
    thumbnail: "layout-opt",
    youtubeId: "bTqVqk7FSmY",
    duration: "12:34",
    date: new Date("2025-07-20"),
    created_at: faker.date.past({ months: 2 }),
  },
  {
    id: 3,
    title: "Compact Model Extraction",
    featured: false,
    description: "From measurements to a usable compact model.",
    thumbnail: "compact-model",
    youtubeId: "bTqVqk7FSmY",
    duration: "9:02",
    date: new Date("2025-07-18"),
    created_at: faker.date.past({ months: 2 }),
  },
  {
    id: 4,
    title: "AI-assisted Circuit Design",
    featured: false,
    description: "Using ML to guide circuit exploration and optimization.",
    thumbnail: "ai-circuit",
    youtubeId: "bTqVqk7FSmY",
    duration: "14:58",
    date: new Date("2025-07-15"),
    created_at: faker.date.past({ months: 2 }),
  },
  {
    id: 5,
    title: "Charge Pump Simulation",
    featured: false,
    description: "End-to-end flow to simulate and validate charge pumps.",
    thumbnail: "charge-pump",
    youtubeId: "bTqVqk7FSmY",
    duration: "11:21",
    date: new Date("2025-07-14"),
    created_at: faker.date.past({ months: 2 }),
  },
  {
    id: 6,
    title: "Intro to Metasurface Design",
    featured: false,
    description: "Core concepts behind metasurfaces and applications.",
    thumbnail: "metasurface",
    youtubeId: "bTqVqk7FSmY",
    duration: "13:45",
    date: new Date("2025-07-13"),
    created_at: faker.date.past({ months: 2 }),
  },
  {
    id: 7,
    title: "Rectenna Matching Networks",
    featured: false,
    description: "Designing and verifying matching networks for rectennas.",
    thumbnail: "rectenna",
    youtubeId: "bTqVqk7FSmY",
    duration: "10:50",
    date: new Date("2025-07-11"),
    created_at: faker.date.past({ months: 2 }),
  },
  {
    id: 8,
    title: "ML for GFET Optimization",
    featured: false,
    description: "Applying ML pipelines to GFET parameter optimization.",
    thumbnail: "ml-optimization",
    youtubeId: "bTqVqk7FSmY",
    duration: "15:12",
    date: new Date("2025-07-09"),
    created_at: faker.date.past({ months: 2 }),
  },
  {
    id: 9,
    title: "DRC and LVS Basics",
    featured: false,
    description: "Foundational checks for layout signoff.",
    thumbnail: "drc-lvs",
    youtubeId: "bTqVqk7FSmY",
    duration: "8:59",
    date: new Date("2025-07-07"),
    created_at: faker.date.past({ months: 2 }),
  },
  {
    id: 10,
    title: "GFET Layout from Scratch",
    featured: false,
    description: "A clean-sheet approach to building a GFET layout.",
    thumbnail: "layout-from-scratch",
    youtubeId: "bTqVqk7FSmY",
    duration: "16:04",
    date: new Date("2025-07-05"),
    created_at: faker.date.past({ months: 2 }),
  },
  {
    id: 11,
    title: "Capacitor Modeling Deep Dive",
    featured: false,
    description: "Understanding parasitics and realistic capacitor models.",
    thumbnail: "capacitor-model",
    youtubeId: "bTqVqk7FSmY",
    duration: "10:30",
    date: new Date("2025-07-03"),
    created_at: faker.date.past({ months: 2 }),
  },
  {
    id: 12,
    title: "Energy Scavenging Circuits",
    featured: false,
    description: "Architectures and trade-offs for energy harvesting.",
    thumbnail: "energy-scavenging",
    youtubeId: "bTqVqk7FSmY",
    duration: "14:11",
    date: new Date("2025-07-01"),
    created_at: faker.date.past({ months: 2 }),
  },
  {
    id: 13,
    title: "Graphene Bandgap Engineering",
    featured: false,
    description: "Techniques to open and tune bandgap in graphene.",
    thumbnail: "graphene-bandgap",
    youtubeId: "bTqVqk7FSmY",
    duration: "9:47",
    date: new Date("2025-06-28"),
    created_at: faker.date.past({ months: 2 }),
  },
]);
console.log("Videos seeded.");

// --- CourseVideos & ModuleVideos ---
console.log("Seeding CourseVideos & ModuleVideos…");

// Ensure idempotent dev seeding
await db.delete(CourseVideos);
await db.delete(ModuleVideos);

// Helpers
const allVideos = await db.select().from(Videos);
const videoIdExists = new Set(allVideos.map(v => v.id));
const vid = (id) => (videoIdExists.has(id) ? id : null);

// Rebuild course-id map (already have CID above)
const modsCT = await db.select().from(CourseModules).where(eq(CourseModules.course_id, CID['circuit-theory']));
const modsDE = await db.select().from(CourseModules).where(eq(CourseModules.course_id, CID['digital-electronics']));
const modsAE = await db.select().from(CourseModules).where(eq(CourseModules.course_id, CID['analog-electronics']));
const modsRF = await db.select().from(CourseModules).where(eq(CourseModules.course_id, CID['rf-and-microwave-electronics']));

const mid = (mods, n) => mods.find(m => m.n === n)?.id;

// --- Course-level videos (trailers/supplemental) ---
const courseVideoRows = [
  // Trailers (1 per course)
  { course_id: CID['circuit-theory'],            video_id: vid(12), role: 'trailer',      order_index: 1 }, // Energy Scavenging Circuits
  { course_id: CID['digital-electronics'],       video_id: vid(9),  role: 'trailer',      order_index: 1 }, // DRC and LVS Basics
  { course_id: CID['analog-electronics'],        video_id: vid(11), role: 'trailer',      order_index: 1 }, // Capacitor Modeling
  { course_id: CID['rf-and-microwave-electronics'], video_id: vid(7), role: 'trailer',    order_index: 1 }, // Rectenna Matching

  // Supplemental
  { course_id: CID['rf-and-microwave-electronics'], video_id: vid(6), role: 'supplemental', order_index: 2 }, // Metasurface intro
  { course_id: CID['analog-electronics'],        video_id: vid(5),  role: 'supplemental', order_index: 2 }, // Charge Pump Simulation
  { course_id: CID['digital-electronics'],       video_id: vid(10), role: 'supplemental', order_index: 2 }, // Layout from Scratch
].filter(r => r.video_id != null);

if (courseVideoRows.length) {
  await db.insert(CourseVideos).values(courseVideoRows);
  console.log(`Inserted ${courseVideoRows.length} CourseVideos.`);
}

// --- Module-level videos (lesson/extras) ---
const moduleVideoRows = [
  // Circuit Theory
  mid(modsCT, 6)  && { module_id: mid(modsCT, 6),  video_id: vid(11), role: 'extra',   order_index: 1 }, // Transients ↔ Capacitor modeling
  mid(modsCT, 7)  && { module_id: mid(modsCT, 7),  video_id: vid(5),  role: 'extra',   order_index: 2 }, // Phasors ↔ Charge pump

  // Digital Electronics
  mid(modsDE, 8)  && { module_id: mid(modsDE, 8),  video_id: vid(9),  role: 'extra',   order_index: 1 }, // Timing ↔ DRC/LVS
  mid(modsDE, 9)  && { module_id: mid(modsDE, 9),  video_id: vid(10), role: 'extra',   order_index: 2 }, // Mini lab ↔ Layout

  // Analog Electronics
  mid(modsAE, 5)  && { module_id: mid(modsAE, 5),  video_id: vid(11), role: 'lesson',  order_index: 1 }, // Freq resp ↔ Capacitor modeling
  mid(modsAE, 6)  && { module_id: mid(modsAE, 6),  video_id: vid(5),  role: 'extra',   order_index: 2 }, // Op-amp non-ideal ↔ Charge pump

  // RF & Microwave
  mid(modsRF, 1)  && { module_id: mid(modsRF, 1),  video_id: vid(6),  role: 'extra',   order_index: 1 }, // TL basics ↔ Metasurfaces intro
  mid(modsRF, 3)  && { module_id: mid(modsRF, 3),  video_id: vid(7),  role: 'lesson',  order_index: 2 }, // Smith chart ↔ Matching networks
].filter(Boolean);

if (moduleVideoRows.length) {
  await db.insert(ModuleVideos).values(moduleVideoRows);
  console.log(`Inserted ${moduleVideoRows.length} ModuleVideos.`);
}

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

// --- PostVideos ---
console.log("Seeding PostVideos…");
await db.delete(PostVideos);

const allPostStats = await db.select().from(PostStats);
if (allPostStats.length === 0) {
  console.log("No PostStats found; skipping PostVideos.");
} else {
  // Take top 3 posts by views and attach a relevant video
  const topPosts = [...allPostStats].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 3);

  const postVideoRows = [
    topPosts[0] && { post_slug: topPosts[0].slug, video_id: 12, role: 'embed',     order_index: 1 }, // Energy Scavenging Circuits
    topPosts[1] && { post_slug: topPosts[1].slug, video_id: 13, role: 'reference', order_index: 1 }, // Graphene Bandgap Engineering
    topPosts[2] && { post_slug: topPosts[2].slug, video_id: 4,  role: 'embed',     order_index: 1 }, // AI-assisted Circuit Design
  ].filter(Boolean);

  await db.insert(PostVideos).values(postVideoRows);
  console.log(`Inserted ${postVideoRows.length} PostVideos.`);
}

  console.log("✅ Seed script finished.");
}
