// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyD6elZViRb-LbyKH2b2NrtmdJUWnfMO_No",
  authDomain: "pranayama-trainer.firebaseapp.com",
  projectId: "pranayama-trainer",
  storageBucket: "pranayama-trainer.firebasestorage.app",
  messagingSenderId: "455359730456",
  appId: "1:455359730456:web:618b637dd168d29034046d",
  measurementId: "G-LDCQR53DG2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// ✅ Export Firestore instance correctly
const db = getFirestore(app);
export { db };