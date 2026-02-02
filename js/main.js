// Main JavaScript - Common functionality for all pages
// Kondappali Toys - USA Edition

// Cart management
const Cart = {
    items: [],

    init() {
        this.load();
        this.updateCartCount();
    },

    load() {
        const saved = localStorage.getItem('kondappaliCart');
        this.items = saved ? JSON.parse(saved) : [];
    },

    save() {
        localStorage.setItem('kondappaliCart', JSON.stringify(this.items));
        this.updateCartCount();
    },

    add(product, quantity = 1) {
        const existingItem = this.items.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity
            });
        }
        this.save();
        this.showNotification(`${product.name} added to cart!`, 'success');
    },

    remove(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
    },

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.save();
        }
    },

    getCart() {
        this.load(); // Ensure we have latest data
        return this.items;
    },

    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    },

    clear() {
        this.items = [];
        this.save();
    },

    updateCartCount() {
        const cartCountElements = document.querySelectorAll('.cart-count');
        const count = this.getItemCount();
        cartCountElements.forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        });
    },

    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// Order Management
const OrderManager = {
    orders: [],

    init() {
        this.load();
    },

    load() {
        const saved = localStorage.getItem('kondappaliOrders');
        this.orders = saved ? JSON.parse(saved) : [];
    },

    save() {
        localStorage.setItem('kondappaliOrders', JSON.stringify(this.orders));
    },

    createOrder(cartItems, shippingInfo, paymentInfo) {
        const order = {
            id: 'KT' + Date.now().toString().slice(-8),
            date: new Date().toISOString(),
            items: cartItems,
            shipping: shippingInfo,
            payment: {
                method: paymentInfo.method,
                last4: paymentInfo.cardNumber ? paymentInfo.cardNumber.slice(-4) : null
            },
            subtotal: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            shipping_cost: this.calculateShipping(cartItems),
            tax: 0,
            status: 'confirmed',
            statusHistory: [
                { status: 'confirmed', date: new Date().toISOString(), message: 'Order confirmed' }
            ]
        };

        order.tax = order.subtotal * 0.08; // 8% tax
        order.total = order.subtotal + order.shipping_cost + order.tax;

        this.orders.unshift(order);
        this.save();

        return order;
    },

    calculateShipping(items) {
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return subtotal >= 50 ? 0 : 9.99;
    },

    getOrder(orderId) {
        return this.orders.find(o => o.id === orderId);
    },

    getAllOrders() {
        return this.orders;
    },

    updateOrderStatus(orderId, status, message) {
        const order = this.getOrder(orderId);
        if (order) {
            order.status = status;
            order.statusHistory.push({
                status,
                date: new Date().toISOString(),
                message
            });
            this.save();
        }
    },

    getStatusColor(status) {
        const colors = {
            'confirmed': '#2563eb',
            'processing': '#7c3aed',
            'shipped': '#0891b2',
            'out_for_delivery': '#ea580c',
            'delivered': '#16a34a',
            'cancelled': '#dc2626'
        };
        return colors[status] || '#6b7280';
    },

    getStatusLabel(status) {
        const labels = {
            'confirmed': 'Order Confirmed',
            'processing': 'Processing',
            'shipped': 'Shipped',
            'out_for_delivery': 'Out for Delivery',
            'delivered': 'Delivered',
            'cancelled': 'Cancelled'
        };
        return labels[status] || status;
    }
};

// Mobile menu toggle
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.navbar') && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    }
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Format currency (USD)
function formatCurrency(amount) {
    return '$' + amount.toFixed(2);
}

// Get product by ID
function getProductById(id) {
    return products.find(p => p.id === parseInt(id));
}

// Create product card HTML
function createProductCard(product) {
    const discount = Math.round((1 - product.price / product.originalPrice) * 100);
    return `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                <a href="product-detail.html?id=${product.id}">
                    <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy"
                         onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'product-placeholder\\'><span class=\\'placeholder-icon\\'>🎨</span></div>';">
                </a>
                <button class="product-wishlist" onclick="event.preventDefault(); addToWishlist(${product.id})" title="Add to Wishlist">
                    <span class="heart-icon">♡</span>
                </button>
                ${!product.inStock ? `<span class="stock-badge">Sold out</span>` : ''}
            </div>
            <div class="product-info">
                <div class="product-price">
                    <span class="current-price">${formatCurrency(product.price)}</span>
                    ${product.originalPrice > product.price ?
                        `<span class="original-price">${formatCurrency(product.originalPrice)}</span>` : ''}
                </div>
                <h3 class="product-name">
                    <a href="product-detail.html?id=${product.id}">${product.name}</a>
                </h3>
                <div class="product-artisan">${product.artisan}</div>
                <div class="product-rating">
                    ${createStarRating(product.rating)}
                    <span class="rating-count">(${product.reviews})</span>
                </div>
                ${product.inStock ? `<div class="product-status">Ready To Ship</div>` : ''}
            </div>
            <button class="add-to-cart" onclick="addToCartFromCard(${product.id})" ${!product.inStock ? 'disabled' : ''}>
                ${product.inStock ? 'Add to Cart' : 'Sold Out'}
            </button>
        </div>
    `;
}

// Get category name
function getCategoryName(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
}

// Create star rating HTML
function createStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
        stars += '<span class="star filled">★</span>';
    }
    if (hasHalf) {
        stars += '<span class="star half">★</span>';
    }
    for (let i = fullStars + (hasHalf ? 1 : 0); i < 5; i++) {
        stars += '<span class="star">★</span>';
    }

    return stars;
}

// Add to cart from product card
function addToCartFromCard(productId) {
    const product = getProductById(productId);
    if (product) {
        Cart.add(product, 1);
    }
}

// Quick view
function quickView(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

// Add to wishlist
function addToWishlist(productId) {
    Cart.showNotification('Added to wishlist!', 'success');
}

// Newsletter form submission
function initNewsletter() {
    const form = document.querySelector('.newsletter-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = form.querySelector('input[type="email"]').value;
            if (email) {
                Cart.showNotification('Thank you for subscribing! 🎉', 'success');
                form.reset();
            }
        });
    }
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Format time
function formatDateTime(dateString) {
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    Cart.init();
    OrderManager.init();
    initMobileMenu();
    initSmoothScroll();
    initNewsletter();
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (header) {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
});

// Intersection Observer for animations
const observeElements = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.product-card, .category-card, .why-us-card, .stat-card').forEach(el => {
        observer.observe(el);
    });
};

document.addEventListener('DOMContentLoaded', observeElements);
