import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCXb9ydTLMFCbYb_jLxBMHBk_p46hml-TY",
  authDomain: "medi-hack-3ae0d.firebaseapp.com",
  projectId: "medi-hack-3ae0d",
  storageBucket: "medi-hack-3ae0d.firebasestorage.app",
  messagingSenderId: "989762695899",
  appId: "1:989762695899:web:0cee65626105ed2bc592fe"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app)
export const db = getFirestore(app);
export {auth};
export default app