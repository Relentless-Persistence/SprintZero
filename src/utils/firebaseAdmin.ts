import {initializeApp} from "firebase-admin/app"
import {getFirestore} from "firebase-admin/firestore"

declare global {
	// eslint-disable-next-line no-var
	var adminApp: ReturnType<typeof initializeApp>
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
global.adminApp = global.adminApp ?? initializeApp({projectId: `sprintzero-657f3`})

export const dbAdmin = getFirestore(global.adminApp)
