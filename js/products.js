// Products page functionality

let currentFilters = {
    category: 'all',
    priceRange: 'all',
    sortBy: 'popularity',
    search: '',
    view: 'grid'
};

let currentPage = 1;
const itemsPerPage = 8;

// Initialize products page
function initProductsPage() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
        currentFilters.category = categoryParam;
        const categorySelect = document.getElementById('categoryFilter');
        if (categorySelect) {
            categorySelect.value = categoryParam;
        }
    }

    // Set up event listeners
    setupFilterListeners();
    setupViewToggle();
    setupSearch();

    // Initial render
    renderProducts();
    renderCategoryTags();
}

// Set up filter event listeners
function setupFilterListeners() {
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFilter = document.getElementById('priceFilter');
    const sortFilter = document.getElementById('sortFilter');

    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            currentFilters.category = e.target.value;
            currentPage = 1;
            renderProducts();
            updateCategoryTags();
        });
    }

    if (priceFilter) {
        priceFilter.addEventListener('change', (e) => {
            currentFilters.priceRange = e.target.value;
            currentPage = 1;
            renderProducts();
        });
    }

    if (sortFilter) {
        sortFilter.addEventListener('change', (e) => {
            currentFilters.sortBy = e.target.value;
            renderProducts();
        });
    }
}

// Set up view toggle
function setupViewToggle() {
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            viewButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilters.view = btn.dataset.view;
            renderProducts();
        });
    });
}

// Set up search
function setupSearch() {
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                currentFilters.search = e.target.value.toLowerCase();
                currentPage = 1;
                renderProducts();
            }, 300);
        });
    }
}

// Filter products
function getFilteredProducts() {
    let filtered = [...products];

    // Category filter
    if (currentFilters.category !== 'all') {
        filtered = filtered.filter(p => p.category === currentFilters.category);
    }

    // Price filter
    if (currentFilters.priceRange !== 'all') {
        const [min, max] = currentFilters.priceRange.split('-').map(Number);
        filtered = filtered.filter(p => {
            if (max) {
                return p.price >= min && p.price <= max;
            }
            return p.price >= min;
        });
    }

    // Search filter
    if (currentFilters.search) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(currentFilters.search) ||
            p.description.toLowerCase().includes(currentFilters.search) ||
            p.category.toLowerCase().includes(currentFilters.search)
        );
    }

    // Sort
    switch (currentFilters.sortBy) {
        case 'price-low':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'rating':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
        case 'popularity':
        default:
            filtered.sort((a, b) => b.popularity - a.popularity);
            break;
    }

    return filtered;
}

// Render products
function renderProducts() {
    const container = document.getElementById('productsGrid');
    const resultsCount = document.getElementById('resultsCount');

    if (!container) return;

    const filtered = getFilteredProducts();
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = filtered.slice(startIndex, startIndex + itemsPerPage);

    // Update results count
    if (resultsCount) {
        resultsCount.textContent = `Showing ${paginatedProducts.length} of ${filtered.length} products`;
    }

    // Set view class
    container.className = `products-grid ${currentFilters.view}-view`;

    // Render products
    if (paginatedProducts.length === 0) {
        container.innerHTML = `
            <div class="no-products">
                <span class="no-products-icon">🔍</span>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search term</p>
                <button class="btn btn-primary" onclick="resetFilters()">Reset Filters</button>
            </div>
        `;
    } else {
        container.innerHTML = paginatedProducts.map(product => createProductCard(product)).join('');
    }

    // Render pagination
    renderPagination(totalPages);
}

// Render pagination
function renderPagination(totalPages) {
    const container = document.getElementById('pagination');
    if (!container || totalPages <= 1) {
        if (container) container.innerHTML = '';
        return;
    }

    let html = '';

    // Previous button
    html += `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">←</button>`;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += '<span class="page-dots">...</span>';
        }
    }

    // Next button
    html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">→</button>`;

    container.innerHTML = html;
}

// Go to page
function goToPage(page) {
    currentPage = page;
    renderProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Reset filters
function resetFilters() {
    currentFilters = {
        category: 'all',
        priceRange: 'all',
        sortBy: 'popularity',
        search: '',
        view: currentFilters.view
    };
    currentPage = 1;

    // Reset form elements
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFilter = document.getElementById('priceFilter');
    const sortFilter = document.getElementById('sortFilter');
    const searchInput = document.getElementById('productSearch');

    if (categoryFilter) categoryFilter.value = 'all';
    if (priceFilter) priceFilter.value = 'all';
    if (sortFilter) sortFilter.value = 'popularity';
    if (searchInput) searchInput.value = '';

    renderProducts();
    updateCategoryTags();
}

// Render category tags
function renderCategoryTags() {
    const container = document.getElementById('categoryTags');
    if (!container) return;

    const html = categories.map(cat => `
        <button class="category-tag ${currentFilters.category === cat.id ? 'active' : ''}"
                data-category="${cat.id}"
                onclick="filterByCategory('${cat.id}')">
            <span class="tag-icon">${cat.icon}</span>
            <span class="tag-name">${cat.name}</span>
        </button>
    `).join('');

    container.innerHTML = html;
}

// Update category tags
function updateCategoryTags() {
    const tags = document.querySelectorAll('.category-tag');
    tags.forEach(tag => {
        if (tag.dataset.category === currentFilters.category) {
            tag.classList.add('active');
        } else {
            tag.classList.remove('active');
        }
    });
}

// Filter by category
function filterByCategory(category) {
    currentFilters.category = category;
    currentPage = 1;

    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.value = category;
    }

    renderProducts();
    updateCategoryTags();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initProductsPage);
