import jwt from 'jsonwebtoken'

export type DecodedToken =
	| {
			id: number
			username: string
			role: string
	  }
	| null
	| undefined

export const validateToken = (token: string): DecodedToken => {
	const SECRET = <string>process.env.API_SECRET

	let decodedToken: DecodedToken

	try {
		decodedToken = jwt.verify(token, SECRET) as DecodedToken
	} catch (error) {
		return null
	}

	return decodedToken
}
