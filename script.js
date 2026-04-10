const PRODUCTS_URL = 'https://dummyjson.com/products?limit=100';
const CATEGORIES_URL = 'https://dummyjson.com/products/categories';

// State Management
let allProducts = [];
let favorites = JSON.parse(localStorage.getItem('product_favorites')) || [];
let showOnlyFavorites = false;

// DOM Elements
const productGrid = document.getElementById('product-grid');
const loadingMessage = document.getElementById('loading-message');
const errorMessage = document.getElementById('error-message');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const sortSelect = document.getElementById('sort-select');
const themeToggle = document.getElementById('theme-toggle');
const favoritesToggle = document.getElementById('favorites-toggle');
const favCountSpan = document.getElementById('fav-count');

/**
 * Initialize the application
 */
async function init() {
    setupTheme();
    updateFavCount();
    await fetchInitialData();
    setupEventListeners();
}

/**
 * Setup Light/Dark Mode
 */
function setupTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️ Light Mode';
    }

    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeToggle.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    });
}

/**
 * Fetch products and categories from the API
 */
async function fetchInitialData() {
    try {
        loadingMessage.classList.remove('hidden');
        errorMessage.classList.add('hidden');

        // Fetch products and categories in parallel
        const [productsRes, categoriesRes] = await Promise.all([
            fetch(PRODUCTS_URL),
            fetch(CATEGORIES_URL)
        ]);

        if (!productsRes.ok || !categoriesRes.ok) throw new Error('Failed to fetch data');

        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();

        allProducts = productsData.products;
        
        // Populate categories dropdown
        categoriesData.slice(0, 15).forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.slug;
            option.textContent = cat.name;
            categoryFilter.appendChild(option);
        });

        renderProducts();

    } catch (error) {
        console.error('Error initializing store:', error);
        errorMessage.classList.remove('hidden');
    } finally {
        loadingMessage.classList.add('hidden');
    }
}

/**
 * Setup Event Listeners for search, filter, and sort
 */
function setupEventListeners() {
    searchInput.addEventListener('input', renderProducts);
    categoryFilter.addEventListener('change', renderProducts);
    sortSelect.addEventListener('change', renderProducts);
    
    favoritesToggle.addEventListener('click', () => {
        showOnlyFavorites = !showOnlyFavorites;
        favoritesToggle.classList.toggle('active');
        favoritesToggle.textContent = showOnlyFavorites ? 'Show All Products' : `Show Favorites (${favorites.length})`;
        renderProducts();
    });
}

/**
 * Render products with filtering and sorting
 */
function renderProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const sortValue = sortSelect.value;

    // 1. Filter products
    let filteredProducts = allProducts
        .filter(product => product.title.toLowerCase().includes(searchTerm))
        .filter(product => selectedCategory === 'all' || product.category === selectedCategory)
        .filter(product => !showOnlyFavorites || favorites.includes(product.id));

    // 2. Sort products
    if (sortValue === 'price-low') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortValue === 'price-high') {
        filteredProducts.sort((a, b) => b.price - a.price);
    }

    // 3. Clear and Display
    productGrid.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        productGrid.innerHTML = '<p class="status-text">No products found.</p>';
        return;
    }

    // Use .map and join to create HTML string then inject once (Performance optimized)
    const productCardsHTML = filteredProducts.map(product => {
        const isFav = favorites.includes(product.id);
        return `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image-container">
                    <img src="${product.thumbnail}" alt="${product.title}" loading="lazy">
                </div>
                <h2 class="product-title">${product.title}</h2>
                <div class="product-footer">
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    <button class="favorite-icon ${isFav ? 'active' : ''}" onclick="toggleFavorite(${product.id})">
                        ${isFav ? '❤️' : '🤍'}
                    </button>
                </div>
            </div>
        `;
    }).join('');

    productGrid.innerHTML = productCardsHTML;
}

/**
 * Toggle favorite status of a product
 * @param {number} productId 
 */
function toggleFavorite(productId) {
    const index = favorites.indexOf(productId);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(productId);
    }
    
    localStorage.setItem('product_favorites', JSON.stringify(favorites));
    updateFavCount();
    renderProducts();
}

/**
 * Update UI favorite counter
 */
function updateFavCount() {
    favCountSpan.textContent = favorites.length;
    if (!showOnlyFavorites) {
        favoritesToggle.textContent = `Show Favorites (${favorites.length})`;
    }
}

// Map toggleFavorite to window so it's accessible from inline onclick
window.toggleFavorite = toggleFavorite;

// Start the app
window.addEventListener('DOMContentLoaded', init);


