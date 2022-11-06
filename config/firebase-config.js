import firebase from "firebase";
import "firebase/analytics"

const firebaseConfig = {
  // apiKey: "AIzaSyCEIRGjIAhyoIGqSROfEA88ncg4dFuau_k",
  // authDomain: "sprintzero-657f3.firebaseapp.com",
  // projectId: "sprintzero-657f3",
  // storageBucket: "sprintzero-657f3.appspot.com",
  // messagingSenderId: "561875172363",
  // appId: "1:561875172363:web:72e83818377f28d8405b0e",
  // measurementId: "G-JY3X68KTNN"
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  // firebase.analytics()
}

const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();
const functions = firebase.functions();
const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp();
const analytics = () => {
  if (typeof window !== "undefined") {
    return firebase.analytics();
  } else {
    return null;
  }
};

export { firebase, db, auth, storage, functions, serverTimestamp, analytics };
