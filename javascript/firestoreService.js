import { db, storage } from "./firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-storage.js";

const listingsCol = collection(db, "listings");

export async function createListing(data, imageFile) {
  try {
    if (imageFile instanceof File) {
      const path = `listings/${Date.now()}_${imageFile.name.replace(/\s+/g, "_")}`;
      const r = storageRef(storage, path);
      await uploadBytes(r, imageFile);
      data.imageUrl = await getDownloadURL(r);
      data.imagePath = path;
    }
    if (!data.status) data.status = 'pending';
    data.notified = false;
    data.createdAt = serverTimestamp();
    const docRef = await addDoc(listingsCol, data);
    console.info('createListing success', docRef.id);
    return docRef.id;
  } catch (err) {
    console.error('createListing failed', err);
    throw err;
  }
}
export async function createListingSimple(data, imageDataUrl) {
  try {
    if (imageDataUrl) {
      data.imageUrl = imageDataUrl;
    }
    if (!data.status) data.status = 'pending';
    data.notified = false;
    data.createdAt = serverTimestamp();
    const docRef = await addDoc(listingsCol, data);
    console.info('createListingSimple success', docRef.id);
    return docRef.id;
  } catch (err) {
    console.error('createListingSimple failed', err);
    throw err;
  }
}

export function subscribeListings(cb) {
  const q = query(listingsCol, where('status', '==', 'approved'));
  return onSnapshot(q, (snap) => {
    const items = [];
    snap.forEach(d => items.push({ id: d.id, ...d.data() }));
    items.sort((a, b) => {
      const ta = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
      const tb = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
      return tb - ta;
    });
    console.debug('subscribeListings snapshot size:', items.length);
    cb(items);
  }, (err) => {
    console.error('subscribeListings error', err);
    try { cb([]); } catch (e) { }
  });
}

export async function fetchListingsOnce() {
  const q = query(listingsCol, where('status', '==', 'approved'));
  const snap = await getDocs(q);
  const items = [];
  snap.forEach(d => items.push({ id: d.id, ...d.data() }));
  items.sort((a, b) => {
    const ta = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
    const tb = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
    return tb - ta;
  });
  console.debug('fetchListingsOnce returned', items.length);
  return items;
}

export async function getListing(id) {
  const d = await getDoc(doc(db, "listings", id));
  return d.exists() ? { id: d.id, ...d.data() } : null;
}

export async function updateListing(id, updates) {
  await updateDoc(doc(db, "listings", id), updates);
}

export async function deleteListing(id) {
  const dref = doc(db, "listings", id);
  const ds = await getDoc(dref);
  if (!ds.exists()) return;
  const data = ds.data();
  if (data.imagePath) {
    try {
      const imgRef = storageRef(storage, data.imagePath);
      await deleteObject(imgRef);
    } catch (e) {
      console.warn('delete image failed', e);
    }
  }
  await deleteDoc(dref);
}

export async function toggleBookmark(uid, listingId) {
  const userRef = doc(db, "users", uid);
  const ds = await getDoc(userRef);
  const existing = ds.exists() ? (ds.data().bookmarks || []) : [];
  const set = new Set(existing);
  if (set.has(listingId)) set.delete(listingId);
  else set.add(listingId);
  await setDoc(userRef, { bookmarks: Array.from(set) }, { merge: true });
  return Array.from(set);
}

export async function getUserBookmarks(uid) {
  const ds = await getDoc(doc(db, "users", uid));
  return ds.exists() ? (ds.data().bookmarks || []) : [];
}

export async function getListingsByUser(uid) {
  const q = query(listingsCol, where("ownerId", "==", uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  const items = [];
  snap.forEach(d => items.push({ id: d.id, ...d.data() }));
  return items;
}

// Admin: subscribe to pending listings (for moderation)
export function subscribePendingListings(cb) {
  const q = query(listingsCol, where('status', '==', 'pending'));
  return onSnapshot(q, (snap) => {
    const items = [];
    snap.forEach(d => items.push({ id: d.id, ...d.data() }));
    items.sort((a, b) => {
      const ta = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
      const tb = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
      return tb - ta;
    });
    console.debug('subscribePendingListings snapshot size:', items.length);
    cb(items);
  }, (err) => {
    console.error('subscribePendingListings error', err);
    try { cb([]); } catch (e) { }
  });
}

// Admin action: approve listing
export async function approveListing(id, actor = {}) {
  const dref = doc(db, "listings", id);
  await updateDoc(dref, {
    status: 'approved',
    approved: true,
    approvedBy: actor.uid || null,
    approvedAt: serverTimestamp()
  });
}

export async function rejectListing(id, actor = {}, reason = null) {
  const dref = doc(db, "listings", id);
  await updateDoc(dref, {
    status: 'rejected',
    approved: false,
    rejectedBy: actor.uid || null,
    rejectedReason: reason || null,
    rejectedAt: serverTimestamp(),
    notified: false
  });
}


export async function fetchRejectedNotifications(uid) {
  const q = query(listingsCol, where('ownerId', '==', uid), where('status', '==', 'rejected'));
  const snap = await getDocs(q);
  const items = [];
  snap.forEach(d => {
    const data = d.data();
    if (!data.notified) items.push({ id: d.id, ...data });
  });
  return items;
}

export async function markListingNotified(id) {
  await updateDoc(doc(db, 'listings', id), { notified: true });
}
