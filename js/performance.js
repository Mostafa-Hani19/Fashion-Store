// Performance Optimization Utilities
class PerformanceOptimizer {
    static debounceCache = new Map();
    static requestCache = new Map();
    static observerCache = new Map();
    
    // Advanced debouncing with caching
    static debounce(func, wait, immediate = false) {
        const cacheKey = func.toString() + wait;
        
        if (!this.debounceCache.has(cacheKey)) {
            let timeout;
            const debounced = function(...args) {
                const context = this;
                const later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                const callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
            
            debounced.cancel = function() {
                clearTimeout(timeout);
                timeout = null;
            };
            
            this.debounceCache.set(cacheKey, debounced);
        }
        
        return this.debounceCache.get(cacheKey);
    }
    
    // Throttle function for scroll/resize events
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Batch DOM updates
    static batchDOMUpdates(updates) {
        if (!Array.isArray(updates)) {
            updates = [updates];
        }
        requestAnimationFrame(() => {
            updates.forEach(update => {
                if (typeof update === 'function') {
                    update();
                }
            });
        });
    }
    
    // Memory cleanup
    static cleanup() {
        // Clear unused observers
        this.observerCache.forEach(observer => {
            if (observer && observer.disconnect) {
                observer.disconnect();
            }
        });
        this.observerCache.clear();
        
        // Clear old cache entries (keep last 50)
        if (this.requestCache.size > 50) {
            const entries = Array.from(this.requestCache.entries());
            entries.slice(0, entries.length - 50).forEach(([key]) => {
                this.requestCache.delete(key);
            });
        }
    }
    
    // Request batching
    static batchRequests(requests, batchSize = 5) {
        const batches = [];
        for (let i = 0; i < requests.length; i += batchSize) {
            batches.push(requests.slice(i, i + batchSize));
        }
        return batches.map(batch => Promise.all(batch));
    }
    
    // Lazy load with intersection observer
    static lazyLoad(element, callback, options = {}) {
        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers
            callback();
            return null;
        }
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    callback(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: options.rootMargin || '50px',
            threshold: options.threshold || 0.01
        });
        
        observer.observe(element);
        this.observerCache.set(element, observer);
        return observer;
    }
    
    // Performance monitoring
    static measurePerformance(name, fn) {
        if ('performance' in window && 'mark' in window.performance) {
            const startMark = `${name}-start`;
            const endMark = `${name}-end`;
            const measureName = `${name}-measure`;
            
            performance.mark(startMark);
            const result = fn();
            performance.mark(endMark);
            performance.measure(measureName, startMark, endMark);
            
            const measure = performance.getEntriesByName(measureName)[0];
            console.log(`${name}: ${measure.duration.toFixed(2)}ms`);
            
            // Cleanup
            performance.clearMarks(startMark);
            performance.clearMarks(endMark);
            performance.clearMeasures(measureName);
            
            return result;
        }
        return fn();
    }
    
    // Image preloading
    static preloadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }
    
    // Preload multiple images
    static preloadImages(urls) {
        return Promise.all(urls.map(url => this.preloadImage(url).catch(() => null)));
    }
}

// Auto cleanup on page unload
window.addEventListener('beforeunload', () => {
    PerformanceOptimizer.cleanup();
});

// Periodic cleanup (every 5 minutes)
setInterval(() => {
    PerformanceOptimizer.cleanup();
}, 5 * 60 * 1000);

