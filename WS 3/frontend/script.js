const API_URL = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize app by fetching data from backend
    fetchMenu();
    renderCart();
    
    // 2. Setup static event listeners
    setupFilters();
    setupModalStaticListeners();
    setupCheckout();
});

// ==========================================
// 1. MENU LOGIC (Backend Integration)
// ==========================================
async function fetchMenu(url = `${API_URL}/menu`) {
    try {
        const response = await fetch(url);
        const menuData = await response.json();
        renderMenu(menuData);
    } catch (error) {
        console.error("Failed to load menu from backend:", error);
    }
}

function renderMenu(menuData) {
    const menuContainer = document.getElementById('menu-container');
    menuContainer.innerHTML = ''; // Clear current grid
    
    menuData.forEach(item => {
        const category = item.veg ? 'veg' : 'non-veg';
        const indicatorClass = item.veg ? 'border-success' : 'border-danger';
        const indicatorBg = item.veg ? 'bg-success' : 'bg-danger';
        
        // Generate a placeholder image based on the item name
        const imgUrl = `https://placehold.co/600x400/eeeeee/31343C?text=${item.name.replace(/ /g, '+')}`;

        const cardHTML = `
        <div class="col menu-item" data-category="${category}" data-price="${item.price}">
            <div class="card h-100 shadow-sm border-0 food-card rounded-4 overflow-hidden">
                <img src="${imgUrl}" class="card-img-top food-img" alt="${item.name}">
                <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title fw-bold mb-0">${item.name}</h5>
                        <span class="${category}-indicator border ${indicatorClass} p-1 rounded-1">
                            <span class="${indicatorBg} rounded-circle d-block" style="width: 8px; height: 8px;"></span>
                        </span>
                    </div>
                    <p class="card-text text-muted small mb-3">Cuisine: ${item.cuisine}</p>
                    <div class="mt-auto d-flex justify-content-between align-items-center">
                        <span class="fs-5 fw-bold text-dark">₹${item.price}</span>
                        <button class="btn btn-primary btn-sm rounded-pill px-3" onclick="addToCart('${item.name}', ${item.price}, 1, this)">Add to Cart</button>
                    </div>
                </div>
            </div>
        </div>
        `;
        menuContainer.innerHTML += cardHTML;
    });

    // Attach click listeners to new images/titles for the Modal
    attachModalDynamicTriggers();
}

// ==========================================
// 2. CART LOGIC (LocalStorage Integration)
// ==========================================
let localCart = JSON.parse(localStorage.getItem('cravebites_cart')) || [];

function saveCartLocally() {
    localStorage.setItem('cravebites_cart', JSON.stringify(localCart));
    renderCart();
}

function renderCart() {
    const cartContainer = document.getElementById('cart-items-container');
    const finalTotalEl = document.getElementById('cart-final-total');
    const cartCountBadge = document.getElementById('cart-count');
    const placeOrderBtn = document.getElementById('place-order-btn');

    cartContainer.innerHTML = '';
    let totalItems = 0;
    let grandTotal = 0;

    if (localCart.length === 0) {
        cartContainer.innerHTML = `
            <div class="text-center text-muted mt-5 d-flex flex-column align-items-center justify-content-center h-100">
                <i class="bi bi-cart-x fs-1 mb-2"></i>
                <p>Your cart is empty.</p>
            </div>
        `;
        finalTotalEl.textContent = '₹0';
        cartCountBadge.textContent = '0';
        placeOrderBtn.disabled = true;
        return;
    }

    localCart.forEach((item, index) => {
        totalItems += item.quantity;
        const itemTotal = item.price * item.quantity;
        grandTotal += itemTotal;

        const imgUrl = `https://placehold.co/600x400/eeeeee/31343C?text=${item.itemName.replace(/ /g, '+')}`;

        cartContainer.innerHTML += `
            <div class="d-flex align-items-center mb-3 bg-white p-3 rounded-4 shadow-sm border-0">
                <img src="${imgUrl}" class="rounded-3 me-3" style="width: 70px; height: 70px; object-fit: cover;" alt="${item.itemName}">
                <div class="flex-grow-1">
                    <h6 class="mb-1 fw-bold text-dark">${item.itemName}</h6>
                    <small class="text-muted d-block mb-1">₹${item.price} per item</small>
                    <div class="fw-bold text-primary">Total: ₹${itemTotal}</div>
                </div>
                <div class="d-flex flex-column align-items-center ms-2 bg-light rounded-pill p-1">
                    <button class="btn btn-sm btn-link text-dark text-decoration-none py-0 px-2" onclick="updateCartQty(${index}, 1)">
                        <i class="bi bi-plus-lg"></i>
                    </button>
                    <span class="small fw-bold my-1">${item.quantity}</span>
                    <button class="btn btn-sm btn-link text-dark text-decoration-none py-0 px-2" onclick="updateCartQty(${index}, -1)">
                        <i class="bi bi-dash-lg"></i>
                    </button>
                </div>
            </div>
        `;
    });

    finalTotalEl.textContent = `₹${grandTotal}`;
    cartCountBadge.textContent = totalItems;
    placeOrderBtn.disabled = false;
}

function addToCart(name, price, qty = 1, btnElement = null) {
    const existingItemIndex = localCart.findIndex(item => item.itemName === name);

    if (existingItemIndex > -1) {
        localCart[existingItemIndex].quantity += qty;
    } else {
        localCart.push({ itemName: name, price: price, quantity: qty });
    }

    saveCartLocally(); // Instantly updates UI and Browser storage

    // Button Visual Feedback
    if (btnElement) {
        const originalText = btnElement.textContent;
        btnElement.textContent = 'Added!';
        btnElement.classList.replace('btn-primary', 'btn-success');
        setTimeout(() => {
            btnElement.textContent = originalText;
            btnElement.classList.replace('btn-success', 'btn-primary');
        }, 1000);
    }
}

function updateCartQty(index, change) {
    localCart[index].quantity += change;
    if (localCart[index].quantity <= 0) {
        localCart.splice(index, 1); // Remove item if quantity hits 0
    }
    saveCartLocally();
}

// ==========================================
// 3. FILTERING & SORTING 
// ==========================================
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // Category Filtering (Calls backend API)
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // UI Button states
            filterBtns.forEach(b => {
                b.classList.remove('active', 'btn-primary');
                b.classList.add('btn-outline-primary');
            });
            btn.classList.remove('btn-outline-primary');
            btn.classList.add('active', 'btn-primary');

            const filterValue = btn.getAttribute('data-filter');
            
            // Trigger backend filter API
            if (filterValue === 'all') fetchMenu();
            else if (filterValue === 'veg') fetchMenu(`${API_URL}/menu/filter?veg=true`);
            else if (filterValue === 'non-veg') fetchMenu(`${API_URL}/menu/filter?veg=false`);
        });
    });

    // Price Sorting (Handled on frontend DOM since API only supports ranges)
    const priceSort = document.getElementById('price-sort');
    priceSort.addEventListener('change', (e) => {
        const sortValue = e.target.value;
        if (sortValue === 'default') return;

        const menuContainer = document.getElementById('menu-container');
        const itemsArray = Array.from(menuContainer.children);

        itemsArray.sort((a, b) => {
            const priceA = parseInt(a.getAttribute('data-price'));
            const priceB = parseInt(b.getAttribute('data-price'));
            return sortValue === 'low' ? priceA - priceB : priceB - priceA;
        });

        // Re-append in sorted order
        itemsArray.forEach(item => menuContainer.appendChild(item));
    });

    // --- Search Bar Logic ---
    const searchForm = document.querySelector('.custom-search');
    const searchInput = searchForm.querySelector('input');

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent the page from refreshing
        
        const query = searchInput.value.toLowerCase().trim();
        const menuContainer = document.getElementById('menu-container');
        const items = Array.from(menuContainer.children);

        let hasResults = false;

        items.forEach(item => {
            const title = item.querySelector('.card-title').textContent.toLowerCase();
            const cuisine = item.querySelector('.card-text').textContent.toLowerCase();
            
            // Check if the search query matches the food name or cuisine
            if (title.includes(query) || cuisine.includes(query)) {
                item.style.display = 'block';
                hasResults = true;
            } else {
                item.style.display = 'none';
            }
        });

        // Smoothly scroll down to the menu section to see the results
        document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
    });
}

// ==========================================
// 4. CHECKOUT & MODAL LOGIC
// ==========================================
function setupCheckout() {
    const placeOrderBtn = document.getElementById('place-order-btn');

    placeOrderBtn.addEventListener('click', async () => {
        if (localCart.length === 0) return;

        // 1. Calculate grand total to send to backend
        const grandTotal = localCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        try {
            // 2. Send the entire local cart to the MongoDB Orders collection
            const response = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: localCart,
                    grandTotal: grandTotal
                })
            });

            if (response.ok) {
                // 3. Hide cart sidebar
                const cartOffcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('cartOffcanvas'));
                cartOffcanvas.hide();

                // 4. Wipe local storage and UI
                localCart = [];
                saveCartLocally();

                // 5. Show Success Modal
                const successModal = new bootstrap.Modal(document.getElementById('orderSuccessModal'));
                successModal.show();
            } else {
                alert("There was an issue placing your order. Please try again.");
            }
        } catch (error) {
            console.error("Error placing order:", error);
            alert("Server error. Check your connection.");
        }
    });
}

function attachModalDynamicTriggers() {
    const itemModalElement = document.getElementById('itemModal');
    let itemModal = bootstrap.Modal.getInstance(itemModalElement) || new bootstrap.Modal(itemModalElement);
    const modalQtyInput = document.querySelector('#itemModal input[type="text"]');

    // Attach to newly rendered images and titles
    document.querySelectorAll('.food-img, .card-title').forEach(trigger => {
        // Clone node trick to prevent duplicate event listeners if menu is re-rendered
        const newTrigger = trigger.cloneNode(true);
        trigger.parentNode.replaceChild(newTrigger, trigger);
        
        newTrigger.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            document.getElementById('itemModalLabel').textContent = card.querySelector('.card-title').textContent;
            document.getElementById('modal-price').textContent = card.querySelector('.fs-5.fw-bold').textContent;
            document.getElementById('modal-desc').textContent = card.querySelector('.card-text').textContent;
            document.getElementById('modal-img').src = card.querySelector('.food-img').src;
            
            modalQtyInput.value = 1; 
            itemModal.show();
        });
    });
}

function setupModalStaticListeners() {
    const modalQtyInput = document.querySelector('#itemModal input[type="text"]');
    const modalAddToCartBtn = document.querySelector('.modal-add-to-cart');

    document.getElementById('btn-minus').addEventListener('click', () => {
        if (modalQtyInput.value > 1) modalQtyInput.value = parseInt(modalQtyInput.value) - 1;
    });
    
    document.getElementById('btn-plus').addEventListener('click', () => {
        modalQtyInput.value = parseInt(modalQtyInput.value) + 1;
    });

    modalAddToCartBtn.addEventListener('click', () => {
        const name = document.getElementById('itemModalLabel').textContent;
        const price = parseInt(document.getElementById('modal-price').textContent.replace('₹', ''));
        const qty = parseInt(modalQtyInput.value);

        // Call our unified addToCart function
        addToCart(name, price, qty, modalAddToCartBtn);
    });
}