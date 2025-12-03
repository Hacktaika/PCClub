/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          primary: '#4ade80',
          secondary: '#60a5fa',
          accent: '#f472b6',
          dark: '#0a0e27',
          darker: '#050815',
          neon: '#4ade80',
          purple: '#a78bfa',
          pink: '#f472b6',
          blue: '#60a5fa',
          orange: '#fb923c',
        },
      },
      fontFamily: {
        cyber: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'cyber': '20px',
        'cyber-lg': '30px',
        'ios': '16px',
        'ios-lg': '20px',
        'ios-xl': '24px',
        'ios-2xl': '28px',
        'ios-3xl': '32px',
      },
      boxShadow: {
        'cyber': '0 0 20px rgba(74, 222, 128, 0.2)',
        'cyber-lg': '0 0 40px rgba(74, 222, 128, 0.3)',
        'neon': '0 0 15px rgba(74, 222, 128, 0.4), inset 0 0 15px rgba(74, 222, 128, 0.05)',
        'neon-blue': '0 0 15px rgba(96, 165, 250, 0.4), inset 0 0 15px rgba(96, 165, 250, 0.05)',
        'neon-pink': '0 0 15px rgba(244, 114, 182, 0.4), inset 0 0 15px rgba(244, 114, 182, 0.05)',
        'ios': '0 4px 20px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-neon': 'pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(74, 222, 128, 0.3)' },
          '100%': { boxShadow: '0 0 15px rgba(74, 222, 128, 0.5), 0 0 25px rgba(74, 222, 128, 0.3)' },
        },
        'pulse-neon': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [],
}
