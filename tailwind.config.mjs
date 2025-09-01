import daisyui from 'daisyui';
import typography from '@tailwindcss/typography'; 

export default {
  content: [
    './src/**/*.{astro,html,js,md,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    typography,
    daisyui,
  ],
  daisyui: {
    themes: ['light', 'dark'],
  },
};
