import {collection, doc, getDoc, getDocs, getFirestore, query, setDoc, updateDoc, where} from "firebase/firestore"

let admin = require(`firebase-admin`)

import type {NextApiHandler} from "next"

import {ProductConverter} from "~/types/db/Products"

const serviceAccount = require(`../../keys/firebase-admin-sa-key.json`)
if (!admin.apps.length) {
	try {
		admin.initializeApp({
			credential: admin.credential.cert(serviceAccount),
		})
	} catch (error) {
		console.log(`Firebase admin initialization error`, error.stack)
	}
}

// {
// 	type: `service_account`,
// 	project_id: `sprintzero-657f3`,
// 	private_key_id: `76c20ea19c1ac1d0765056aced5fe8eafeaddea2`,
// 	private_key: `-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDg/XTSk+7lrlyK\ndaltN8V7LC5t3QhLAJ4XsG8r6MAGS27/NuGHwrUYdJ0p55jz8ejPkATJxcEyh0BL\nucoZa/Zeq7OV+u6g+a3041xkdAgRkwkYUOkQJ1x3r3czlnlWMzUXXQXloQsX/yee\n/w66pR8G3KJgZ8K7/+L9AodTg6I0Kf85RRtX5ERCjlUeCN3JijrY9mVBBqceydxf\nA0vuyF1WB50O3lbHFJjPntBjqbf5jpFLB2Bol1nIDM9DSw6Yc3o7tUhc83pD+wz4\nmSEoRfnz1AIwLH/opNCdRZG9QIX4CoBieV7zr33uOmzf62YPpMgz8LzNsGEFcAbh\nzGmBJ3mNAgMBAAECgf9y48iAwk6xZv1EJfZarluExdIsajpccXmQtwAOGOrt7PD/\nWnHyuLDbvZ5ZqV0j01r7diTBvLoZiL/+lEv36WUMAsmQ6JP34cyKvkLitJfJNMmj\nonDSo1wKETo4fgQY72b5lcJmiYMCYvNoa9u2qJMwx5HJq5wy6vr34RyTYrMrvPeA\n7C2+eud+RUd3dYk6PzT1O6orNVFD70bQHZM9m0fMe6+myt0hV4cS9ggfFjrLx35p\nhJJNm/acjmqsOLEYxESapy2ddfxU37fxAClS5a8XfQHV+TiGc+ttfGls/Ue7BXf/\nzRAhLmKQ6AQGetn4c/wSQUu1Cy4bZfe0IDVazj8CgYEA9M6CmEmkOB4pWdrFwCH9\nuhTQP3HIoTdvShxzRt9LTRUGoP7kRtF6M7AQCC4BGth6AnoYew/V43cN1FEtuXwI\n9mnzt24FpDlZ7KzGAZAUNm6hdfDfns6mXc1e8697knVikRCZRb41wU3klio46CCV\nIqt0/wqQ54RlDz81hda5y+sCgYEA60b9jz8HDCoB8Dgn/MPswkfLaaIWTIYwAzbS\nfMRf7jhH77IXhIHp+1Qe0lLxKPEYT4ivoxCsEL/2wjte2NAx8GyIydWaUim7cdse\nCIUIIUbr/011wEHjvHD84v0V06VviBigp8tr8yAfheNKmeGGI8tsWwYKCwzvzxvp\nLZ+9ymcCgYBL6DCkSclKwUdvHh/NGH0VEtkToxNjsc2nPDUeV6SArTFWAFMGBnQO\nzNvbvXAIQ/FpDTTEC7/1fPfjypwT9HrO9UFlsg67wjC460WmPGeYDSuxZ1PfaRI6\n6bA0fUgivJUoh+4OqxD99EoZqdPlXh0AGAv5/Ou7bdjsJlxROKh5qwKBgQDmPKlC\n9bWq1Kzi68FN3FkjYeiP7ZsOtb3kV1Cx4eXSk+bpjIjxFcToOtCSl7IBk7Vrl2Hx\nHA6VsZUDS+AsIcjM8xkFEm+a+dXBvGBui+iB0Ap/4shZJOF8dcEzS+GBJQK41wjY\nSvvPht7yQZOudIC1JItbo9ROLhG6xiBwkkLC/wKBgQCo6iMZ5vYHb5cgM0EmQ0OB\nrhzkZF79LHUIEa2e+NDUqlnOMwITpfyVjeqRIEbSPNDMwpOTl5uiIap+LDbgERO2\noirPd5NI+iWvft5wKcx+vAfE5d/yOuh1bceeQLAbZFaUGv1sbQKp1EKl85S7shQr\nlVxUph+/PDWWbszpQ/j/Ng==\n-----END PRIVATE KEY-----\n`,
// 	client_email: `firebase-adminsdk-gv1p7@sprintzero-657f3.iam.gserviceaccount.com`,
// 	client_id: `113610720841425945794`,
// 	auth_uri: `https://accounts.google.com/o/oauth2/auth`,
// 	token_uri: `https://oauth2.googleapis.com/token`,
// 	auth_provider_x509_cert_url: `https://www.googleapis.com/oauth2/v1/certs`,
// 	client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-gv1p7%40sprintzero-657f3.iam.gserviceaccount.com`,
// }

const db = admin.firestore()
const auth = admin.auth()

//let serviceAccount = require(`../../keys/firebase-admin-sa-key.json`)

// // const app = admin.initializeApp({
// // 	credential: admin.credential.cert(serviceAccount),
// // })

// admin.initializeApp({
// 	credential: admin.credential.cert(serviceAccount),
// })

// const db = admin.firestore()

//const db = admin.firestore()
//const db = getFirestore(`dBa`)
//const db = getFirestore(adminApp)
//export const db = getFirestore(app)

// You can now use Firestore with the authenticated admin user
//const firestore = admin.firestore()

interface AddMemberRequest {
	productId: string
	userId: string
	role: "editor" | "viewer"
}

const handler: NextApiHandler = async (req, res) => {
	const {productId, userId, role} = req.body as AddMemberRequest

	try {
		// let ref = ref(db, `Products/${productId}`)
		//console.log(db)
		//console.log(db.collection(`Products`).doc(productId))
		const productRef = db.collection(`Products`).doc(productId)

		//const productRef = doc(db, `Products`, productId).withConverter(ProductConverter)
		await productRef.update({
			[`members.${userId}`]: {type: role},
		})
		// await updateDoc(productRef, {
		// 	[`members.${userId}`]: {type: role},
		// })

		return res.status(200).json({message: `User added to product members`})
	} catch (error) {
		console.error(error)
		return res.status(500).json({message: `Internal Server Error`})
	}
}

export default handler
