module.exports = {
  content: [
    './src/**/*.{astro,html,js,md}'
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui')
  ],
  daisyui: {
    themes: ['light', 'dark']
  }
};
