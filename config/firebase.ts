import {initializeApp} from "firebase9/app"
import {getAuth, GoogleAuthProvider, OAuthProvider} from "firebase9/auth"
import {getFirestore} from "firebase9/firestore"

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
	measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

export const googleAuthProvider = new GoogleAuthProvider()
export const appleAuthProvider = new OAuthProvider(`apple.com`)
export const microsoftAuthProvider = new OAuthProvider(`microsoft.com`)
