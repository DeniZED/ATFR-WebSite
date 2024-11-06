/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        wot: {
          gold: '#F4B223',
          goldLight: '#FFD700',
          goldDark: '#B78C2D',
          dark: '#0A0A0A',
          darker: '#050505',
          gray: '#1E1E1E',
          light: '#CCCCCC',
          white: '#FFFFFF'
        }
      },
      backgroundImage: {
        'wot-gradient': 'linear-gradient(to bottom, #1E1E1E 0%, #0A0A0A 100%)',
        'gold-gradient': 'linear-gradient(to bottom, #F4B223 0%, #B78C2D 100%)',
        'button-gradient': 'linear-gradient(to bottom, #F4B223 0%, #B78C2D 50%, #8B6B1F 100%)'
      },
      boxShadow: {
        'wot': '0 0 10px rgba(244, 178, 35, 0.3)',
        'wot-hover': '0 0 15px rgba(244, 178, 35, 0.5)'
      }
    },
  },
  plugins: [],
};