/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Marathon-inspired dark color palette
        brand: {
          bg: '#0a0a0f',
          surface: '#12121a',
          card: '#1a1a26',
          border: '#2a2a3e',
          accent: '#e05c1a',       // orange — Marathon's signature color
          accentHover: '#f06a20',
          text: '#e8e8f0',
          muted: '#7a7a9a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
