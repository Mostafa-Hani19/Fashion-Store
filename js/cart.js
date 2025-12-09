// Shopping Cart Management
class Cart {
    static items = [];
    static storageKey = 'fashion_store_cart';

    static init() {
        this.loadFromStorage();
        this.updateCartUI();
    }

    static loadFromStorage() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                this.items = JSON.parse(stored);
            } catch (e) {
                this.items = [];
            }
        }
    }

    static saveToStorage() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    }

    static addItem(product, quantity = 1) {
        if (!product || !product.id) {
            console.error('Invalid product data');
            return;
        }
        
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                id: product.id,
                name: product.name || 'Product',
                price: parseFloat(product.price || 0),
                image: product.image_url || product.image || 'https://via.placeholder.com/80',
                quantity: quantity
            });
        }
        
        this.saveToStorage();
        this.updateCartUI();
        this.showAddToCartNotification(product.name || 'المنتج');
    }

    static removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveToStorage();
        this.updateCartUI();
    }

    static updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.saveToStorage();
                this.updateCartUI();
            }
        }
    }

    static clear() {
        this.items = [];
        this.saveToStorage();
        this.updateCartUI();
    }

    static getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    static getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    static updateCartUI() {
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const cartFooter = document.getElementById('cartFooter');
        const cartTotal = document.getElementById('cartTotal');

        if (cartCount) {
            cartCount.textContent = this.getItemCount();
            cartCount.style.display = this.getItemCount() > 0 ? 'flex' : 'none';
        }

        if (cartItems) {
            if (this.items.length === 0) {
                cartItems.innerHTML = `
                    <div class="empty-cart">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        <p>سلة التسوق فارغة</p>
                    </div>
                `;
                if (cartFooter) cartFooter.style.display = 'none';
            } else {
                cartItems.innerHTML = this.items.map(item => `
                    <div class="cart-item">
                        <img src="${item.image || 'https://via.placeholder.com/80'}" alt="${item.name}" class="cart-item-image">
                        <div class="cart-item-info">
                            <h4 class="cart-item-name">${item.name}</h4>
                            <p class="cart-item-price">${item.price.toFixed(2)} جنيه</p>
                            <div class="cart-item-controls">
                                <button class="quantity-btn" onclick="Cart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                                <span class="quantity">${item.quantity}</span>
                                <button class="quantity-btn" onclick="Cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                            </div>
                        </div>
                        <button class="cart-item-remove" onclick="Cart.removeItem('${item.id}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                `).join('');
                
                if (cartFooter) {
                    cartFooter.style.display = 'block';
                    if (cartTotal) {
                        cartTotal.textContent = `${this.getTotal().toFixed(2)} جنيه`;
                    }
                }
            }
        }
    }

    static showAddToCartNotification(productName) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>تم إضافة ${productName} إلى السلة</span>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

