import { onAuthChanged } from './auth.js';
import { db } from './firebase-config.js';
import { collection, query, where, onSnapshot } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js';
import { deleteListing } from './firestoreService.js';

const container = document.getElementById('myPosts');

onAuthChanged((user) => {
  if (!user) {
    if (container) container.innerHTML = `<div id="emptyState"><h3>Sign in to see your posts</h3></div>`;
    return;
  }

  const q = query(collection(db, 'listings'), where('ownerId', '==', user.uid));
  onSnapshot(q, snap => {
    const items = [];
    snap.forEach(d => items.push({ id: d.id, ...d.data() }));
    render(items);
  });
});

function render(items) {
  if (!container) return;
  if (!items || items.length === 0) {
    container.innerHTML = `<div id="emptyState"><h3>No posts yet</h3><p>You haven't posted any cars for sale yet.</p><a href="sell.html" class="btn-primary">Post Your First Car</a></div>`;
    return;
  }
  container.innerHTML = items.map(p => `
    <div class="car-card" data-id="${p.id}">
      <div class="car-gallery">
        <img src="${p.imageUrl || (p.images && p.images[0]) || 'https://via.placeholder.com/500x300?text=No+Image'}" alt="${p.carModel || ''}" onerror="this.src='https://via.placeholder.com/500x300?text=No+Image'">
        <div class="gallery-thumbs"></div>
      </div>
      <div class="car-info">
        <div class="car-details">
          <h3 class="car-title">${p.carModel || ''} - ${p.year || ''}</h3>
          <p class="car-details">${p.mileage || ''} km | ${p.condition || ''}</p>
          <p class="car-details">${p.description || ''}</p>
          <div class="car-attributes">
            <span>${p.carModel || ''}</span>
            <span>${p.year || ''}</span>
            <span>${p.mileage || ''} km</span>
            <span>${p.condition || ''}</span>
          </div>
          <div class="car-price">$${Number(p.price || 0).toLocaleString()}</div>
        </div>
        <div class="car-actions">
          <button class="primary delete-btn">Delete</button>
          <button class="secondary edit-btn">Edit</button>
        </div>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', async (e) => {
    const id = e.target.closest('.car-card').dataset.id;
    if (!confirm('Delete this listing?')) return;
    try {
      await deleteListing(id);
    } catch (err) {
      console.error(err);
      alert('Failed to delete');
    }
  }));

  container.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', (e) => {
    const id = e.target.closest('.car-card').dataset.id;
    window.location.href = `sell.html?edit=${id}`;
  }));
}
