// Intersection Observer for Lazy Loading and Performance
class LazyLoader {
    static imageObserver = null;
    static elementObserver = null;

    static init() {
        // Lazy load images with Intersection Observer
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            img.classList.add('loaded');
                            this.imageObserver.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '50px',
                threshold: 0.01
            });

            // Observe sections for content visibility
            this.elementObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        // Optionally unobserve after first view
                        // this.elementObserver.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '100px',
                threshold: 0.1
            });

            // Observe all images with data-src
            document.querySelectorAll('img[data-src]').forEach(img => {
                this.imageObserver.observe(img);
            });

            // Observe sections for animation triggers
            document.querySelectorAll('section').forEach(section => {
                this.elementObserver.observe(section);
            });
        }
    }

    static observeImage(img) {
        if (this.imageObserver && img.dataset.src) {
            this.imageObserver.observe(img);
        }
    }

    static observeElement(element) {
        if (this.elementObserver) {
            this.elementObserver.observe(element);
        }
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => LazyLoader.init());
} else {
    LazyLoader.init();
}

