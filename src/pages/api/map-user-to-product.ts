import type {NextApiHandler} from "next"

import {dbAdmin} from "~/utils/firebase-admin"

interface AddMemberRequest {
	productId: string
	userId: string
	role: "editor" | "viewer"
}

const handler: NextApiHandler = async (req, res) => {
	const {productId, userId, role} = req.body as AddMemberRequest

	try {
		const productRef = dbAdmin.collection(`Products`).doc(productId)
		await productRef.update({
			[`members.${userId}`]: {type: role},
		})

		return res.status(200).json({message: `User is mapped to product members successfully.`})
	} catch (error) {
		console.error(error)
		return res.status(500).json({message: `Internal Server Error`})
	}
}

export default handler
