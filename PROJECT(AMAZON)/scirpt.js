// Global variables
let cartItems = [];
let cartCount = 0;

// Product data structure
const products = {
    'Clothing Accessories': { price: 1299, category: 'clothing', icon: 'tshirt' },
    'Health & Personal Care': { price: 899, category: 'health', icon: 'heartbeat' },
    'Furnitures': { price: 15999, category: 'furniture', icon: 'couch' },
    'Mobile Phones': { price: 25999, category: 'electronics', icon: 'mobile-alt' },
    'Beauty & Skincare': { price: 1599, category: 'beauty', icon: 'spa' },
    'Love & Soulmates': { price: 999, category: 'gifts', icon: 'heart' },
    'Toys & Stationary': { price: 599, category: 'toys', icon: 'gamepad' },
    'Fashion & Trends': { price: 2199, category: 'fashion', icon: 'gem' }
};

// Search suggestions
const searchSuggestions = [
    'iPhone', 'Samsung', 'MacBook', 'iPad', 'AirPods',
    'Nike shoes', 'Laptop', 'Headphones', 'Books',
    'Kitchen', 'Home decor', 'Fashion', 'Electronics',
    'Beauty', 'Pet food', 'Toys', 'Groceries', 'Furniture',
    'Health products', 'Mobile accessories', 'Clothing'
];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    loadCartFromStorage();
    updateCartDisplay();
    addSearchFunctionality();
    addSmoothScrolling();
    updateLocation();
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.querySelector('.searchin');
    const searchIcon = document.querySelector('.searchicon');
    
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') performSearch();
        });
        searchInput.addEventListener('focus', showSearchSuggestions);
        searchInput.addEventListener('blur', hideSearchSuggestions);
    }
    
    if (searchIcon) {
        searchIcon.addEventListener('click', performSearch);
    }

    // Language selector
    const langSelect = document.querySelector('.all-lang');
    if (langSelect) {
        langSelect.addEventListener('change', changeLanguage);
    }

    // Location selector
    const locationElement = document.querySelector('.second');
    if (locationElement) {
        locationElement.addEventListener('click', changeLocation);
    }

    // Cart functionality
    const cartElement = document.querySelector('.navcart');
    if (cartElement) {
        cartElement.addEventListener('click', showCartDetails);
    }

    // Sign in functionality
    const signInElement = document.querySelector('.nav-signin');
    if (signInElement) {
        signInElement.addEventListener('click', handleSignIn);
    }

    // Panel options
    const panelOptions = document.querySelectorAll('.panel-ops p');
    panelOptions.forEach((option, index) => {
        option.addEventListener('click', () => handlePanelClick(option.textContent.trim()));
    });

    // Box click handlers (for adding to cart)
    addBoxClickHandlers();

    // Footer back to top
    const backToTop = document.querySelector('.foot-panel1 a');
    if (backToTop) {
        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToTop();
        });
    }
}

function addBoxClickHandlers() {
    const boxes = document.querySelectorAll('.box');
    boxes.forEach((box, index) => {
        const productName = box.querySelector('h2').textContent;
        const shopNowLink = box.querySelector('a p');
        
        // Add click handler to the "Shop now" link
        if (shopNowLink) {
            shopNowLink.addEventListener('click', (e) => {
                e.preventDefault();
                addToCart(productName);
            });
        }
        
        // Add hover effects
        box.addEventListener('mouseenter', () => {
            box.style.transform = 'translateY(-5px)';
            box.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            box.style.transition = 'all 0.3s ease';
        });
        
        box.addEventListener('mouseleave', () => {
            box.style.transform = 'translateY(0)';
            box.style.boxShadow = 'none';
        });
    });
}

function addSearchFunctionality() {
    const searchContainer = document.querySelector('.nav-search');
    if (!searchContainer) return;

    // Create suggestions dropdown
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.className = 'search-suggestions';
    suggestionsDiv.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 45px;
        background: white;
        border: 1px solid #ddd;
        border-top: none;
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
    `;
    searchContainer.appendChild(suggestionsDiv);
}

function handleSearchInput(e) {
    const query = e.target.value.toLowerCase().trim();
    const suggestionsDiv = document.querySelector('.search-suggestions');
    
    if (!suggestionsDiv) return;
    
    if (query.length > 0) {
        const filteredSuggestions = searchSuggestions.filter(item => 
            item.toLowerCase().includes(query)
        ).slice(0, 6);

        if (filteredSuggestions.length > 0) {
            suggestionsDiv.innerHTML = filteredSuggestions
                .map(suggestion => 
                    `<div class="suggestion-item" style="padding: 10px; cursor: pointer; border-bottom: 1px solid #eee;" 
                     onmouseover="this.style.backgroundColor='#f5f5f5'" 
                     onmouseout="this.style.backgroundColor='white'"
                     onclick="selectSuggestion('${suggestion}')">${suggestion}</div>`
                ).join('');
            suggestionsDiv.style.display = 'block';
        } else {
            suggestionsDiv.style.display = 'none';
        }
    } else {
        suggestionsDiv.style.display = 'none';
    }
}

function showSearchSuggestions() {
    const suggestionsDiv = document.querySelector('.search-suggestions');
    const searchInput = document.querySelector('.searchin');
    
    if (suggestionsDiv && searchInput && searchInput.value.trim().length > 0) {
        suggestionsDiv.style.display = 'block';
    }
}

function hideSearchSuggestions() {
    setTimeout(() => {
        const suggestionsDiv = document.querySelector('.search-suggestions');
        if (suggestionsDiv) {
            suggestionsDiv.style.display = 'none';
        }
    }, 200);
}

function selectSuggestion(suggestion) {
    const searchInput = document.querySelector('.searchin');
    const suggestionsDiv = document.querySelector('.search-suggestions');
    
    if (searchInput) {
        searchInput.value = suggestion;
    }
    if (suggestionsDiv) {
        suggestionsDiv.style.display = 'none';
    }
    performSearch();
}

function performSearch() {
    const searchInput = document.querySelector('.searchin');
    const category = document.querySelector('.searchselect');
    
    if (!searchInput) return;
    
    const query = searchInput.value.trim();
    const selectedCategory = category ? category.value : 'all';
    
    if (query) {
        showNotification(`Searching for "${query}" in ${selectedCategory === 'all' ? 'all categories' : selectedCategory}...`);
        filterProductsBySearch(query);
    }
}

function filterProductsBySearch(query) {
    const boxes = document.querySelectorAll('.box');
    let matchCount = 0;
    
    boxes.forEach(box => {
        const title = box.querySelector('h2').textContent.toLowerCase();
        if (title.includes(query.toLowerCase())) {
            box.style.display = 'block';
            matchCount++;
        } else {
            box.style.display = 'none';
        }
    });
    
    setTimeout(() => {
        showNotification(`Found ${matchCount} products matching "${query}"`);
    }, 500);
}

function addToCart(productName) {
    const product = products[productName];
    if (!product) return;
    
    cartItems.push({
        name: productName,
        price: product.price,
        id: Date.now()
    });
    
    cartCount++;
    updateCartDisplay();
    saveCartToStorage();
    
    showNotification(`${productName} added to cart! ₹${product.price.toLocaleString()}`);
    animateCartIcon();
}

function updateCartDisplay() {
    // Create cart count element if it doesn't exist
    let cartCountElement = document.getElementById('cartCount');
    if (!cartCountElement) {
        cartCountElement = document.createElement('span');
        cartCountElement.id = 'cartCount';
        cartCountElement.style.cssText = `
            position: absolute;
            top: -8px;
            right: -8px;
            background: #ff9f00;
            color: #0f1111;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            min-width: 20px;
        `;
        
        const cartElement = document.querySelector('.navcart');
        if (cartElement) {
            cartElement.style.position = 'relative';
            cartElement.appendChild(cartCountElement);
        }
    }
    
    cartCountElement.textContent = cartCount;
    cartCountElement.style.display = cartCount > 0 ? 'flex' : 'none';
}

function animateCartIcon() {
    const cartElement = document.querySelector('.navcart');
    if (cartElement) {
        cartElement.style.animation = 'none';
        setTimeout(() => {
            cartElement.style.animation = 'bounce 0.6s ease';
        }, 10);
    }
}

function showCartDetails() {
    if (cartItems.length === 0) {
        showNotification('Your cart is empty. Start shopping!');
        return;
    }
    
    const totalAmount = cartItems.reduce((sum, item) => sum + item.price, 0);
    const cartList = cartItems.map(item => `• ${item.name} - ₹${item.price.toLocaleString()}`).join('\n');
    
    const cartSummary = `🛒 Cart Summary (${cartCount} items)\n\n${cartList}\n\n💰 Total: ₹${totalAmount.toLocaleString()}\n\nWould you like to proceed to checkout?`;
    
    if (confirm(cartSummary)) {
        checkout();
    } else {
        const clearCart = confirm('Would you like to clear your cart?');
        if (clearCart) {
            clearCartItems();
        }
    }
}

function checkout() {
    if (cartItems.length === 0) return;
    
    const total = cartItems.reduce((sum, item) => sum + item.price, 0);
    showNotification(`Processing checkout for ₹${total.toLocaleString()}...`);
    
    setTimeout(() => {
        alert(`Thank you for your order!\nTotal: ₹${total.toLocaleString()}\nDelivery expected in 2-3 business days.`);
        clearCartItems();
    }, 2000);
}

function clearCartItems() {
    cartItems = [];
    cartCount = 0;
    updateCartDisplay();
    saveCartToStorage();
    showNotification('Cart cleared successfully!');
}

function changeLanguage(e) {
    const selectedLang = e.target.value;
    const langMap = {
        'en': 'English',
        'hi': 'हिन्दी',
        'te': 'తెలుగు'
    };
    
    showNotification(`Language changed to ${langMap[selectedLang] || selectedLang}`);
}

function changeLocation() {
    const locations = ['India', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'];
    const currentLocation = document.querySelector('.second').textContent;
    const currentIndex = locations.indexOf(currentLocation);
    const nextIndex = (currentIndex + 1) % locations.length;
    
    document.querySelector('.second').textContent = locations[nextIndex];
    showNotification(`Delivery location changed to ${locations[nextIndex]}`);
}

function updateLocation() {
    // Simulate getting user location
    setTimeout(() => {
        const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai'];
        const randomLocation = locations[Math.floor(Math.random() * locations.length)];
        const locationElement = document.querySelector('.second');
        if (locationElement && locationElement.textContent === 'India') {
            locationElement.textContent = randomLocation;
        }
    }, 2000);
}

function handleSignIn() {
    const isSignedIn = localStorage.getItem('isSignedIn') === 'true';
    
    if (isSignedIn) {
        if (confirm('You are signed in. Would you like to sign out?')) {
            localStorage.removeItem('isSignedIn');
            localStorage.removeItem('userName');
            updateSignInDisplay();
            showNotification('Signed out successfully!');
        }
    } else {
        const userName = prompt('Enter your name to sign in:');
        if (userName && userName.trim()) {
            localStorage.setItem('isSignedIn', 'true');
            localStorage.setItem('userName', userName.trim());
            updateSignInDisplay(userName.trim());
            showNotification(`Welcome back, ${userName.trim()}!`);
        }
    }
}

function updateSignInDisplay(userName = null) {
    const signInElement = document.querySelector('.nav-signin');
    if (!signInElement) return;
    
    const isSignedIn = localStorage.getItem('isSignedIn') === 'true';
    const storedName = localStorage.getItem('userName');
    
    if (isSignedIn && (userName || storedName)) {
        const name = userName || storedName;
        signInElement.innerHTML = `
            <p><span>Hello, ${name}</span></p>
            <b><p class="navsec">Account & Lists</p></b>
        `;
    } else {
        signInElement.innerHTML = `
            <p><span>Hello, sign in</span></p>
            <b><p class="navsec">Account & Lists</p></b>
        `;
    }
}

function handlePanelClick(optionText) {
    const actions = {
        "Today's Deals": () => filterByDeals(),
        "Customer Service": () => showCustomerService(),
        "Registry": () => showNotification('Registry feature coming soon!'),
        "Gift Cards": () => showNotification('Gift Cards available - Special discounts!'),
        "Sell": () => showSellerInfo()
    };
    
    const action = actions[optionText];
    if (action) {
        action();
    } else {
        showNotification(`${optionText} feature coming soon!`);
    }
}

function filterByDeals() {
    const boxes = document.querySelectorAll('.box');
    boxes.forEach(box => {
        const productName = box.querySelector('h2').textContent;
        const product = products[productName];
        
        // Show products under ₹2000 as "deals"
        if (product && product.price < 2000) {
            box.style.display = 'block';
            box.style.background = 'linear-gradient(145deg, #fff, #f9f9f9)';
            box.style.border = '2px solid #ff9f00';
        } else {
            box.style.display = 'none';
        }
    });
    
    showNotification('Showing today\'s best deals under ₹2,000!');
}

function showCustomerService() {
    const services = [
        '📞 Call: 1800-123-4567',
        '💬 Live Chat: Available 24/7',
        '📧 Email: support@amazon.in',
        '❓ FAQ: Most questions answered instantly'
    ];
    
    alert('Customer Service Options:\n\n' + services.join('\n'));
}

function showSellerInfo() {
    const info = `🏪 Start Selling on Amazon!\n\n✅ Reach millions of customers\n✅ Easy setup process\n✅ Marketing support\n✅ Secure payments\n\nInterested in becoming a seller?`;
    
    if (confirm(info)) {
        showNotification('Redirecting to seller registration...');
    }
}

function addSmoothScrolling() {
    // Add CSS for smooth scrolling
    const style = document.createElement('style');
    style.textContent = `
        html { scroll-behavior: smooth; }
        @keyframes bounce {
            0%, 20%, 60%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            80% { transform: translateY(-5px); }
        }
        .notification {
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(145deg, #4caf50, #45a049);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transform: translateX(400px);
            transition: transform 0.3s ease;
            z-index: 10000;
            font-weight: 500;
            max-width: 300px;
            word-wrap: break-word;
        }
        .notification.show {
            transform: translateX(0);
        }
    `;
    document.head.appendChild(style);
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function showNotification(message, type = 'success') {
    // Remove existing notification
    const existingNotification = document.getElementById('notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create new notification
    const notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = 'notification';
    notification.textContent = message;
    
    // Set color based on type
    const colors = {
        success: 'linear-gradient(145deg, #4caf50, #45a049)',
        error: 'linear-gradient(145deg, #f44336, #da190b)',
        info: 'linear-gradient(145deg, #2196f3, #0b7dda)',
        warning: 'linear-gradient(145deg, #ff9800, #f57000)'
    };
    
    notification.style.background = colors[type] || colors.success;
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function saveCartToStorage() {
    try {
        localStorage.setItem('amazonCloneCart', JSON.stringify(cartItems));
        localStorage.setItem('amazonCloneCartCount', cartCount.toString());
    } catch (error) {
        console.warn('Could not save cart to localStorage:', error);
    }
}

function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('amazonCloneCart');
        const savedCount = localStorage.getItem('amazonCloneCartCount');
        
        if (savedCart) {
            cartItems = JSON.parse(savedCart);
        }
        if (savedCount) {
            cartCount = parseInt(savedCount, 10) || 0;
        }
        
        // Update sign in status
        updateSignInDisplay();
    } catch (error) {
        console.warn('Could not load cart from localStorage:', error);
        cartItems = [];
        cartCount = 0;
    }
}

// Additional utility functions
function resetAllFilters() {
    const boxes = document.querySelectorAll('.box');
    boxes.forEach(box => {
        box.style.display = 'block';
        box.style.background = 'white';
        box.style.border = 'none';
    });
    showNotification('All filters cleared!');
}

function getRandomProductRecommendation() {
    const productNames = Object.keys(products);
    const randomProduct = productNames[Math.floor(Math.random() * productNames.length)];
    const product = products[randomProduct];
    
    if (confirm(`💡 Recommendation: ${randomProduct}\nPrice: ₹${product.price.toLocaleString()}\n\nAdd to cart?`)) {
        addToCart(randomProduct);
    }
}

// Auto-initialize features
window.addEventListener('load', function() {
    // Show welcome message after page loads
    setTimeout(() => {
        showNotification('Welcome to Amazon! Start shopping now!', 'info');
    }, 1000);
    
    // Show random recommendation after 10 seconds
    setTimeout(() => {
        if (Math.random() > 0.7) { // 30% chance
            getRandomProductRecommendation();
        }
    }, 10000);
});

// Export functions for global access
window.amazonClone = {
    addToCart,
    showCartDetails,
    clearCartItems,
    resetAllFilters,
    scrollToTop,
    showNotification
};