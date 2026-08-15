document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Category Filtering ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const menuItems = document.querySelectorAll('.menu-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state on buttons
            filterBtns.forEach(b => b.classList.remove('active', 'btn-primary'));
            filterBtns.forEach(b => b.classList.add('btn-outline-primary'));
            btn.classList.remove('btn-outline-primary');
            btn.classList.add('active', 'btn-primary');

            const filterValue = btn.getAttribute('data-filter');

            menuItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filterValue === 'all' || filterValue === category) {
                    // Show item
                    item.style.display = 'block';
                    // Small delay to allow display:block to apply before transitioning opacity
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    // Instantly hide to prevent both categories from displaying at once
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.95)';
                    item.style.display = 'none'; 
                }
            });
        });
    });

    // --- 2. Price Sorting ---
    const priceSort = document.getElementById('price-sort');
    const menuContainer = document.getElementById('menu-container');

    priceSort.addEventListener('change', (e) => {
        const sortValue = e.target.value;
        if (sortValue === 'default') return;

        // Convert NodeList to Array for sorting
        const itemsArray = Array.from(menuItems);

        itemsArray.sort((a, b) => {
            const priceA = parseInt(a.getAttribute('data-price'));
            const priceB = parseInt(b.getAttribute('data-price'));

            return sortValue === 'low' ? priceA - priceB : priceB - priceA;
        });

        // Re-append sorted items to the container
        itemsArray.forEach(item => menuContainer.appendChild(item));
    });

    // --- 3. Full Cart & Checkout Logic ---
    let cart = []; // Array to store our cart items
    const cartCountBadge = document.getElementById('cart-count');
    const cartContainer = document.getElementById('cart-items-container');
    const finalTotalEl = document.getElementById('cart-final-total');
    const placeOrderBtn = document.getElementById('place-order-btn');

    // Function to re-render the cart HTML whenever something changes
    function updateCartUI() {
        cartContainer.innerHTML = ''; // Clear current UI
        let finalTotal = 0;
        let totalItems = 0;

        if (cart.length === 0) {
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

        // Loop through array and build HTML for each item
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            finalTotal += itemTotal;
            totalItems += item.quantity;

            cartContainer.innerHTML += `
                <div class="d-flex align-items-center mb-3 bg-white p-3 rounded-4 shadow-sm border-0">
                    <img src="${item.img}" class="rounded-3 me-3" style="width: 70px; height: 70px; object-fit: cover;" alt="${item.name}">
                    <div class="flex-grow-1">
                        <h6 class="mb-1 fw-bold text-dark">${item.name}</h6>
                        <small class="text-muted d-block mb-1">₹${item.price} per item</small>
                        <div class="fw-bold text-primary">Total: ₹${itemTotal}</div>
                    </div>
                    <div class="d-flex flex-column align-items-center ms-2 bg-light rounded-pill p-1">
                        <button class="btn btn-sm btn-link text-dark text-decoration-none py-0 px-2 js-increase" data-index="${index}">
                            <i class="bi bi-plus-lg"></i>
                        </button>
                        <span class="small fw-bold my-1">${item.quantity}</span>
                        <button class="btn btn-sm btn-link text-dark text-decoration-none py-0 px-2 js-decrease" data-index="${index}">
                            <i class="bi bi-dash-lg"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        // Update footer totals
        finalTotalEl.textContent = `₹${finalTotal}`;
        cartCountBadge.textContent = totalItems;
        placeOrderBtn.disabled = false;

        // Attach listeners to newly created + / - buttons
        attachQuantityListeners();
    }

    function attachQuantityListeners() {
        document.querySelectorAll('.js-increase').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.currentTarget.getAttribute('data-index');
                cart[idx].quantity++;
                updateCartUI();
            });
        });

        document.querySelectorAll('.js-decrease').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.currentTarget.getAttribute('data-index');
                if (cart[idx].quantity > 1) {
                    cart[idx].quantity--;
                } else {
                    cart.splice(idx, 1); // Remove from array if quantity hits 0
                }
                updateCartUI();
            });
        });
    }

    // Helper to add an item to the array
    function addToCart(name, price, img, qty) {
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += qty; // Add to existing quantity
        } else {
            cart.push({ name, price, img, quantity: qty }); // Create new entry
        }
        updateCartUI();
    }

    // --- 4. Event Listeners for Adding Items ---

    // A. Add to cart from the Menu Cards grid
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            const name = card.querySelector('.card-title').textContent;
            const price = parseInt(card.querySelector('.fs-5.fw-bold').textContent.replace('₹', ''));
            const img = card.querySelector('.food-img').src;

            addToCart(name, price, img, 1);

            // Button visual feedback
            const originalText = btn.textContent;
            btn.textContent = 'Added!';
            btn.classList.replace('btn-primary', 'btn-success');
            setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.replace('btn-success', 'btn-primary');
            }, 1000);
        });
    });

    // B. Item Details Modal Logic & Add to Cart
    const itemModalElement = document.getElementById('itemModal');
    const itemModal = new bootstrap.Modal(itemModalElement);
    const modalQtyInput = document.querySelector('#itemModal input[type="text"]');

    // Open modal and populate data
    document.querySelectorAll('.food-img, .card-title').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            document.getElementById('itemModalLabel').textContent = card.querySelector('.card-title').textContent;
            document.getElementById('modal-price').textContent = card.querySelector('.fs-5.fw-bold').textContent;
            document.getElementById('modal-desc').textContent = card.querySelector('.card-text').textContent;
            document.getElementById('modal-img').src = card.querySelector('.food-img').src;
            
            modalQtyInput.value = 1; // Reset quantity to 1 on open
            itemModal.show();
        });
    });

    // Modal +/- quantity buttons
    document.getElementById('btn-minus').addEventListener('click', () => {
        if (modalQtyInput.value > 1) modalQtyInput.value = parseInt(modalQtyInput.value) - 1;
    });
    document.getElementById('btn-plus').addEventListener('click', () => {
        modalQtyInput.value = parseInt(modalQtyInput.value) + 1;
    });

    // Add to cart from inside the Modal
    document.querySelector('.modal-add-to-cart').addEventListener('click', () => {
        const name = document.getElementById('itemModalLabel').textContent;
        const price = parseInt(document.getElementById('modal-price').textContent.replace('₹', ''));
        const img = document.getElementById('modal-img').src;
        const qty = parseInt(modalQtyInput.value);

        addToCart(name, price, img, qty);
    });

    // --- 5. Place Order Logic ---
    placeOrderBtn.addEventListener('click', () => {
        // 1. Hide the sliding cart
        const cartOffcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('cartOffcanvas'));
        cartOffcanvas.hide();

        // 2. Show the Success Popup
        const successModal = new bootstrap.Modal(document.getElementById('orderSuccessModal'));
        successModal.show();

        // 3. Clear the cart data
        cart = [];
        updateCartUI();
    });

    // Optional: Connect modal "Add to Cart" to the cart badge logic
    const modalAddToCartBtn = document.querySelector('.modal-add-to-cart');
    modalAddToCartBtn.addEventListener('click', () => {
        cartCount++;
        cartCountBadge.textContent = cartCount;
    });
});