/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Beige background from your image
        beige: {
          50: '#F5EFE6',
          100: '#E8D7B8',
          200: '#DCC9A5',
        },
        // Bright orange from your image
        'bright-orange': {
          400: '#FFB347',
          500: '#FFA500',
          600: '#FF8C00',
        }
      }
    },
  },
  plugins: [],
}