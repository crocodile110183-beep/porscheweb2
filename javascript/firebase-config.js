import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCcMHPiQqjoyF8joyWQInbEmIDLD1EN2TU",
  authDomain: "porscha-40d3e.firebaseapp.com",
  projectId: "porscha-40d3e",
  storageBucket: "porscha-40d3e.appspot.com",
  messagingSenderId: "642618022757",
  appId: "1:642618022757:web:720ebc73c61e045b915f8c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);