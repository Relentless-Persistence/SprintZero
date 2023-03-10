import {initializeApp} from "firebase/app"
import {GithubAuthProvider, GoogleAuthProvider, OAuthProvider, connectAuthEmulator, getAuth} from "firebase/auth"
import {connectFirestoreEmulator, getFirestore} from "firebase/firestore"
import invariant from "tiny-invariant"

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
if (process.env.NODE_ENV === `development`) {
	invariant(process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_PORT, `NEXT_PUBLIC_FIREBASE_EMULATOR_PORT is not defined`)
	invariant(
		process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST,
		`NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST is not defined`,
	)
	connectAuthEmulator(auth, process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST, {disableWarnings: true})
	connectFirestoreEmulator(db, `localhost`, parseInt(process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_PORT))
}

export const googleAuthProvider = new GoogleAuthProvider()
googleAuthProvider.setCustomParameters({prompt: `select_account`})
export const appleAuthProvider = new OAuthProvider(`apple.com`)
export const microsoftAuthProvider = new OAuthProvider(`microsoft.com`)
microsoftAuthProvider.setCustomParameters({prompt: `select_account`})
export const githubAuthProvider = new GithubAuthProvider()
