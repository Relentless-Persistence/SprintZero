import type {NextApiHandler} from "next"

import {dbAdmin} from "~/utils/firebase-admin"

interface ProductInvite {
	productId: string
	userEmail: string
}

const handler: NextApiHandler = async (req, res) => {
	const inviteToken = req.query

	try {
		console.log(`logging invite token received on the API`, inviteToken.inviteToken)
		const productInviteRef = dbAdmin.collection(`ProductInvites`).doc(inviteToken.inviteToken)
		const doc = await productInviteRef.get()

		if (doc.exists) {
			console.log(`Document data:`, doc.data())
			const data = doc.data()
			const invite: ProductInvite = {
				productId: data.productId,
				userEmail: data.userEmail,
			}
			res.status(200).json({
				productId: invite.productId,
				userEmail: invite.userEmail,
			})
		} else {
			// doc.data() will be undefined in this case
			console.log(`No such document!`)
			res.status(401).json({message: `Internal Server Error`})
		}
	} catch (error) {
		console.error(error)
		res.status(500).json({message: `Internal Server Error`})
	}
}

export default handler
