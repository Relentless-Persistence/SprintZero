import {initializeApp} from "firebase-admin/app"
import {getFirestore} from "firebase-admin/firestore"
import invariant from "tiny-invariant"

declare global {
	// eslint-disable-next-line no-var
	var adminApp: ReturnType<typeof initializeApp>
}

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
invariant(projectId, "NEXT_PUBLIC_FIREBASE_PROJECT_ID is not defined")

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
global.adminApp = global.adminApp ?? initializeApp({projectId})

export const dbAdmin = getFirestore(global.adminApp)
