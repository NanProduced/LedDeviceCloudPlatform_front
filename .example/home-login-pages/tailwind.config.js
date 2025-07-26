/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // 使用class策略而非media查询
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 使用CSS变量以便支持主题切换
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          light: 'var(--primary-light)',
        },
        muted: 'var(--muted)',
        border: 'var(--border)',
      },
      fontFamily: {
        montserrat: ['var(--font-montserrat)'],
        outfit: ['var(--font-outfit)'],
      },
    },
  },
  plugins: [],
} 