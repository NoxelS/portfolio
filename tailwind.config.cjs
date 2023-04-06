/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        screens: {
            xxl: { max: '1535px' },
            xl: { max: '1279px' },
            lg: { max: '1023px' },
            md: { max: '767px' },
            sm: { max: '639px' }
        },
        colors: {
            transparent: 'transparent',
            white: {
                100: 'rgba(255, 255, 250, 1)',
                85: 'rgba(255, 255, 250, 0.85)',
                60: 'rgba(255, 255, 250, 0.60)',
                30: 'rgba(255, 255, 250, 0.30)',
                20: 'rgba(255, 255, 250, 0.20)'
            },
            black: {
                100: 'rgba(0,0,0,1.0)',
                80: 'rgba(0,0,0,0.8)',
                60: 'rgba(0,0,0,0.6)',
                40: 'rgba(0,0,0,0.4)',
                20: 'rgba(0,0,0,0.2)',
                5: 'rgba(0,0,0,0.05)'
            },
            primary: '#39A0ED',
            secondary: '#9F4A54',
            accent: '#FF6542',
            gray: '#F0F3F3',
            inherit: 'inherit'
        },
        fontFamily: {
            DEFAULT: ['Merriweather Sans', 'sans-serif'],
            sans: ['Merriweather Sans'],
            serif: ['Merriweather Sans']
        }
    },
    extend: {},
    darkMode: 'class'
};
