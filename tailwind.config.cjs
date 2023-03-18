/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        screens: {
            xl: { max: '1279px' },
            lg: { max: '1023px' },
            md: { max: '767px' },
            sm: { max: '639px' }
        },
        colors: {
            transparent: 'transparent',
            white: {
                100: 'rgba(244, 244, 249, 1)',
                85: 'rgba(244, 244, 249, 0.85)',
                60: 'rgba(244, 244, 249, 0.60)',
                30: 'rgba(244, 244, 249, 0.30)',
                20: 'rgba(244, 244, 249, 0.20)'
            },
            black: {
                100: 'rgba(17,24,39,1)',
                80: 'rgba(17,24,39,0.8)',
                60: 'rgba(17,24,39,0.6)',
                20: 'rgba(17,24,39,0.2)',
                5: 'rgba(17,24,39,0.05)'
            },
            primary: '#9B7EDE',
            secondary: '#9F4A54',
            accent: '#FF6542',
            inherit: 'inherit'
        },
        fontFamily: {
            DEFAULT: ['Interstate', 'sans-serif'],
            sans: ['Interstate', 'sans-serif'],
            serif: ['Interstate', 'serif']
        }
    },
    extend: {},
    darkMode: 'class'
};
