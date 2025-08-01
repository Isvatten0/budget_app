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

      },
      fontFamily: {
        'pixel': ['Press Start 2P', 'Courier New', 'monospace'],
        'arcade': ['Press Start 2P', 'Courier New', 'monospace'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pixel-bounce': 'pixel-bounce 0.6s ease-in-out',
        'pixel-fade-in': 'pixel-fade-in 0.3s ease-out',
        'coin-spin': 'coin-spin 1s linear infinite',
        'piggy-wiggle': 'piggy-wiggle 2s ease-in-out infinite',
        'random-float': 'random-float 3s ease-in-out',
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
        'random-float': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg) scale(1)' },
          '25%': { transform: 'translate(10px, -15px) rotate(90deg) scale(1.1)' },
          '50%': { transform: 'translate(-5px, -25px) rotate(180deg) scale(0.9)' },
          '75%': { transform: 'translate(-15px, -10px) rotate(270deg) scale(1.05)' },
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
}