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

setTheme(getTheme());