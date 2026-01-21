import { auth } from "./firebase-config.js";
import { fetchRejectedNotifications, markListingNotified } from "./firestoreService.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

export async function signup(email, password, displayName) { 
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) await updateProfile(cred.user, { displayName });
  return cred.user;
}

export async function login(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logout() {
  await signOut(auth);
}




export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export function onAuthChanged(cb) {
  return onAuthStateChanged(auth, (u) => cb(u));
}

export function getCurrentUser() {
  return auth.currentUser;
}


const signupForm = document.getElementById("signup");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const emailEl = signupForm.querySelector('input[name="email"]') || signupForm.querySelector('input[type="email"]');
    const passwordEl = signupForm.querySelector('input[name="password"]') || signupForm.querySelectorAll('input[type="password"]')[0];
    const confirmEl = signupForm.querySelector('input[name="confirmPassword"]') || signupForm.querySelectorAll('input[type="password"]')[1];

    const email = emailEl?.value?.trim() || '';
    const password = passwordEl?.value || '';
    const confirm = confirmEl?.value || '';

    if (!email) return alert('Enter an email');
    if (!password) return alert('Enter a password');
    if (password !== confirm) return alert('Passwords do not match');

    try {
      await signup(email, password);
      window.location.href = "../market.html";
    } catch (err) {
      console.error(err);
      alert(err.message || "Sign up failed");
    }
  });
}

const loginForm = document.getElementById('login');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailEl = loginForm.querySelector('input[name="email"]') || loginForm.querySelector('input[type="email"]');
    const passwordEl = loginForm.querySelector('input[name="password"]') || loginForm.querySelector('input[type="password"]');
    const email = emailEl?.value?.trim() || '';
    const password = passwordEl?.value || '';
    if (!email) return alert('Enter an email');
    if (!password) return alert('Enter a password');
    try {
      await login(email, password);
      try { localStorage.setItem('loggedIn', email); } catch (e) { }
      window.location.href = '../market.html';
    } catch (err) {
      console.error(err);
      alert(err.message || 'Login failed');
    }
  });
}

function updateUserUI(u) {
  try {
    const avatar = document.getElementById('userAvatar');
    const item1 = document.getElementById('dropdown-item-1');
    const item2 = document.getElementById('dropdown-item-2');
    if (u) {
      if (avatar) avatar.src = u.photoURL || './image/www.porsche.com-12.png';
      if (item1) { item1.textContent = u.displayName || u.email; item1.href = '../mypost.html'; }
      if (item2) {
        item2.textContent = 'Logout';
        item2.href = '#';
        item2.onclick = async (ev) => { ev.preventDefault(); try { await logout(); localStorage.removeItem('loggedIn'); window.location.href = './login.html'; } catch (err) { console.error(err); } };
      }
    } else {
      if (avatar) avatar.src = './image/www.porsche.com-12.png';
      if (item1) { item1.textContent = 'Sign in'; item1.href = '../login.html'; item1.onclick = null; }
      if (item2) { item2.textContent = 'Register'; item2.href = '../signin.html'; item2.onclick = null; }
    }
  } catch (e) { console.error(e); }
}

onAuthChanged((u) => {
  try {
    if (u) {
      localStorage.setItem('loggedIn', u.email);
    } else {
      localStorage.removeItem('loggedIn');
    }
  } catch (e) { }
  updateUserUI(u);
});

onAuthChanged(async (u) => {
  if (!u) return;
  try {
    const rejects = await fetchRejectedNotifications(u.uid);
    if (rejects && rejects.length > 0) {
      const lines = rejects.map(r => `Listing: ${r.carModel || r.title || r.id} — Reason: ${r.rejectedReason || 'Not specified'}`);
      alert('Your listing(s) were declined:\n\n' + lines.join('\n'));
      for (const r of rejects) {
        try { await markListingNotified(r.id); } catch (e) { console.error('markListingNotified failed', e); }
      }
    }
  } catch (e) {
    console.error('fetchRejectedNotifications failed', e);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  try {
    const cur = getCurrentUser && typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    updateUserUI(cur);
  } catch (e) {}
  try {
    const gbtn = document.getElementById('googleSignIn');
    if (gbtn) {
      gbtn.addEventListener('click', async (ev) => {
        ev.preventDefault();
        try {
          const user = await signInWithGoogle();
          try { localStorage.setItem('loggedIn', user.email || ''); } catch (e) { }
          window.location.href = '../market.html';
        } catch (err) {
          console.error('Google sign-in failed', err);
          alert(err && err.message ? err.message : 'Google sign-in failed');
        }
      });
    }
  } catch (e) {}
});

window.googleSignIn = signInWithGoogle;

document.addEventListener('click', (e) => {
  try {
    const userButton = document.querySelector('.user-button');
    const dropdown = document.querySelector('.user-dropdown');
    if (!userButton || !dropdown) return;
    if (userButton.contains(e.target)) {
      dropdown.classList.toggle('show');
      return;
    }
    if (!dropdown.contains(e.target)) dropdown.classList.remove('show');
  } catch (err) {}
});