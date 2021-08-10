import * as nodemailer from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'

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

	return await transporter
		.sendMail(options)
		.then(result => {
			console.info('Message sent: %s', result.messageId)
			console.info('Preview URL: %s', nodemailer.getTestMessageUrl(result))
		})
		.catch((error) => console.error('Nodemailer Error: ', error))
}
