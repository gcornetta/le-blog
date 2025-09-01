// https://astro.build/db/config.mjs
import { defineDb, defineTable, column, NOW } from 'astro:db';

// Table for blog administrators
const Admins = defineTable({
  name: 'admins',
  columns: {
    id: column.number({ primaryKey: true }),
    email: column.text({ unique: true }),
    password_hash: column.text(),
    created_at: column.date({ default: NOW }),
  },
});

// Table to log failed login attempts for security monitoring
const FailedLogins = defineTable({
  name: 'failed_logins',
  columns: {
    id: column.number({ primaryKey: true }),
    email: column.text({ optional: true }),
    ip: column.text({ optional: true }),
    attempt_time: column.date({ default: NOW }),
  },
});

const Users = defineTable({
  name: 'users',
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    email: column.text({ unique: true }),
    registration_date: column.date({ default: NOW }),
    last_activity: column.date({ optional: true }),
  },
  relations: () => ({
    progress: relations(Progress),
    engagement: relations(Engagement),
  }),
});

const UnregisteredActivity = defineTable({
  name: 'unregistered_activity',
  columns: {
    id: column.number({ primaryKey: true }),
    ip: column.text({ optional: true }),
    page_url: column.text(),
    time_spent: column.number({ default: 0 }),
    timestamp: column.date({ default: NOW }),
    country: column.text({ optional: true }),
  },
});

const Engagement = defineTable({
  name: 'engagement',
  columns: {
    id: column.number({ primaryKey: true }),
    user_id: column.number({ references: () => Users.columns.id }),
    type: column.text(),
    content_id: column.text(),
    metric: column.number({ default: 0 }),
    timestamp: column.date({ default: NOW }),
  },
  relations: () => ({
    user: relations(Users),
  }),
});

const BlockedIPs = defineTable({
  name: 'blocked_ips',
  columns: {
    id: column.number({ primaryKey: true }),
    ip_address: column.text({ unique: true }),
    blocked_at: column.date({ default: NOW }),
    reason: column.text({ optional: true }),
  },
});

/** Courses table  **/
const Courses = defineTable({
  name: 'courses',
  columns: {
    id: column.number({ primaryKey: true }),

    // Canonical route slug
    slug: column.text({ unique: true }),

    // Basic info
    title: column.text(),
    description: column.text(),

    // Display / catalog fields
    level: column.text(),               // e.g., 'beginner' | 'intermediate' | 'advanced'
    instructor: column.text(),
    avatar: column.text(),              // path like '/images/authors/...'
    rating: column.number({ default: 0 }),
    excerpt: column.text(),
    image: column.text(),               // path like '/images/courses/...'

    // Featured flags
    featured: column.boolean({ default: false }),
    featured_order: column.number({ default: 0 }),

    created_at: column.date({ default: NOW }),
  },
  relations: () => ({
    // unchanged relation (Progress → Courses)
    progress: relations(Progress),
    meta: relations(CourseMeta),
    outcomes: relations(CourseOutcomes),
    modules: relations(CourseModules),
  }),
});

// Progress tracking for users
const Progress = defineTable({
  name: 'progress',
  columns: {
    id: column.number({ primaryKey: true }),
    user_id: column.number({ references: () => Users.columns.id }),
    course_id: column.number({ references: () => Courses.columns.id }),
    progress_percentage: column.number({ default: 0 }),
    completed_at: column.date({ optional: true }),
  },
  relations: () => ({
    user: relations(Users),
    course: relations(Courses),
  }),
});

// Course metadata
const CourseMeta = defineTable({
  name: 'course_meta',
  columns: {
    id: column.number({ primaryKey: true }),
    course_id: column.number({ references: () => Courses.columns.id }),

    hero_image: column.text({ optional: true }), // big banner image (hero)
    badge: column.text({ optional: true }),

    duration_hours: column.number({ default: 12 }),
    lessons_count: column.number({ default: 8 }),
    projects_count: column.number({ default: 3 }),
    quizzes_count: column.number({ default: 6 }),
    students_count: column.number({ optional: true }),

    cta_primary_href: column.text({ optional: true }),
    cta_primary_label: column.text({ optional: true }),
    cta_secondary_href: column.text({ optional: true }),
    cta_secondary_label: column.text({ optional: true }),
  },
  relations: () => ({
    course: relations(Courses),
  }),
});

// Course outcomes
const CourseOutcomes = defineTable({
  name: 'course_outcomes',
  columns: {
    id: column.number({ primaryKey: true }),
    course_id: column.number({ references: () => Courses.columns.id }),
    order_index: column.number({ default: 1 }),
    text: column.text(),
  },
  relations: () => ({
    course: relations(Courses),
  }),
});

// Course modules
const CourseModules = defineTable({
  name: 'course_modules',
  columns: {
    id: column.number({ primaryKey: true }),
    course_id: column.number({ references: () => Courses.columns.id }),
    n: column.number({ default: 1 }),         // shown number
    title: column.text(),
    type: column.text(),                       // 'lesson' | 'project' | 'quiz'
  },
  relations: () => ({
    course: relations(Courses),
  }),
});

// Course tags
const CourseTags = defineTable({
  name: 'course_tags',
  columns: {
    id: column.number({ primaryKey: true }),
    course_id: column.number({ references: () => Courses.columns.id }),
    tag: column.text(), // e.g. 'RF', 'Analog', 'Beginner-friendly'
  },
  relations: () => ({
    course: relations(Courses),
  }),
});

// Latest videos list (carousel entries)
const Videos = defineTable({
  name: 'videos',
  columns: {
    id: column.number({ primaryKey: true }),
    title: column.text(),
    featured: column.boolean({ default: false }),
    description: column.text(),
    thumbnail: column.text({ optional: true }),          // store the path (e.g. /images/videos/xxx.webp or .jpg)
    youtubeId: column.text(),
    duration: column.text(),           // keep as text "mm:ss"
    date: column.date(),               // ISO in seed; rendered as yyyy-mm-dd in UI
    created_at: column.date({ default: NOW }),
  },
});

// Link videos to whole courses (e.g., trailer/promo + other resources)
const CourseVideos = defineTable({
  name: 'course_videos',
  columns: {
    id: column.number({ primaryKey: true }),
    course_id: column.number({ references: () => Courses.columns.id }),
    video_id: column.number({ references: () => Videos.columns.id }),
    role: column.text({ default: 'supplemental' }), // 'trailer' | 'supplemental' | 'overview' ...
    order_index: column.number({ default: 1 }),
    start_at: column.number({ optional: true }),     // seconds offset for deep-links
  },
  relations: () => ({
    course: relations(Courses),
    video: relations(Videos),
  }),
});

// Link videos to specific syllabus items (modules/lessons)
const ModuleVideos = defineTable({
  name: 'module_videos',
  columns: {
    id: column.number({ primaryKey: true }),
    module_id: column.number({ references: () => CourseModules.columns.id }),
    video_id: column.number({ references: () => Videos.columns.id }),
    role: column.text({ default: 'lesson' }), // 'lesson' | 'extra' | 'solution' ...
    order_index: column.number({ default: 1 }),
    start_at: column.number({ optional: true }),
  },
  relations: () => ({
    module: relations(CourseModules),
    video: relations(Videos),
  }),
});

// Link videos to blog posts by slug (your posts live in content files)
const PostVideos = defineTable({
  name: 'post_videos',
  columns: {
    id: column.number({ primaryKey: true }),
    post_slug: column.text({ references: () => PostStats.columns.slug }), // reuse PostStats PK
    video_id: column.number({ references: () => Videos.columns.id }),
    role: column.text({ default: 'embed' }),    // 'embed' | 'reference'
    order_index: column.number({ default: 1 }),
    start_at: column.number({ optional: true }),
  },
  relations: () => ({
    video: relations(Videos),
    // optional: relation to PostStats if you want
  }),
});

// Post statistics
const PostStats = defineTable({
  name: "post_stats",
  columns: {
    slug: column.text({ primaryKey: true }),   // unique ID from post frontmatter
    views: column.number({ default: 0 }),      // total read count
    last_viewed_at: column.date({ default: NOW }) // updated on last view
  }
});

export default defineDb({
  tables: {
    Admins,
    FailedLogins,
    Users,
    Courses,
    Progress,
    UnregisteredActivity,
    Engagement,
    BlockedIPs,
    Videos,
    PostStats,
    CourseMeta,
    CourseOutcomes,
    CourseModules,
    CourseVideos,
    ModuleVideos,
    PostVideos,
    CourseTags,
  },
});