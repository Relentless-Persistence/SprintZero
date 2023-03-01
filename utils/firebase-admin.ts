const admin = require(`firebase-admin`)

const serviceAccount = require(`../keys/firebase-admin-sa-key.json`)
if (!admin.apps.length) {
	try {
		admin.initializeApp({
			credential: admin.credential.cert(serviceAccount),
		})
	} catch (error) {
		console.log(`Firebase admin initialization error`, error.stack)
	}
}

export const dbAdmin = admin.firestore()
// export const authAdmin = admin.auth()
