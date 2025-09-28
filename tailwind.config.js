/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  safelist: ['outline', 'outline-2', 'outline-4', 'outline-8', 'outline-offset'],
  theme: {
    extend: {
      fontFamily: {
        'eurostile-ext': 'Eurostile-Ext',
        'eurostile-med': 'Eurostile-Med',
        'roboto-flex': 'Roboto-Flex',
      },
      colors: {
        lighten: '#ffffff51',
        darken: '#00000051',
        nav: '#2E2B3B',

        primary: '#1B4F98',
        'primary-10': '#F6FAFD',
        'primary-20': '#DCECFA',
        'primary-30': '#B4D6F4',
        'primary-40': '#91C2ED',
        'primary-50': '#509EEC',
        'primary-60': '#297EE0',
        'primary-70': '#1F63B7',
        'primary-80': '#1B4F98',
        'primary-90': '#0F2D57',

        secondary: '#ffe550',
        'secondary-lt': '#fff5bc',
        'secondary-dk': '#b39800',

        neutral: {
          10: '#F8F9FA',
          20: '#EDEFF2',
          30: '#DEE1E6',
          40: '#CED3DA',
          50: '#AAB1BB',
          60: '#7E8690',
          70: '#515861',
          80: '#3E444C',
          90: '#252A32',
        },
      },
      containers: {
        lg: '20px',
      },
      screens: {
        lg: '1400px',
        md: '1100px',
        xl: '1900px',
      },
    },
  },
  plugins: [],
}
