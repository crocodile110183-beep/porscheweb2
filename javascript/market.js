import { subscribeListings, toggleBookmark, getUserBookmarks, fetchListingsOnce } from "./firestoreService.js";
import { onAuthChanged, getCurrentUser } from "./auth.js";

const container = document.getElementById("marketList");
const carCountElement = document.getElementById("carCount");
const emptyState = document.getElementById("emptyState");
let currentItems = [];
let userBookmarks = [];
let currentUser = null;

function formatPrice(price) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(price);
}

function getCarImages(post) {
    const defaultImages = [
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=400&fit=crop&crop=center",
    ];

    if (post.images && post.images.length > 0) {
        return post.images;
    }
    if (post.imageUrl) {
        return [post.imageUrl];
    }
    return defaultImages;
}

function renderPosts(list) {
    if (!container) return;

    container.innerHTML = "";

    if (!list || list.length === 0) {
        emptyState && (emptyState.style.display = "block");
        carCountElement && (carCountElement.textContent = "0");
        return;
    }

    emptyState && (emptyState.style.display = "none");
    carCountElement && (carCountElement.textContent = list.length);

    list.forEach((post, idx) => {
        const images = getCarImages(post);
        const isBooked = post.isBooked || false;
        const bookmarked = userBookmarks.includes(post.id);

        const carCard = document.createElement("div");
        carCard.className = "car-card";
        carCard.style.borderBottom = "1px solid #e5e5e5";

        carCard.innerHTML = `
            <div class="car-gallery">
                <img src="${images[0]}" alt="${post.carModel || ""} ${post.year || ""}" loading="lazy" id="main-image-${post.id}">
                <div class="gallery-thumbs">
                    <img src="${images[0]}" alt="Image 1" loading="lazy" onclick="changeMainImage('${post.id}', '${images[0]}')">
                    <img src="${images[1] || images[0]}" alt="Image 2" loading="lazy" onclick="changeMainImage('${post.id}', '${images[1] || images[0]}')">
                    <img src="${images[2] || images[0]}" alt="Image 3" loading="lazy" onclick="changeMainImage('${post.id}', '${images[2] || images[0]}')">
                </div>
            </div>
            
            <div class="car-info">
                <div>
                    <h3 class="car-title">${post.carModel || ""} - ${post.year || ""}</h3>
                    <p class="car-details">${post.mileage ? `${Number(post.mileage).toLocaleString()} km` : 'Unknown km'} | ${post.condition || ''}</p>
                    <p class="car-details">${post.description || 'No description'}</p>
                    <div class="car-attributes">
                        <span>Year: ${post.year || ""}</span>
                        <span>Mileage: ${post.mileage ? Number(post.mileage).toLocaleString() : 'N/A'}</span>
                        <span>Status: ${isBooked ? 'Booked' : 'Available'}</span>
                        ${post.location ? `<span>Location: ${post.location}</span>` : ''}
                    </div>
                    <div class="car-price">${formatPrice(post.price || 0)}</div>
                    <p style="margin: 0 0 12px 0;"><strong>Contact:</strong> ${post.phone || 'N/A'}</p>
                    <p style="margin: 0;"><strong>Email:</strong> ${post.ownerEmail || 'N/A'}</p>
                </div>
                
                <div class="car-actions">
                    <button class="secondary bookmark-btn ${bookmarked ? 'bookmarked' : ''}">${bookmarked ? '\u2605 Bookmarked' : '\u2606 Bookmark Car'}</button>
                    ${!isBooked ? `<button class="primary book-btn" style="background: #d4a574;">Book Now</button>` : `<button class="secondary" disabled style="opacity: 0.6; cursor: not-allowed;">Booked</button>`}
                </div>
            </div>
        `;

        carCard.dataset.index = idx;
        container.appendChild(carCard);
    });

    attachListingHandlers();
}

function changeMainImage(postId, src) {
    const mainImage = document.getElementById(`main-image-${postId}`);
    if (mainImage) mainImage.src = src;
}

function applyFilters() {
    const yearFilter = document.getElementById("filterYear")?.value;
    const priceFilter = document.getElementById("filterPrice")?.value;
    const modelFilter = document.getElementById("filterModel")?.value;
    const availableOnly = document.getElementById("filterAvailable")?.checked;
    const bookmarkedOnly = document.getElementById("filterBookmarked")?.checked;

    let filtered = [...currentItems];

    if (yearFilter) filtered = filtered.filter((p) => String(p.year) === String(yearFilter));
    if (priceFilter) filtered = filtered.filter((p) => Number(p.price) <= Number(priceFilter));
    if (modelFilter) filtered = filtered.filter((p) => (p.carModel || '').toLowerCase().includes(String(modelFilter).toLowerCase()));
    if (availableOnly) filtered = filtered.filter((p) => !p.isBooked);
    if (bookmarkedOnly) filtered = filtered.filter((p) => userBookmarks.includes(p.id));

    renderPosts(filtered);
}

function clearFilters() {
    document.getElementById("filterYear") && (document.getElementById("filterYear").value = "");
    document.getElementById("filterPrice") && (document.getElementById("filterPrice").value = "");
    document.getElementById("filterModel") && (document.getElementById("filterModel").value = "");
    document.getElementById("filterAvailable") && (document.getElementById("filterAvailable").checked = false);
    document.getElementById("filterBookmarked") && (document.getElementById("filterBookmarked").checked = false);
    renderPosts(currentItems);
}

document.getElementById("applyFilter")?.addEventListener('click', applyFilters);
document.getElementById("clearFilter")?.addEventListener('click', clearFilters);
let filterTimeout;
function debounceFilter() { clearTimeout(filterTimeout); filterTimeout = setTimeout(applyFilters, 400); }
document.getElementById("filterYear")?.addEventListener("input", debounceFilter);
document.getElementById("filterPrice")?.addEventListener("input", debounceFilter);
document.getElementById("filterModel")?.addEventListener("change", applyFilters);
document.getElementById("filterAvailable")?.addEventListener("change", applyFilters);
document.getElementById("filterBookmarked")?.addEventListener("change", applyFilters);

function toggleFilters() { const filterContent = document.querySelector('.filter-content'); if (!filterContent) return; const isHidden = filterContent.style.display === 'none'; filterContent.style.display = isHidden ? 'block' : 'none'; const button = document.querySelector('.filter-toggle'); if (button) button.textContent = isHidden ? 'Hide Filters' : 'Show/Hide Filters'; }
function initializeMobileFilters() { if (window.innerWidth < 768) { const fc = document.querySelector('.filter-content'); if (fc) fc.style.display = 'none'; } }
window.addEventListener('resize', function () { const fc = document.querySelector('.filter-content'); if (!fc) return; if (window.innerWidth >= 768) { fc.style.display = 'block'; const tb = document.querySelector('.filter-toggle'); if (tb) tb.textContent = 'Show/Hide Filters'; } else initializeMobileFilters(); });

onAuthChanged(async (u) => { currentUser = u; userBookmarks = u ? await getUserBookmarks(u.uid) : []; renderPosts(currentItems); });
const unsub = subscribeListings(async (items) => {
    currentItems = items;
    renderPosts(items);
    if (!items || items.length === 0) {
        try {
            const one = await fetchListingsOnce();
            if (one && one.length > 0) {
                currentItems = one;
                renderPosts(one);
            }
        } catch (err) {
            console.error('fetchListingsOnce failed', err);
        }
    }
});

window.bookmark = async (id) => { const user = getCurrentUser(); if (!user) return alert('Sign in to bookmark'); await toggleBookmark(user.uid, id); };
window.book = (id) => alert('Booking flow not implemented.');
window.changeMainImage = changeMainImage;
window.toggleFilters = toggleFilters;

function attachListingHandlers() {
    const cards = Array.from(document.querySelectorAll('.car-card'));
    cards.forEach((card) => {
        const idx = Number(card.dataset.index);
        const post = currentItems[idx];
        if (!post) return;

        const bookmarkBtn = card.querySelector('.bookmark-btn');
        if (bookmarkBtn) {
            bookmarkBtn.replaceWith(bookmarkBtn.cloneNode(true));
            const newBtn = card.querySelector('.bookmark-btn');
            newBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (!currentUser) return alert('Please sign in to bookmark cars.');
                try {
                    const updated = await toggleBookmark(currentUser.uid, post.id);
                    userBookmarks = Array.isArray(updated) ? updated : await getUserBookmarks(currentUser.uid);
                    try { applyFilters(); } catch (e) { renderPosts(currentItems); }
                } catch (err) {
                    console.error('bookmark toggle failed', err);
                    alert('Could not update bookmark.');
                }
            });
        }

        const bookBtn = card.querySelector('.book-btn');
        if (bookBtn) {
            bookBtn.replaceWith(bookBtn.cloneNode(true));
            const newBook = card.querySelector('.book-btn');
            newBook.addEventListener('click', (e) => {
                e.preventDefault();
                if (!currentUser) return alert('Please sign in to book a car.');
                alert('Booking flow not implemented yet. Owner: ' + (post.ownerEmail || 'N/A'));
            });
        }
    });
}


