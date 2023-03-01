import {collection, doc, getDoc, getDocs, getFirestore, query, setDoc, updateDoc, where} from "firebase/firestore"
import admin from "firebase-admin"
import firestore from "firebase-admin"

import type {NextApiHandler} from "next"

import {ProductConverter} from "~/types/db/Products"
import {dBa} from "~/utils/firebase"
let serviceAccount = require(`../../keys/firebase-admin-sa-key.json`)

// // const app = admin.initializeApp({
// // 	credential: admin.credential.cert(serviceAccount),
// // })

// admin.initializeApp(
// 	{
// 		credential: admin.credential.cert(serviceAccount),
// 	},
// 	`dBa`,
// )

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
		const productRef = doc(dBa, `Products`, productId).withConverter(ProductConverter)
		await updateDoc(productRef, {
			[`members.${userId}`]: {type: role},
		})

		return res.status(200).json({message: `User added to product members`})
	} catch (error) {
		console.error(error)
		return res.status(500).json({message: `Internal Server Error`})
	}
}

export default handler
