import firebase from "./firebase-config";

export const googleProvider = new firebase.auth.GoogleAuthProvider();
export const microsoftProvider = new firebase.auth.OAuthProvider(
  "microsoft.com"
);
microsoftProvider.setCustomParameters({
  prompt: "consent",
  tenant: process.env.NEXT_PUBLIC_MICROSOFT_TENANT_ID,
});