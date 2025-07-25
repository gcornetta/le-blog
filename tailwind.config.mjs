import daisyui from 'daisyui';

export default {
  content: [
    './src/**/*.{astro,html,js,md,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    daisyui,
  ],
  daisyui: {
    themes: ['light', 'dark'],
  },
};
