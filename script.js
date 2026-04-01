/**
 * Store API Integration
 * Script to fetch and display products from DummyJSON API.
 */

// Define API endpoint
const API_URL = 'https://dummyjson.com/products';

// DOM Elements
const productGrid = document.getElementById('product-grid');
const loadingMessage = document.getElementById('loading-message');
const errorMessage = document.getElementById('error-message');

/**
 * Fetch products from the API
 */
async function fetchProducts() {
    try {
        // 1. Handle loading state: ensure loading is visible, error is hidden
        loadingMessage.classList.remove('hidden');
        errorMessage.classList.add('hidden');
        productGrid.innerHTML = '';

        // 2. Make the API call
        const response = await fetch(API_URL);

        // 3. Check if the response is successful
        if (!response.ok) {
            throw new Error('Failed to fetch data from API');
        }

        // 4. Parse JSON data
        const data = await response.json();

        // 5. Display the data (DummyJSON returns an object with a 'products' array)
        if (data && Array.isArray(data.products)) {
            displayProducts(data.products);
        } else {
            throw new Error('Invalid data format received from API');
        }

    } catch (error) {
        // 6. Handle errors
        console.error('Error fetching products:', error);
        errorMessage.classList.remove('hidden');
    } finally {
        // 7. Hide loading message regardless of outcome
        loadingMessage.classList.add('hidden');
    }
}

/**
 * Dynamically display products on the webpage
 * @param {Array} products - Array of product objects
 */
function displayProducts(products) {
    // Loop through each product and create a card
    products.forEach(product => {
        // Create card element
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');

        // Populate card with content (Image [thumbnail], Title, Price)
        productCard.innerHTML = `
            <div class="product-image-container">
                <img src="${product.thumbnail}" alt="${product.title}" loading="lazy">
            </div>
            <h2 class="product-title">${product.title}</h2>
            <p class="product-price">$${product.price ? product.price.toFixed(2) : '0.00'}</p>
        `;

        // Append card to the grid
        productGrid.appendChild(productCard);
    });
}

// Initial fetch when page loads
window.addEventListener('DOMContentLoaded', fetchProducts);

