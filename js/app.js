// Main App Initialization
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Supabase (only if not using mock data)
    if (!useMockData) {
        await SupabaseService.initialize();
    }
    
    // Initialize Cart
    Cart.init();
    
    // Load categories and products
    await loadCategories();
    await loadProducts();
    
    // Setup event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchProducts(e.target.value);
            }, 300);
        });
    }
    
    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            currentCategory = e.target.value;
            loadProducts(true);
        });
    }
    
    // Sort filter
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
        sortFilter.addEventListener('change', (e) => {
            currentSort = e.target.value;
            loadProducts(true);
        });
    }
    
    // Cart toggle
    const cartBtn = document.getElementById('cartBtn');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartClose = document.getElementById('cartClose');
    
    if (cartBtn && cartSidebar) {
        cartBtn.addEventListener('click', () => {
            cartSidebar.classList.add('active');
        });
    }
    
    if (cartClose && cartSidebar) {
        cartClose.addEventListener('click', () => {
            cartSidebar.classList.remove('active');
        });
    }
    
    // Close cart on overlay click
    if (cartSidebar) {
        cartSidebar.addEventListener('click', (e) => {
            if (e.target === cartSidebar) {
                cartSidebar.classList.remove('active');
            }
        });
    }
    
    // Product modal
    const modal = document.getElementById('productModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeProductModal);
    }
    
    if (modalClose) {
        modalClose.addEventListener('click', closeProductModal);
    }
    
    // Checkout
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }
    
    // Mobile menu
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
    
    // Nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href');
            if (target.startsWith('#')) {
                const section = document.querySelector(target);
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                }
            }
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    });
}

async function handleCheckout() {
    if (Cart.items.length === 0) {
        showToast('السلة فارغة', 'error');
        return;
    }
    
    // Here you would integrate with your order system
    // For now, we'll just show a confirmation
    const confirmed = confirm(`إجمالي الطلب: ${Cart.getTotal().toFixed(2)} جنيه\n\nهل تريد إتمام الطلب؟`);
    
    if (confirmed) {
        // Create order in Supabase
        try {
            const orderData = {
                total: Cart.getTotal(),
                items: Cart.items,
                status: 'pending',
                created_at: new Date().toISOString()
            };
            
            // You would save this to your orders table
            showToast('تم إرسال الطلب بنجاح!', 'success');
            Cart.clear();
            document.getElementById('cartSidebar').classList.remove('active');
        } catch (error) {
            console.error('Error creating order:', error);
            showToast('حدث خطأ أثناء إتمام الطلب', 'error');
        }
    }
}

