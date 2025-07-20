module.exports = {
  content: [
    './src/**/*.{astro,js,md}'
  ],
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['light', 'dark']
  }
};
