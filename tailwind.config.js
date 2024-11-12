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
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'fadeOut': 'fadeOut 0.5s ease-out forwards 1.5s',
        'scaleUp': 'scaleUp 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'slideDown': 'slideDown 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'slideUp': 'slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 10px rgba(244, 178, 35, 0.3)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 20px rgba(244, 178, 35, 0.5)',
            transform: 'scale(1.05)'
          },
        },
        textGlow: {
          '0%, 100%': { 
            textShadow: '0 0 10px rgba(244, 178, 35, 0.3)'
          },
          '50%': { 
            textShadow: '0 0 20px rgba(244, 178, 35, 0.6)'
          },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0', visibility: 'hidden' }
        },
        scaleUp: {
          '0%': { 
            transform: 'scale(0.5)',
            opacity: '0'
          },
          '100%': { 
            transform: 'scale(1)',
            opacity: '1'
          }
        },
        slideDown: {
          '0%': { 
            transform: 'translateY(-100%)',
            opacity: '0'
          },
          '100%': { 
            transform: 'translateY(0)',
            opacity: '1'
          }
        },
        slideUp: {
          '0%': { 
            transform: 'translateY(100%)',
            opacity: '0'
          },
          '100%': { 
            transform: 'translateY(0)',
            opacity: '1'
          }
        }
      },
      transitionTimingFunction: {
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      }
    },
  },
  plugins: [],
};