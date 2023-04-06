// Theme service
// This service is used to manage the theme of the application

function getTheme() {
    const theme = localStorage.getItem('theme');
    if (theme) {
        return theme;
    } else {
        // Get the theme from the OS
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        } else {
            return 'light';
        }
    }
}

function setTheme(theme) {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

function toggleTheme() {
    const theme = getTheme();
    if (theme === 'dark') {
        setTheme('light');
    } else {
        setTheme('dark');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setTheme(getTheme());

    const sliders = [];
    document.querySelectorAll('[data-content-slide]').forEach(el => {
        const id = el.id;
        const swiper = new Swiper('.swiper-' + id, {
            direction: 'horizontal',
            loop: true,
            slidesPerView: 'auto',
            spaceBetween: 40,
            navigation: {
                nextEl: '.button-next-' + id
                // prevEl: '.button-prev'
            }
        });
        sliders.push({
            id,
            swiper
        });
    });
});
