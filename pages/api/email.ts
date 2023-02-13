import nodemailer from "nodemailer"

import type {NextApiHandler, NextApiRequest,NextApiResponse} from "next"

interface MailOption {
	to: string
	from: string
	subject: string
	text?: string
	html: string
}

const transporter = nodemailer.createTransport({
	host: `smtp.gmail.com`,
	port: 465,
	secure: true,
	auth: {
		user: `example@gmail.com`,
		pass: `password`,
	},
}) 

const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse) => {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const {to, from, subject, text = ``, html}: MailOption = req.body

	try {
		await transporter.verify()
		// console.log(`Server is ready to take our messages`)

		const info = await transporter.sendMail({
			from,
			to,
			subject,
			text,
			html,
		})
		res.status(200).send({message: `Email sent.`, info})
	} catch (error) {
		console.error(error)
		res.status(500).send({message: `Email not sent! Something went wrong.`})
	}
}

export default handler
