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

const Courses = defineTable({
  name: 'courses',
  columns: {
    id: column.number({ primaryKey: true }),
    title: column.text(),
    description: column.text(),
    created_at: column.date({ default: NOW }),
  },
  relations: () => ({
    progress: relations(Progress),
  }),
});

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
  },
});