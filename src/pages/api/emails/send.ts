import nodemailer from "nodemailer"

import type {NextApiHandler, NextApiRequest, NextApiResponse} from "next"
interface EmailRequest {
	to: string
	from: string
	subject: string
	body: string
	attachments?: string[]
}

const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method !== `POST`) {
		return res.status(405).json({message: `Method not allowed`})
	}

	const {to, from, subject, body} = req.body as EmailRequest

	let emailPassword: string
	if (from === process.env.EMAIL_FROM_NO_REPLY) {
		emailPassword = process.env.EMAIL_PASSWORD_NO_REPLY || ``
	} else {
		return res.status(401).json({message: `Invalid from email`})
	}

	const userEmail = from
	const userPassword = emailPassword

	// Create a transporter using Gmail SMTP
	const transporter = nodemailer.createTransport({
		service: `gmail`,
		auth: {
			user: userEmail,
			pass: userPassword,
		},
	})

	const mailOptions = {
		from,
		to,
		subject,
		html: body,
	}

	try {
		// Send the email
		await transporter.sendMail(mailOptions)

		// Send a success response
		res.status(200).json({message: `Email sent successfully.`})
	} catch (error) {
		// Send an error response
		res.status(500).json(error || `Internal Server error`)
	}
}

export default handler
