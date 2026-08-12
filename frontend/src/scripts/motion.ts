/** Shared, progressive-enhancement motion for the portfolio landing page. */

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const revealElements = Array.from(document.querySelectorAll<HTMLElement>('[data-motion-reveal]'));
const immediateElements = revealElements.filter(element => element.hasAttribute('data-motion-immediate'));
const sectionElements = Array.from(document.querySelectorAll<HTMLElement>('[data-motion-section]'));
const sectionContents = new Set(
    sectionElements.flatMap(section => [section, ...Array.from(section.querySelectorAll<HTMLElement>('[data-motion-reveal]'))]),
);
const deferredElements = revealElements.filter(
    element => !element.hasAttribute('data-motion-immediate') && !sectionContents.has(element),
);
const deferredSections = sectionElements.filter(section => !section.hasAttribute('data-motion-immediate'));

const show = (element: HTMLElement) => {
    element.dataset.motionVisible = 'true';
    element.classList.remove('opacity-0', 'translate-y-4', 'translate-y-6', 'translate-y-8', 'translate-y-10');
    element.classList.add('opacity-100', 'translate-y-0');
};

const showSection = (section: HTMLElement) => {
    show(section);
    section.querySelectorAll<HTMLElement>('[data-motion-reveal]').forEach(show);
};

if (reducedMotion.matches) {
    revealElements.forEach(show);
} else if ('IntersectionObserver' in window) {
    revealElements
        .filter(element => !element.hasAttribute('data-motion-immediate'))
        .forEach(element => {
        element.classList.add('opacity-0', element.dataset.motionDistance === 'large' ? 'translate-y-10' : 'translate-y-4');
        });

    window.requestAnimationFrame(() => immediateElements.forEach(show));

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const target = entry.target as HTMLElement;
                if (target.hasAttribute('data-motion-section')) showSection(target);
                else show(target);
                observer.unobserve(target);
            });
        },
        { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
    );

    deferredSections.forEach(section => observer.observe(section));
    deferredElements.forEach(element => observer.observe(element));
} else {
    revealElements.forEach(show);
}

const progress = document.querySelector<HTMLElement>('[data-scroll-progress]');

if (progress && !reducedMotion.matches) {
    let ticking = false;

    const updateProgress = () => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const percentage = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
        progress.style.transform = `scaleX(${Math.min(1, Math.max(0, percentage))})`;
        ticking = false;
    };

    window.addEventListener(
        'scroll',
        () => {
            if (!ticking) {
                window.requestAnimationFrame(updateProgress);
                ticking = true;
            }
        },
        { passive: true },
    );
    updateProgress();
}
