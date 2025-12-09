// Products Management
let allProducts = [];
let allCategories = [];
let currentPage = 1;
let currentCategory = '';
let currentSort = 'newest';
let isLoading = false;
let useMockData = true; // Set to false when backend is ready

async function loadCategories() {
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
    
    grid.innerHTML = categories.map(category => `
        <div class="category-card" onclick="filterByCategory('${category.id}')">
            <div class="category-image">
                <img src="${category.image_url || 'https://via.placeholder.com/300'}" alt="${category.name}" loading="lazy">
                <div class="category-overlay"></div>
            </div>
            <h3 class="category-name">${category.name}</h3>
        </div>
    `).join('');
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
                container.innerHTML = '<div class="spinner-container"><div class="spinner"></div></div>';
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
        // Fallback to mock data
        allProducts = MOCK_PRODUCTS || [];
        displayProducts(allProducts);
    } finally {
        isLoading = false;
    }
}

function displayProducts(products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    if (products.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1/-1; padding: 40px;">لا توجد منتجات</p>';
        return;
    }
    
    grid.innerHTML = products.map(product => {
        const productData = {
            id: product.id,
            name: product.name,
            price: parseFloat(product.price || 0),
            image_url: product.image_url || product.image,
            code: product.code
        };
        return `
        <div class="product-card" onclick="openProductModal('${product.id}')">
            <div class="product-image">
                <img src="${product.image_url || product.image || 'https://via.placeholder.com/300'}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-code">${product.code || 'N/A'}</p>
                <div class="product-footer">
                    <span class="product-price">${parseFloat(product.price || 0).toFixed(2)} جنيه</span>
                    <button class="btn-icon" onclick="event.stopPropagation(); Cart.addItem(${JSON.stringify(productData)})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
    }).join('');
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
                    <img src="${product.image_url || product.image || 'https://via.placeholder.com/500'}" alt="${product.name}">
                </div>
                <div class="product-modal-info">
                    <h1 class="product-modal-title">${product.name}</h1>
                    <p class="product-modal-code">كود المنتج: ${product.code || 'N/A'}</p>
                    ${categoryName ? `<p class="product-modal-category">الفئة: ${categoryName}</p>` : ''}
                    <div class="product-modal-price">${parseFloat(product.price || 0).toFixed(2)} جنيه</div>
                    ${product.description ? `<div class="product-modal-description">${product.description}</div>` : ''}
                    <div class="product-modal-actions">
                        <button class="btn btn-primary btn-large" onclick="Cart.addItem(${JSON.stringify(productData)}); closeProductModal();">
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

function searchProducts(term) {
    if (!term) {
        displayProducts(allProducts);
        return;
    }
    
    const filtered = allProducts.filter(product => 
        product.name.toLowerCase().includes(term.toLowerCase()) ||
        (product.code && product.code.toLowerCase().includes(term.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(term.toLowerCase()))
    );
    
    displayProducts(filtered);
}

function scrollToProducts() {
    const productsSection = document.getElementById('products');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

