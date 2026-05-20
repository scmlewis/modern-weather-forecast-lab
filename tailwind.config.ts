import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 24px 80px -40px rgba(15, 23, 42, 0.65)',
      },
      keyframes: {
        floatCloud: {
          '0%': { transform: 'translateX(-8%)' },
          '50%': { transform: 'translateX(8%)' },
          '100%': { transform: 'translateX(-8%)' },
        },
        rainFall: {
          '0%': { transform: 'translateY(-20%) rotate(12deg)', opacity: '0' },
          '30%': { opacity: '0.65' },
          '100%': { transform: 'translateY(130vh) rotate(12deg)', opacity: '0' },
        },
        snowFall: {
          '0%': { transform: 'translate3d(0, -10vh, 0)', opacity: '0' },
          '15%': { opacity: '0.8' },
          '100%': { transform: 'translate3d(36px, 120vh, 0)', opacity: '0' },
        },
        driftMist: {
          '0%': { transform: 'translateX(-12%)' },
          '50%': { transform: 'translateX(8%)' },
          '100%': { transform: 'translateX(-12%)' },
        },
        lightning: {
          '0%, 88%, 100%': { backgroundColor: 'rgba(255,255,255,0)' },
          '89%': { backgroundColor: 'rgba(255,255,255,0.20)' },
          '90%': { backgroundColor: 'rgba(255,255,255,0.02)' },
          '92%': { backgroundColor: 'rgba(255,255,255,0.14)' },
        },
        pulseSun: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
          '50%': { transform: 'scale(1.08)', opacity: '0.9' },
        },
      },
      animation: {
        floatCloud: 'floatCloud 16s ease-in-out infinite',
        rainFall: 'rainFall 1.4s linear infinite',
        snowFall: 'snowFall 7s linear infinite',
        driftMist: 'driftMist 22s ease-in-out infinite',
        lightning: 'lightning 7s linear infinite',
        pulseSun: 'pulseSun 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
