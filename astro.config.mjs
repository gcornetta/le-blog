import { defineConfig } from 'astro/config';
import tailwind from '@tailwindcss/vite';
import alpinejs from '@astrojs/alpinejs';
import cloudflare from '@astrojs/cloudflare';
import daisyui from 'daisyui'; // Import as ES module

export default defineConfig({
  vite: {
    plugins: [
      tailwind({
        config: {
          content: [
            './src/**/*.astro',
            './src/**/*.js',
            './src/**/*.md'
          ],
          plugins: [daisyui], // Use imported module
          daisyui: {
            themes: ['light', 'dark'],
            logs: false
          }
        }
      })
    ]
  },
  integrations: [alpinejs()],
  adapter: cloudflare()
});
