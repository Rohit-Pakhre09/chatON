import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAhLiIcx9IlnRegPB7xdW47_eDG6aR6Qv0",
    authDomain: "chaton-b3f73.firebaseapp.com",
    projectId: "chaton-b3f73",
    storageBucket: "chaton-b3f73.firebasestorage.app",
    messagingSenderId: "107531974325",
    appId: "1:107531974325:web:c22d0cf4f29c2a48cfb0fc",
    measurementId: "G-86GJ5HD13V"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);