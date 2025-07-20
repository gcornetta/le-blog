import { z, defineCollection } from 'astro:content';

const blogCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    excerpt: z.string().max(160),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    heroImage: z.string().optional(), // path to image in public/
    author: z.string().default('Default Author'),
    draft: z.boolean().default(false)
  })
});

export const collections = {
  'blog': blogCollection
};