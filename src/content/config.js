// src/content/config.js
import { z, defineCollection } from 'astro:content';
import readingTime from 'reading-time';

const blog = defineCollection({
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string().min(1).max(20)).default([]),
    featured: z.boolean().default(false),
    heroImage: image().optional(),
    author: z.string().default('Default Author'),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };