// Virtual Scrolling for Large Product Lists
class VirtualScroll {
    constructor(container, items, renderItem, options = {}) {
        this.container = container;
        this.items = items;
        this.renderItem = renderItem;
        this.options = {
            itemHeight: options.itemHeight || 400,
            overscan: options.overscan || 3,
            ...options
        };
        
        this.scrollTop = 0;
        this.containerHeight = 0;
        this.visibleStart = 0;
        this.visibleEnd = 0;
        
        this.init();
    }
    
    init() {
        this.updateContainerHeight();
        this.setupScrollListener();
        this.render();
        
        // Handle resize
        const resizeObserver = new ResizeObserver(() => {
            this.updateContainerHeight();
            this.render();
        });
        resizeObserver.observe(this.container);
    }
    
    updateContainerHeight() {
        this.containerHeight = this.container.clientHeight;
    }
    
    setupScrollListener() {
        let ticking = false;
        this.container.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.scrollTop = this.container.scrollTop;
                    this.render();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }
    
    calculateVisibleRange() {
        const start = Math.floor(this.scrollTop / this.options.itemHeight);
        const end = Math.ceil((this.scrollTop + this.containerHeight) / this.options.itemHeight);
        
        this.visibleStart = Math.max(0, start - this.options.overscan);
        this.visibleEnd = Math.min(this.items.length, end + this.options.overscan);
    }
    
    render() {
        this.calculateVisibleRange();
        
        const visibleItems = this.items.slice(this.visibleStart, this.visibleEnd);
        const offsetY = this.visibleStart * this.options.itemHeight;
        const totalHeight = this.items.length * this.options.itemHeight;
        
        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        const wrapper = document.createElement('div');
        wrapper.style.height = `${totalHeight}px`;
        wrapper.style.position = 'relative';
        
        const content = document.createElement('div');
        content.style.position = 'absolute';
        content.style.top = `${offsetY}px`;
        content.style.width = '100%';
        
        visibleItems.forEach((item, index) => {
            const element = this.renderItem(item, this.visibleStart + index);
            if (element) {
                content.appendChild(element);
            }
        });
        
        wrapper.appendChild(content);
        fragment.appendChild(wrapper);
        
        // Batch DOM update
        requestAnimationFrame(() => {
            this.container.innerHTML = '';
            this.container.appendChild(fragment);
        });
    }
    
    updateItems(newItems) {
        this.items = newItems;
        this.render();
    }
}

// Export for use in products.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VirtualScroll;
}

