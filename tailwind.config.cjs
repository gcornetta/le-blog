// tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Ensure content paths are correct relative to the project root
  content: [
    "./src/**/*.{astro,html,js,md}", //
    "./node_modules/daisyui/dist/**/*.js", // Ensure DaisyUI's JS files are purged if you use components with JS
  ],
  theme: {
    extend: {
      colors: {
        "brand-primary": "#4F46E5",
        "brand-secondary": "#6366F1",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"), // For styling markdown content
    require("daisyui"), // DaisyUI plugin
  ],
  // DaisyUI specific configuration
  daisyui: {
    themes: ["light", "dark"],
    logs: false, // Keep this to avoid excessive logs
  },
};
