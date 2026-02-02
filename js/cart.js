// Cart page functionality

// Initialize cart page
function initCartPage() {
    renderCartItems();
    updateCartSummary();
}

// Render cart items
function renderCartItems() {
    const container = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const cartContent = document.getElementById('cartContent');

    if (!container) return;

    if (Cart.items.length === 0) {
        if (emptyCart) emptyCart.style.display = 'block';
        if (cartContent) cartContent.style.display = 'none';
        return;
    }

    if (emptyCart) emptyCart.style.display = 'none';
    if (cartContent) cartContent.style.display = 'grid';

    const html = Cart.items.map(item => {
        const product = getProductById(item.id);
        return `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" class="product-img"
                         onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'product-placeholder small\\'><span class=\\'placeholder-icon\\'>🎨</span></div>';">
                </div>
                <div class="cart-item-details">
                    <h3 class="cart-item-name">
                        <a href="product-detail.html?id=${item.id}">${item.name}</a>
                    </h3>
                    ${product ? `<p class="cart-item-artisan">By ${product.artisan}</p>` : ''}
                    <p class="cart-item-price">${formatCurrency(item.price)}</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="qty-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">−</button>
                    <input type="number" value="${item.quantity}" min="1" max="10"
                           onchange="updateCartQuantity(${item.id}, parseInt(this.value))">
                    <button class="qty-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
                <div class="cart-item-total">
                    <span class="item-total">${formatCurrency(item.price * item.quantity)}</span>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})" title="Remove item">
                    ×
                </button>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

// Update cart quantity
function updateCartQuantity(productId, quantity) {
    if (quantity < 1) {
        removeFromCart(productId);
        return;
    }
    if (quantity > 10) {
        quantity = 10;
        Cart.showNotification('Maximum quantity is 10');
    }
    Cart.updateQuantity(productId, quantity);
    renderCartItems();
    updateCartSummary();
}

// Remove from cart
function removeFromCart(productId) {
    Cart.remove(productId);
    renderCartItems();
    updateCartSummary();
    Cart.showNotification('Item removed from cart');
}

// Update cart summary
function updateCartSummary() {
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const totalEl = document.getElementById('total');
    const itemCountEl = document.getElementById('itemCount');

    const subtotal = Cart.getTotal();
    const shipping = subtotal > 0 ? (subtotal >= 2000 ? 0 : 150) : 0;
    const total = subtotal + shipping;

    if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : formatCurrency(shipping);
    if (totalEl) totalEl.textContent = formatCurrency(total);
    if (itemCountEl) itemCountEl.textContent = `(${Cart.getItemCount()} items)`;
}

// Clear entire cart
function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        Cart.clear();
        renderCartItems();
        updateCartSummary();
    }
}

// Initialize checkout page
function initCheckoutPage() {
    renderOrderSummary();
    setupCheckoutForm();
}

// Render order summary on checkout page
function renderOrderSummary() {
    const container = document.getElementById('orderItems');
    const subtotalEl = document.getElementById('orderSubtotal');
    const shippingEl = document.getElementById('orderShipping');
    const totalEl = document.getElementById('orderTotal');

    if (!container) return;

    if (Cart.items.length === 0) {
        window.location.href = 'cart.html';
        return;
    }

    const html = Cart.items.map(item => `
        <div class="order-item">
            <div class="order-item-image">
                <img src="${item.image}" alt="${item.name}" class="product-img"
                     onerror="this.onerror=null; this.style.display='none';">
                <span class="order-item-qty">${item.quantity}</span>
            </div>
            <div class="order-item-details">
                <span class="order-item-name">${item.name}</span>
                <span class="order-item-price">${formatCurrency(item.price * item.quantity)}</span>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;

    const subtotal = Cart.getTotal();
    const shipping = subtotal >= 2000 ? 0 : 150;
    const total = subtotal + shipping;

    if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : formatCurrency(shipping);
    if (totalEl) totalEl.textContent = formatCurrency(total);
}

// Setup checkout form
function setupCheckoutForm() {
    const form = document.getElementById('checkoutForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (validateCheckoutForm()) {
            processOrder();
        }
    });

    // Real-time validation
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
            if (input.classList.contains('error')) {
                validateField(input);
            }
        });
    });
}

// Validate checkout form
function validateCheckoutForm() {
    const form = document.getElementById('checkoutForm');
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });

    return isValid;
}

// Validate individual field
function validateField(input) {
    const value = input.value.trim();
    const errorEl = input.parentElement.querySelector('.error-message');
    let error = '';

    // Required check
    if (input.required && !value) {
        error = 'This field is required';
    }
    // Email validation
    else if (input.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            error = 'Please enter a valid email address';
        }
    }
    // Phone validation
    else if (input.type === 'tel' && value) {
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
            error = 'Please enter a valid 10-digit phone number';
        }
    }
    // Pincode validation
    else if (input.name === 'pincode' && value) {
        const pincodeRegex = /^[0-9]{6}$/;
        if (!pincodeRegex.test(value)) {
            error = 'Please enter a valid 6-digit pincode';
        }
    }

    // Show/hide error
    if (error) {
        input.classList.add('error');
        if (errorEl) errorEl.textContent = error;
        return false;
    } else {
        input.classList.remove('error');
        if (errorEl) errorEl.textContent = '';
        return true;
    }
}

// Process order
function processOrder() {
    const form = document.getElementById('checkoutForm');
    const formData = new FormData(form);
    const orderData = {
        orderId: generateOrderId(),
        date: new Date().toISOString(),
        customer: {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone')
        },
        shipping: {
            address: formData.get('address'),
            city: formData.get('city'),
            state: formData.get('state'),
            pincode: formData.get('pincode')
        },
        items: Cart.items,
        subtotal: Cart.getTotal(),
        shipping: Cart.getTotal() >= 2000 ? 0 : 150,
        total: Cart.getTotal() + (Cart.getTotal() >= 2000 ? 0 : 150)
    };

    // Save order to localStorage (for demo)
    localStorage.setItem('lastOrder', JSON.stringify(orderData));

    // Clear cart
    Cart.clear();

    // Show confirmation
    showOrderConfirmation(orderData);
}

// Generate order ID
function generateOrderId() {
    return 'KON' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
}

// Show order confirmation
function showOrderConfirmation(order) {
    const main = document.querySelector('main');
    if (!main) return;

    main.innerHTML = `
        <section class="order-confirmation">
            <div class="container">
                <div class="confirmation-box">
                    <div class="confirmation-icon">✓</div>
                    <h1>Order Confirmed!</h1>
                    <p class="order-id">Order ID: <strong>${order.orderId}</strong></p>
                    <p class="confirmation-message">
                        Thank you for your order, ${order.customer.firstName}!
                        We've sent a confirmation email to <strong>${order.customer.email}</strong>.
                    </p>
                    <div class="order-details">
                        <h3>Order Summary</h3>
                        <div class="confirmation-items">
                            ${order.items.map(item => `
                                <div class="confirmation-item">
                                    <span>${item.name} × ${item.quantity}</span>
                                    <span>${formatCurrency(item.price * item.quantity)}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="confirmation-totals">
                            <div class="confirmation-row">
                                <span>Subtotal</span>
                                <span>${formatCurrency(order.subtotal)}</span>
                            </div>
                            <div class="confirmation-row">
                                <span>Shipping</span>
                                <span>${order.shipping === 0 ? 'FREE' : formatCurrency(order.shipping)}</span>
                            </div>
                            <div class="confirmation-row total">
                                <span>Total</span>
                                <span>${formatCurrency(order.total)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="shipping-details">
                        <h3>Shipping Address</h3>
                        <p>
                            ${order.customer.firstName} ${order.customer.lastName}<br>
                            ${order.shipping.address}<br>
                            ${order.shipping.city}, ${order.shipping.state} - ${order.shipping.pincode}<br>
                            Phone: ${order.customer.phone}
                        </p>
                    </div>
                    <div class="confirmation-actions">
                        <a href="index.html" class="btn btn-primary">Continue Shopping</a>
                        <a href="products.html" class="btn btn-secondary">Browse Products</a>
                    </div>
                </div>
            </div>
        </section>
    `;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('cartItems')) {
        initCartPage();
    }
    if (document.getElementById('checkoutForm')) {
        initCheckoutPage();
    }
});
