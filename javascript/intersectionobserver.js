document.addEventListener('DOMContentLoaded', () => {
    try {
        const entryEl = document.getElementById('dark-entry');
        const colorEntry = document.getElementById('color-entry');
        if (entryEl) {
            const bgObserver = new IntersectionObserver((entries) => {
                entries.forEach(en => {
                    if (en.isIntersecting) {
                        try { document.body.style.backgroundColor = '#0E0E12'; } catch (e) {}
                        if (colorEntry) colorEntry.style.color = 'white';
                    } else {
                        try { document.body.style.backgroundColor = 'white'; } catch (e) {}
                        if (colorEntry) colorEntry.style.color = 'black';
                    }
                });
            }, { threshold: 0.3 });
            bgObserver.observe(entryEl);
        }

        const animItems = Array.from(document.querySelectorAll('.animate-on-scroll'));
        if (animItems.length > 0) {
            const animObserver = new IntersectionObserver((entries) => {
                entries.forEach(en => {
                    const el = en.target;
                    if (en.isIntersecting) el.classList.add('in-view');
                    else el.classList.remove('in-view');
                });
            }, { threshold: 0.15 });

            animItems.forEach(i => animObserver.observe(i));
        }
    } catch (err) {
        console.error('intersectionobserver init failed', err);
    }
});
