import * as nodemailer from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'

export default async (
	subject: string,
	message: string,
	to: string[],
	from?: string
): Promise<any> => {
	const {
		SMTP_USERNAME,
		SMTP_PASSWORD,
		// SMTP_PORT,
		SMTP_HOST,
		// SMTP_SECURE,
		// SMTP_TLS,
		SMTP_DEFAULT_EMAIL_FROM,
	} = process.env

	const transporter = nodemailer.createTransport({
		service: 'gmail',
		host: String(SMTP_HOST),
		// port: Number(SMTP_PORT) | 587,
		// secure: Boolean(SMTP_SECURE),
		// requireTLS: true,
		auth: {
			user: String(SMTP_USERNAME),
			pass: String(SMTP_PASSWORD),
		},
		// tls: {
		// 	ciphers: String(SMTP_TLS),
		// },
	})

	const options: Mail.Options = {
		from: from || SMTP_DEFAULT_EMAIL_FROM,
		to: to,
		subject: subject,
		//text: message, // plain text body
		html: message,
	}

	let info = null

	try {
		info = await transporter.sendMail(options)
	} catch (error) {
		console.log(error)
	}

	console.log('Message sent: %s', info.messageId)
	console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))

	return info
}
