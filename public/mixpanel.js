mixpanel.init('f83a95d0b220b777f596f74b1903abdc', { debug: false, track_pageview: true, disable_persistence: true });

// Set this to a unique identifier for the user performing the event.
// eg: their ID in your database or their email address.
// mixpanel.identify(/* "<USER_ID"> */);

// Track an event. It can be anything, but in this example, we're tracking a Signed Up event.
// Include a property about the signup, like the Signup Type
mixpanel.track('client_pageload', {
    page: window.location.href,
    darkMode: getTheme() === 'dark'
});

// Track anchor clicks
document.querySelectorAll('a').forEach(function (el) {
    el.addEventListener('click', function (e) {
        console.log('Anchor clicked', { href: el.getAttribute('href'), title: el.textContent });
        mixpanel.track('client_anchor_click', { href: el.getAttribute('href'), title: el.textContent });
    });
});

// Track slider clicks
document.querySelectorAll('[data-btn-slider]').forEach(function (el) {
    el.addEventListener('click', function (e) {
        mixpanel.track('client_slider_swipe', { target: el.dataset.btnSlider });
    });
});


// Track theme changes
document.querySelectorAll('[data-btn-theme]').forEach(function (el) {
    el.addEventListener('click', function (e) {
        mixpanel.track('client_theme_change', { darkMode: document.documentElement.classList.contains('dark') });
    });
});	