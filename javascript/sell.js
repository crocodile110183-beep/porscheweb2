import { onAuthChanged, getCurrentUser } from "./auth.js";
import { createListingSimple, getListing, updateListing } from "./firestoreService.js";

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('sellForm');
  if (!form) return;

  const setDisabled = (disabled) => {
    form.querySelectorAll('input, select, textarea, button').forEach(el => el.disabled = disabled);
  };
  setDisabled(true);

  onAuthChanged((user) => {
    setDisabled(!user);
    if (!user) {
      if (!form.querySelector('.auth-warning')) {
        const p = document.createElement('p');
        p.className = 'auth-warning';
        p.textContent = 'Please sign in to post a listing.';
        form.prepend(p);
      }
    } else {
      form.querySelector('.auth-warning')?.remove();
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) return alert('Sign in to post a listing');

    const model = document.getElementById('model')?.value?.trim() || '';
    const year = parseInt(document.getElementById('year')?.value || '0');
    const mileage = parseInt(document.getElementById('mileage')?.value || '0');
    const condition = document.getElementById('condition')?.value?.trim() || '';
    const description = document.getElementById('description')?.value?.trim() || '';
    const price = parseFloat(document.getElementById('price')?.value || '0');
    const phone = document.getElementById('phone')?.value?.trim() || '';

  const fileInput = document.getElementById('img1') || form.querySelector('input[type="file"][name="image"]');
  const imageFile = fileInput?.files?.[0] || null;

    if (!model || !year || !mileage || !condition || !description || !price || !phone) {
      return alert('Please fill in all required fields');
    }

    if (year < 1950 || year > 2030) return alert('Enter a valid year');
    if (mileage < 0) return alert('Mileage cannot be negative');
    if (price <= 0) return alert('Price must be greater than 0');

    const data = {
      carModel: model,
      year,
      mileage,
      condition,
      description,
      price,
      phone,
      ownerId: user.uid,
      ownerEmail: user.email,
      ownerName: user.displayName || user.email,
      isBooked: false
    };

    try {
      let imageDataUrl = null;
      if (imageFile) {
        imageDataUrl = await new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload = () => res(reader.result);
          reader.onerror = (e) => rej(e);
          reader.readAsDataURL(imageFile);
        });
      }
      if (window.editingId) {
        const updates = { ...data };
        if (imageDataUrl) updates.imageUrl = imageDataUrl;
        await updateListing(window.editingId, updates);
        alert('Listing updated');
      } else {
        await createListingSimple(data, imageDataUrl);
        alert('Your Porsche listing has been submitted for review.');
      }
      window.location.href = './mypost.html';
    } catch (err) {
      console.error(err);
      alert('Failed to post listing: ' + (err && err.message ? err.message : 'unknown'));
    }
  });

  const params = new URLSearchParams(window.location.search);
  const editId = params.get('edit');
  if (editId) {
    window.editingId = editId;
    (async () => {
      try {
        const doc = await getListing(editId);
        if (!doc) return alert('Listing not found');
        document.getElementById('model').value = doc.carModel || '';
        document.getElementById('year').value = doc.year || '';
        document.getElementById('mileage').value = doc.mileage || '';
        document.getElementById('condition').value = doc.condition || '';
        document.getElementById('description').value = doc.description || '';
        document.getElementById('price').value = doc.price || '';
        document.getElementById('phone').value = doc.phone || '';
        const previewContainer = document.createElement('div');
        previewContainer.style.margin = '8px 0 12px 0';
        const img1 = document.getElementById('img1');
        if (img1) img1.parentNode.insertBefore(previewContainer, img1.nextSibling);
        if (doc.imageUrl) {
          previewContainer.innerHTML = `<img src="${doc.imageUrl}" style="max-width:220px; max-height:140px; border-radius:6px; object-fit:cover" alt="preview">`;
        }
      } catch (err) {
        console.error('prefill failed', err);
      }
    })();
  }

  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.addEventListener('blur', () => input.classList.remove('error'));
    input.addEventListener('input', () => input.classList.remove('error'));
  });
});
const style = document.createElement('style');
style.textContent = `
  .form-group input.error, .form-group select.error, .form-group textarea.error { border-color: #dc3545; box-shadow: 0 0 0 0.2rem rgba(220,53,69,.25); }
`;
document.head.appendChild(style);