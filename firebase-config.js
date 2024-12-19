import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAIP6HAGHnw_8g145aEEmbwFG5fO34pr1I",
  authDomain: "clairdelune-b964b.firebaseapp.com",
  projectId: "clairdelune-b964b",
  storageBucket: "clairdelune-b964b.appspot.com",
  messagingSenderId: "502769962923",
  appId: "1:502769962923:web:e69df17744e2eb5e09ccee",
};

const app = initializeApp(firebaseConfig);

const storage = getStorage(app);

const firestore = getFirestore(app);

export { storage, firestore };
