import {initializeApp} from "firebase/app";
import {getMessaging, getToken, onMessage} from "firebase/messaging";

// firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyCD6YCeoet4qThwUidUl7cjHtBRWWAiYWo",
  authDomain: "tripmate-43645.firebaseapp.com",
  projectId: "tripmate-43645",
  storageBucket: "tripmate-43645.firebasestorage.app",
  messagingSenderId: "693969607728",
  appId: "1:693969607728:web:8819526404ca6a27f2e1f5",
  measurementId: "G-BHV6F38MNG"
};
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
export {getToken, onMessage};