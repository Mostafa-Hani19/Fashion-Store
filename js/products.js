// Products Management
let allProducts = [];
let allCategories = [];
let currentPage = 1;
let currentCategory = '';
let currentSort = 'newest';
let isLoading = false;
let useMockData = true; // Set to false when backend is ready
let virtualScroll = null;
const PRODUCTS_PER_PAGE = 20; // Virtual scrolling threshold

async function loadCategories(retryCount = 0) {
    const maxRetries = 3;
    const retryDelay = 1000;
    
    if (useMockData) {
        // Use mock data
        allCategories = MOCK_CATEGORIES || [];
        displayCategories(allCategories);
        populateCategoryFilter(allCategories);
        return;
    }
    
    try {
        const { data, error } = await SupabaseService.getClient()
            .from('categories')
            .select('*')
            .order('name');
        
        if (error) throw error;
        
        allCategories = data || [];
        displayCategories(allCategories);
        populateCategoryFilter(allCategories);
    } catch (error) {
        console.error('Error loading categories:', error);
        
        // Retry logic for network errors
        if (retryCount < maxRetries && (error.message?.includes('network') || error.message?.includes('fetch'))) {
            console.log(`Retrying categories load (${retryCount + 1}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay * (retryCount + 1)));
            return loadCategories(retryCount + 1);
        }
        
        // Fallback to mock data
        allCategories = MOCK_CATEGORIES || [];
        displayCategories(allCategories);
        populateCategoryFilter(allCategories);
    }
}

function displayCategories(categories) {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;
    
    if (categories.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">لا توجد فئات</p>';
        return;
    }
    
    // Show skeleton loaders while loading
    const skeletonCount = 3;
    grid.innerHTML = Array(skeletonCount).fill(0).map(() => `
        <div class="skeleton-category-card">
            <div class="skeleton skeleton-category-image"></div>
            <div class="skeleton skeleton-category-name"></div>
        </div>
    `).join('');
    
    // Use requestAnimationFrame for smooth transition
    requestAnimationFrame(() => {
        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = categories.map(category => `
            <div class="category-card" onclick="filterByCategory('${category.id}')">
                <div class="category-image">
                    <img src="${category.image_url || 'https://via.placeholder.com/300'}" 
                     srcset="${category.image_url || 'https://via.placeholder.com/300'} 1x, ${category.image_url || 'https://via.placeholder.com/600'} 2x"
                     alt="${category.name}" 
                     loading="lazy" 
                     decoding="async" 
                     fetchpriority="low" 
                     onload="this.classList.add('loaded')"
                     onerror="this.src='https://via.placeholder.com/300'">
                    <div class="category-overlay"></div>
                </div>
                <h3 class="category-name">${category.name}</h3>
            </div>
        `).join('');
        
        while (tempDiv.firstChild) {
            fragment.appendChild(tempDiv.firstChild);
        }
        
        // Smooth transition from skeleton to content
        setTimeout(() => {
            grid.innerHTML = '';
            grid.appendChild(fragment);
        }, 200);
    });
}

function populateCategoryFilter(categories) {
    const filter = document.getElementById('categoryFilter');
    if (!filter) return;
    
    filter.innerHTML = '<option value="">جميع الفئات</option>' + 
        categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
}

async function loadProducts(reset = false) {
    if (isLoading) return;
    isLoading = true;
    
    try {
        const container = document.getElementById('productsGrid');
        if (reset) {
            currentPage = 1;
            if (container) {
                // Show skeleton instead of spinner for better UX
                const skeletonCount = 6;
                container.innerHTML = Array(skeletonCount).fill(0).map(() => `
                    <div class="skeleton-product-card">
                        <div class="skeleton skeleton-product-image"></div>
                        <div class="skeleton-product-info">
                            <div class="skeleton skeleton-product-title"></div>
                            <div class="skeleton skeleton-product-code"></div>
                            <div class="skeleton skeleton-product-price"></div>
                        </div>
                    </div>
                `).join('');
            }
        }
        
        let products = [];
        
        if (useMockData) {
            // Use mock data
            products = [...MOCK_PRODUCTS];
            
            // Filter by category
            if (currentCategory) {
                products = products.filter(p => p.category_id === currentCategory);
            }
            
            // Apply sorting
            if (currentSort === 'price-low') {
                products.sort((a, b) => a.price - b.price);
            } else if (currentSort === 'price-high') {
                products.sort((a, b) => b.price - a.price);
            } else if (currentSort === 'name') {
                products.sort((a, b) => a.name.localeCompare(b.name));
            }
        } else {
            let query = SupabaseService.getClient()
                .from('products')
                .select('*');
            
            if (currentCategory) {
                query = query.eq('category_id', currentCategory);
            }
            
            // Apply sorting
            if (currentSort === 'price-low') {
                query = query.order('price', { ascending: true });
            } else if (currentSort === 'price-high') {
                query = query.order('price', { ascending: false });
            } else if (currentSort === 'name') {
                query = query.order('name', { ascending: true });
            } else {
                query = query.order('created_at', { ascending: false });
            }
            
            const { data, error } = await query;
            
            if (error) throw error;
            products = data || [];
        }
        
        allProducts = products;
        displayProducts(allProducts);
        
        // Show/hide load more button
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        if (loadMoreContainer) {
            loadMoreContainer.style.display = allProducts.length >= CONFIG.ITEMS_PER_PAGE ? 'block' : 'none';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        
        // Show error message to user
        const container = document.getElementById('productsGrid');
        if (container) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <p style="color: var(--text-secondary); margin-bottom: 16px;">حدث خطأ أثناء تحميل المنتجات</p>
                    <button class="btn btn-secondary" onclick="loadProducts(true)">إعادة المحاولة</button>
                </div>
            `;
        }
        
        // Fallback to mock data
        allProducts = MOCK_PRODUCTS || [];
        displayProducts(allProducts);
    } finally {
        isLoading = false;
    }
}

function createProductCard(product) {
    const productData = {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price || 0),
        image_url: product.image_url || product.image,
        code: product.code
    };
    
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => openProductModal(product.id);
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image_url || product.image || 'https://via.placeholder.com/300'}" 
                 srcset="${product.image_url || product.image || 'https://via.placeholder.com/300'} 1x, ${product.image_url || product.image || 'https://via.placeholder.com/600'} 2x"
                 alt="${product.name}" 
                 loading="lazy" 
                 decoding="async" 
                 fetchpriority="low" 
                 onload="this.classList.add('loaded')"
                 onerror="this.src='https://via.placeholder.com/300'">
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-code">${product.code || 'N/A'}</p>
            <div class="product-footer">
                <span class="product-price">${parseFloat(product.price || 0).toFixed(2)} جنيه</span>
                <button class="btn-icon" onclick="event.stopPropagation(); Cart.addItem(${JSON.stringify(productData).replace(/"/g, '&quot;')})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;
    
    return card;
}

function displayProducts(products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    if (products.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1/-1; padding: 40px;">لا توجد منتجات</p>';
        if (virtualScroll) {
            virtualScroll = null;
        }
        return;
    }
    
    // Use virtual scrolling for large lists
    if (products.length > PRODUCTS_PER_PAGE && !grid.classList.contains('virtual-scroll-container')) {
        // Convert grid to virtual scroll container
        grid.classList.add('virtual-scroll-container');
        grid.style.overflowY = 'auto';
        grid.style.height = '600px';
        grid.style.display = 'block';
        
        virtualScroll = new VirtualScroll(
            grid,
            products,
            (product, index) => {
                const wrapper = document.createElement('div');
                wrapper.style.height = '400px';
                wrapper.appendChild(createProductCard(product));
                return wrapper;
            },
            {
                itemHeight: 400,
                overscan: 2
            }
        );
        return;
    }
    
    // Regular rendering for smaller lists
    if (virtualScroll) {
        virtualScroll = null;
        grid.classList.remove('virtual-scroll-container');
        grid.style.overflowY = '';
        grid.style.height = '';
        grid.style.display = '';
    }
    
    // Show skeleton loaders while loading
    const skeletonCount = Math.min(products.length, 6);
    grid.innerHTML = Array(skeletonCount).fill(0).map(() => `
        <div class="skeleton-product-card">
            <div class="skeleton skeleton-product-image"></div>
            <div class="skeleton-product-info">
                <div class="skeleton skeleton-product-title"></div>
                <div class="skeleton skeleton-product-code"></div>
                <div class="skeleton skeleton-product-price"></div>
            </div>
        </div>
    `).join('');
    
    // Use requestAnimationFrame for smooth rendering
    requestAnimationFrame(() => {
        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        
        products.forEach(product => {
            fragment.appendChild(createProductCard(product));
        });
        
        // Smooth transition from skeleton to content
        setTimeout(() => {
            grid.innerHTML = '';
            grid.appendChild(fragment);
        }, 200);
    });
}

async function openProductModal(productId) {
    try {
        let product;
        
        if (useMockData) {
            product = MOCK_PRODUCTS.find(p => p.id === productId);
            if (!product) {
                throw new Error('Product not found');
            }
            // Add category name
            const category = MOCK_CATEGORIES.find(c => c.id === product.category_id);
            product.categoryName = category ? category.name : '';
        } else {
            const { data, error } = await SupabaseService.getClient()
                .from('products')
                .select('*, categories(name)')
                .eq('id', productId)
                .single();
            
            if (error) throw error;
            product = data;
        }
        
        const modal = document.getElementById('productModal');
        const modalBody = document.getElementById('modalBody');
        
        if (!modal || !modalBody) return;
        
        const productData = {
            id: product.id,
            name: product.name,
            price: parseFloat(product.price || 0),
            image_url: product.image_url || product.image,
            code: product.code
        };
        
        const categoryName = product.categoryName || (product.categories ? product.categories.name : '');
        
        modalBody.innerHTML = `
            <div class="product-modal-content">
                <div class="product-modal-image">
                    <img src="${product.image_url || product.image || 'https://via.placeholder.com/500'}" 
                         srcset="${product.image_url || product.image || 'https://via.placeholder.com/500'} 1x, ${product.image_url || product.image || 'https://via.placeholder.com/1000'} 2x"
                         alt="${product.name}" 
                         loading="eager" 
                         decoding="async" 
                         fetchpriority="high"
                         onerror="this.src='https://via.placeholder.com/500'">
                </div>
                <div class="product-modal-info">
                    <h1 class="product-modal-title">${product.name}</h1>
                    <p class="product-modal-code">كود المنتج: ${product.code || 'N/A'}</p>
                    ${categoryName ? `<p class="product-modal-category">الفئة: ${categoryName}</p>` : ''}
                    <div class="product-modal-price">${parseFloat(product.price || 0).toFixed(2)} جنيه</div>
                    ${product.description ? `<div class="product-modal-description">${product.description}</div>` : ''}
                    <div class="product-modal-actions">
                        <button class="btn btn-primary btn-large" onclick="Cart.addItem(${JSON.stringify(productData).replace(/"/g, '&quot;')}); closeProductModal();">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                            أضف للسلة
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Error loading product:', error);
        showToast('حدث خطأ أثناء تحميل المنتج', 'error');
    }
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function filterByCategory(categoryId) {
    currentCategory = categoryId;
    const filter = document.getElementById('categoryFilter');
    if (filter) filter.value = categoryId;
    loadProducts(true);
    scrollToProducts();
}

// Optimized search with debouncing and caching
const searchProducts = PerformanceOptimizer.debounce((term) => {
    if (!term || term.trim() === '') {
        displayProducts(allProducts);
        return;
    }
    
    const searchTerm = term.toLowerCase().trim();
    const cacheKey = `search_${searchTerm}`;
    
    // Check cache first
    if (PerformanceOptimizer.requestCache.has(cacheKey)) {
        displayProducts(PerformanceOptimizer.requestCache.get(cacheKey));
        return;
    }
    
    // Perform search
    const filtered = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        (product.code && product.code.toLowerCase().includes(searchTerm)) ||
        (product.description && product.description.toLowerCase().includes(searchTerm))
    );
    
    // Cache result
    PerformanceOptimizer.requestCache.set(cacheKey, filtered);
    
    displayProducts(filtered);
}, 200);

function scrollToProducts() {
    const productsSection = document.getElementById('products');
    if (productsSection) {
        // Use requestAnimationFrame for smooth scroll
        requestAnimationFrame(() => {
            productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

