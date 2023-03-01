import admin from "firebase-admin"

const serviceAccount = require(`../../keys/firebase-admin-sa-key.json`)
if (!admin.apps.length) {
	try {
		admin.initializeApp({
			// not necessary for non-Google environment (e.g. localhost)
			credential: admin.credential.cert(serviceAccount),
		})
	} catch (error) {
		console.log(`Firebase admin initialization error`, error.stack)
	}
}

export const dbAdmin = admin.firestore()
export const authAdmin = admin.auth()
