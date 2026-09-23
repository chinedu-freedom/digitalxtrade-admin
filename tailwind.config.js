/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      borderRadius: {
        DEFAULT: '0.375rem',
        sm: '0.375rem',
        md: '0.375rem',
        lg: '0.375rem',
        xl: '0.375rem',
        '2xl': '0.375rem',
        '3xl': '0.375rem',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        righteous: ['var(--font-righteous)', 'Righteous', 'cursive'],
      },
      colors: {
        adminBg: '#090D16',
        adminCard: '#111827',
        adminBorder: '#1F293D',
        adminPrimary: '#0088cc',
        brandPrimary: '#0088cc',
        brandNavy: '#0f3d7c',
        brandBlue: '#0072ce',
        brandLightBlue: '#0085d0',
        darkBg: '#090D16',
        cardBg: '#111827',
        cardBorder: '#1F293D',
        brandRed: '#ff0044',
        brandOrange: '#fe780b',
        stakelabDark: '#0b0f19',
        stakelabCard: '#13192b',
        stakelabCardBorder: '#1c243f',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #0f3d7c 0%, #0088cc 100%)',
        'glass-gradient': 'linear-gradient(180deg, rgba(15, 61, 124, 0.6) 0%, rgba(9, 13, 22, 0.8) 100%)',
      },
    },
  },
  plugins: [],
};
