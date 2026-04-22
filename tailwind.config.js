/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        // ATFR palette — or profond de l'emblème + nuances noir/charbon.
        atfr: {
          gold: '#E8B043',
          'gold-light': '#F5CB5C',
          'gold-dark': '#A47820',
          bronze: '#8A5A20',
          ink: '#0B0B0C',
          carbon: '#121316',
          graphite: '#1C1D22',
          steel: '#262830',
          fog: '#9CA0AA',
          bone: '#ECECEC',
          snow: '#FFFFFF',
          ember: '#C0392B',
          success: '#3FA55A',
          warning: '#D89A27',
          danger: '#D2453A',
        },
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Oswald"', '"Inter Variable"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'gradient-gold':
          'linear-gradient(135deg, #F5CB5C 0%, #E8B043 45%, #A47820 100%)',
        'gradient-hero':
          'radial-gradient(1200px 600px at 20% 0%, rgba(232,176,67,0.15), transparent 60%), radial-gradient(900px 500px at 80% 10%, rgba(232,176,67,0.08), transparent 60%), linear-gradient(180deg, #0B0B0C 0%, #121316 100%)',
        grid: 'linear-gradient(rgba(232,176,67,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(232,176,67,0.06) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '42px 42px',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(232,176,67,0.25), 0 10px 40px -10px rgba(232,176,67,0.35)',
        'glow-lg':
          '0 0 0 1px rgba(232,176,67,0.35), 0 20px 60px -15px rgba(232,176,67,0.5)',
        inset: 'inset 0 1px 0 0 rgba(255,255,255,0.05)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(232,176,67,0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(232,176,67,0)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.5s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2.4s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out both',
      },
      transitionTimingFunction: {
        emphasized: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
