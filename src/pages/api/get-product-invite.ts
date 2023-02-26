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
		const productUnviteRef = dbAdmin.collection(`ProductInvites`).doc(inviteToken.inviteToken)
		const inviteObj = productUnviteRef
			.get()
			.then((doc) => {
				if (doc.exists) {
					console.log(`Document data:`, doc.data())
					const data = doc.data()
					const invite: ProductInvite = {
						productId: data.productId,
						userEmail: data.userEmail,
					}
					return invite
				} else {
					// doc.data() will be undefined in this case
					console.log(`No such document!`)
					return null
				}
			})
			.catch((error) => {
				console.log(`Error getting document:`, error)
			})

		return res.status(200).json({
			productId: inviteObj.productId,
			userEmail: inviteObj.userEmail,
		})
	} catch (error) {
		console.error(error)
		//return null;
		return res.status(500).json({message: `Internal Server Error`})
	}
}

export default handler
