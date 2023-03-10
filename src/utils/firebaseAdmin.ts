import {initializeApp} from "firebase-admin/app"
import {getAuth} from "firebase-admin/auth"
import {getFirestore} from "firebase-admin/firestore"
import "server-only"
import invariant from "tiny-invariant"

declare global {
	// eslint-disable-next-line no-var
	var adminApp: ReturnType<typeof initializeApp>
}

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
invariant(projectId, `NEXT_PUBLIC_FIREBASE_PROJECT_ID is not defined`)

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
global.adminApp = global.adminApp ?? initializeApp({projectId})

export const appAdmin = global.adminApp
export const authAdmin = getAuth(global.adminApp)
export const dbAdmin = getFirestore(global.adminApp)
