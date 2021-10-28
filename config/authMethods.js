import firebase from "./firebase-config";

export const googleProvider = new firebase.auth.GoogleAuthProvider();
export const microsoftProvider = new firebase.auth.OAuthProvider(
  "microsoft.com"
);
