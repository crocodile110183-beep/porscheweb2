// post_submit.js
import './javascript/firebase-config.js'; // must export `db`
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js';
import {
  collection,
  addDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js';
import { db } from './javascript/firebase-config.js';

const auth = getAuth();

const form = document.getElementById('fCreate'); // your create form id
if (form) {
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();

    const model = (document.getElementById('m')?.value || '').trim();
    const year = Number(document.getElementById('y')?.value || 0);
    const price = Number(document.getElementById('p')?.value || 0);
    const phone = (document.getElementById('ph')?.value || '').trim();
    const imageUrl = (document.getElementById('img')?.value || '').trim();

    if (!model || !year || !price) {
      alert('Please fill required fields (model, year, price).');
      return;
    }

    const user = auth.currentUser;
    const listing = {
      carModel: model,
      year,
      price,
      phone,
      imageUrl: imageUrl || null,
      ownerId: user ? user.uid : null,
      ownerEmail: user ? user.email : 'anonymous',
      ownerName: user ? (user.displayName || user.email) : 'anonymous',
      createdAt: serverTimestamp(),
      status: 'pending',
      moderation: {
        requestedAt: serverTimestamp()
      }
    };

    try {
      const col = collection(db, 'listings');
      await addDoc(col, listing);
      alert('Your posting has been submitted and will be reviewed by an admin.');
      form.reset();
    } catch (err) {
      console.error('submit failed', err);
      alert('Submit failed. Check console.');
    }
  });
}
