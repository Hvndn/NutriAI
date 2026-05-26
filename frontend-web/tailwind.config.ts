import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        premium: {
          green: '#10B981',      // Emerald Vivid Green
          lime: '#84CC16',       // Lime
          dark: 'rgba(var(--premium-dark), <alpha-value>)',
          card: 'rgba(var(--premium-card), <alpha-value>)',
          border: 'rgba(var(--premium-border), <alpha-value>)',
          accent: '#3B82F6',     // Electric Blue
          rose: '#F43F5E',       // Soft Heart Rose
        }
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'premium': 'var(--premium-shadow)',
        'glow': '0 0 15px 2px rgba(16, 185, 129, 0.4)',
        'glow-blue': '0 0 15px 2px rgba(59, 130, 246, 0.4)',
      }
    },
  },
  plugins: [],
};

export default config;
