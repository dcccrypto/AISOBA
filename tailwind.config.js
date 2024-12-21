module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        glow: 'glow 2s infinite',
        pulse: 'pulse 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        fadeOut: 'fadeOut 0.5s ease-out forwards',
        'blob-slow': "blob-move-1 20s infinite",
        'blob-medium': "blob-move-2 18s infinite",
        'blob-fast': "blob-move-3 15s infinite",
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #ff6b00' },
          '50%': { boxShadow: '0 0 20px #ff6b00' },
          '100%': { boxShadow: '0 0 5px #ff6b00' },
        },
        pulse: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        fadeOut: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-10px)' },
        },
        'blob-move-1': {
          "0%, 100%": {
            transform: "translate(0, 0) scale(1)",
          },
          "25%": {
            transform: "translate(20px, -30px) scale(1.1)",
          },
          "50%": {
            transform: "translate(-20px, 20px) scale(0.95)",
          },
          "75%": {
            transform: "translate(30px, 25px) scale(1.05)",
          },
        },
        'blob-move-2': {
          "0%, 100%": {
            transform: "translate(0, 0) scale(1)",
          },
          "33%": {
            transform: "translate(-25px, 25px) scale(1.1)",
          },
          "66%": {
            transform: "translate(25px, -15px) scale(0.9)",
          },
        },
        'blob-move-3': {
          "0%, 100%": {
            transform: "translate(0, 0) scale(1)",
          },
          "40%": {
            transform: "translate(15px, -20px) scale(1.15)",
          },
          "80%": {
            transform: "translate(-25px, 10px) scale(0.95)",
          },
        },
      },
      utilities: {
        '.animation-delay-2000': {
          'animation-delay': '2s',
        },
        '.animation-delay-4000': {
          'animation-delay': '4s',
        },
      },
    },
  },
  plugins: [],
} 