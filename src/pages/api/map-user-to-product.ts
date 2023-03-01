import type {NextApiHandler} from "next"

import {dbAdmin} from "utils/firebase-admin"
import {ProductConverter} from "~/types/db/Products"

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
		//const productRef = doc(dbAdmin, `Products`, productId).withConverter(ProductConverter)
		const productRef = dbAdmin.collection(`Products`).doc(productId).withConverter(ProductConverter)
		await productRef.update({
			[`members.${userId}`]: {type: role},
		})

		return res.status(200).json({message: `User added to product members`})
	} catch (error) {
		console.error(error)
		return res.status(500).json({message: `Internal Server Error`})
	}
}

export default handler
