// https://astro.build/db/config
import { defineDb, defineTable, column, NOW } from 'astro:db';

const Admins = defineTable({
  name: 'admins',
  columns: {
    id: column.number({ primaryKey: true }),
    email: column.text({ unique: true }),
    password_hash: column.text(),
    created_at: column.date({ default: NOW }),
  },
});

const FailedLogins = defineTable({
  name: 'failed_logins',
  columns: {
    id: column.number({ primaryKey: true }),
    email: column.text({ optional: true }),
    ip: column.text({ optional: true }),
    attempt_time: column.date({ default: NOW }),
  },
});

export default defineDb({
  tables: {
    Admins,
    FailedLogins,
  },
});