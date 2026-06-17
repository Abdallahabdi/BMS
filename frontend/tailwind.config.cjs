module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: '#edf7f3',
          100: '#d2eadf',
          200: '#aad5c2',
          300: '#7ab89e',
          400: '#4a9c79',
          500: '#0A7D4A', // Logo Vibrant Green
          600: '#08693e',
          700: '#075331',
          800: '#1A4B36', // Logo Dark Green
          900: '#04341e',
          950: '#021e11',
        },
        primary: '#1A4B36', // Logo Dark Green
        accent: '#A6854C', // Logo Bronze/Gold
        brand: '#0A7D4A' // Logo Vibrant Green
      }
    }
  },
  plugins: []
}
