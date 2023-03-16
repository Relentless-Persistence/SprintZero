import {TRPCError} from "@trpc/server"
import nodemailer from "nodemailer"
import "server-only"
import invariant from "tiny-invariant"

type SendEmailInput = {
	body: string
	from: string
	subject: string
	to: string
}

export const sendEmail = async ({body, from, subject, to}: SendEmailInput): Promise<void> => {
	if (process.env.NODE_ENV === `production`) {
		const emailFrom = process.env.EMAIL_FROM_NO_REPLY
		invariant(emailFrom, `EMAIL_FROM_NO_REPLY is not set`)
		const emailPassword = process.env.EMAIL_PASSWORD_NO_REPLY
		invariant(emailPassword, `EMAIL_PASSWORD_NO_REPLY is not set`)
		if (from !== process.env.EMAIL_FROM_NO_REPLY)
			throw new TRPCError({code: `BAD_REQUEST`, message: `Invalid from email`})

		const transporter = nodemailer.createTransport({
			service: `gmail`,
			auth: {
				user: emailFrom,
				pass: emailPassword,
			},
		})

		await transporter.sendMail({
			from,
			to,
			subject,
			html: body,
		})
	} else {
		console.info(`sendEmail`, {from, to, subject, body})
	}
}
