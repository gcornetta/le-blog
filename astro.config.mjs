import { defineConfig } from 'astro/config';
import mdx       from '@astrojs/mdx';
import alpine    from '@astrojs/alpinejs';
import tailwind  from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';
import rss       from '@astrojs/rss';
import sitemap   from '@astrojs/sitemap';
import svelte from '@astrojs/svelte';

import db from '@astrojs/db';

export default defineConfig({
  site: 'https://my-domain.com',  
  integrations: [
    mdx(),
    alpine(),
    tailwind(),   // ← PostCSS + Tailwind + DaisyUI
    sitemap(),    // ← auto sitemap.xml
    svelte({ 
      extensions: ['.svelte'] 
    }),
    db({
      adapter: { type: 'remote' }
    }),
  ],
  output: 'server',
  adapter: cloudflare({
    imageService: 'compile',
  }),
  // you can still add Vite tweaks if needed:
  vite: {
    build: { /* ... */ },
  },
});