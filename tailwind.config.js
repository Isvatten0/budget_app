/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Rosé Pine Classic (Dark Mode)
        'rose-pine': {
          base: '#191724',
          surface: '#1f1d2e',
          overlay: '#26233a',
          muted: '#6e6a86',
          subtle: '#908caa',
          text: '#e0def4',
          love: '#eb6f92',
          gold: '#f6c177',
          rose: '#ebbcba',
          pine: '#31748f',
          foam: '#9ccfd8',
          iris: '#c4a7e7',
        },
        // Rosé Pine Dawn (Light Mode)
        'rose-pine-dawn': {
          base: '#faf4ed',
          surface: '#fffaf3',
          overlay: '#f2e9e1',
          muted: '#9893a5',
          subtle: '#797593',
          text: '#575279',
          love: '#b4637a',
          gold: '#ea9d34',
          rose: '#d7827e',
          pine: '#286983',
          foam: '#56949f',
          iris: '#907aa9',
        }
      },
      fontFamily: {
        'pixel': ['Courier New', 'monospace'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pixel-bounce': 'pixel-bounce 0.6s ease-in-out',
        'pixel-fade-in': 'pixel-fade-in 0.3s ease-out',
        'coin-spin': 'coin-spin 1s linear infinite',
        'piggy-wiggle': 'piggy-wiggle 2s ease-in-out infinite',
      },
      keyframes: {
        'pixel-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'pixel-fade-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'coin-spin': {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
        'piggy-wiggle': {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
      },
      boxShadow: {
        'pixel': '4px 4px 0px rgba(0, 0, 0, 0.2)',
        'pixel-inset': 'inset 2px 2px 0px rgba(0, 0, 0, 0.1)',
      },
      borderWidth: {
        '3': '3px',
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}