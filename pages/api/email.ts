import {google} from "googleapis"
import nodemailer from "nodemailer"

const OAuth2 = google.auth.OAuth2

import type {NextApiHandler, NextApiRequest, NextApiResponse} from "next"

const OAuth2_client = new OAuth2(
	process.env.NEXT_PUBLIC_GOOGLE_CLIENTID,
	process.env.NEXT_PUBLIC_GOOGLE_CLIENTSECRET,
	`https://developers.google.com/oauthplayground`,
)
OAuth2_client.setCredentials({
	refresh_token: process.env.NEXT_PUBLIC_GOOGLE_REFRESHTOKEN,
})

interface MailOption {
	to: string
	from: string
	subject: string
	text?: string
	html: string
}


const handler: NextApiHandler = (req: NextApiRequest, res: NextApiResponse) => {
	const accessToken = await OAuth2_client.getAccessToken()

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const {to, from, subject, text = ``, html}: MailOption = req.body

	const transporter = nodemailer.createTransport({
		service: `gmail`,
		auth: {
			type: `OAuth2`,
			user: `no-reply@sprintzero.app`,
			clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENTID,
			clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENTSECRET,
			refreshToken: process.env.NEXT_PUBLIC_GOOGLE_REFRESHTOKEN,
			accessToken,
		},
	})
	

	// const mail_options = {
	// 	from: `NO REPLY <no-reply@sprintzero.app>`,
	// 	to: `femzy123@yahoo.com`,
	// 	subject: `test`,
	// 	text: `test mail`
	// }


	

	try {
		await transporter.verify()
		// console.log(`Server is ready to take our messages`)

		// const info = await transporter.sendMail({
		// 	from,
		// 	to,
		// 	subject,
		// 	text,
		// 	html,
		// })
		res.status(200).send({message: `Email sent.`})
	} catch (error) {
		console.error(error)
		res.status(500).send({message: `Email not sent! Something went wrong.`})
	}
}

export default handler
