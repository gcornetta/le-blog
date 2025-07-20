import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import alpinejs from "@astrojs/alpinejs";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  integrations: [
    tailwind(),  // Only use @astrojs/tailwind
    alpinejs(),
  ],
  adapter: cloudflare(),
  // Remove ALL vite configuration
});