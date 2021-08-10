/**
 * Server dependencies
 */
import express, {
	Application,
	// NextFunction,
	// Request,
	// Response
} from 'express'
import { graphqlUploadExpress } from 'graphql-upload'
import {
	// addSchemaLevelResolveFunction,
	ApolloServer,
	// AuthenticationError,
	Config,
} from 'apollo-server-express'
import depthLimit from 'graphql-depth-limit'
import logger from 'morgan'
import compression from 'compression'
import * as dotenv from 'dotenv'
import cors from 'cors'
import expressJwt from 'express-jwt'
import { createContext } from './config/context'
import { schema } from './schemas'
import normalizePort from './util/normalizePort'

/**
 * Debug dependencies
 */
import Debug from 'debug'
const debug = Debug('api')

/**a
 * Load environments
 */
dotenv.config({
	path:
		process.env.NODE_ENV === 'production'
			? '.env'
			: `.env.${process.env.NODE_ENV}`,
})

/**
 * Prisma context and schemas depencies
 */
const contextPrisma = createContext()

/**
 * Configure express application and middlewares
 */
const app: Application = express()

app.use(express.static(`${process.cwd()}/${process.env.UPLOAD_DIRECTORY}`))
app.use(logger('dev'))
app.use((req, res, next) => {
	next()
}, cors({ maxAge: 84600 }))
app.use(compression())

const SECRET = <string>process.env.API_SECRET

app.use(
	expressJwt({
		secret: SECRET,
		algorithms: ['HS256'],
		credentialsRequired: false,
	})
	// (req: any, res: Response, next: NextFunction) => {
	// 	if (!req.user)
	// 		return res
	// 			.status(401)
	// 			.send({ data: null, success: false, tokenExpired: true })

	// 	next()
	// }
)

app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }))

/**
 * Configure apollo server
 */
// addSchemaLevelResolveFunction(schema, (root, args, context, info) => {
// 	if (info.path.key !== 'login' && !context.user)
// 		throw new AuthenticationError(
// 			'Usuário não logado para realizar a operação solicitada!'
// 		)
// })

const apolloConfig: Config = {
	schema: schema,
	validationRules: [depthLimit(7)],
	introspection: true,
	playground: true,
	tracing: true,
	context: async ({ req }) => {
		const user = req.user || null

		return {
			user: user,
			prisma: contextPrisma.prisma,
		}
	},
	uploads: false,
}

const apolloServer = new ApolloServer(apolloConfig)

apolloServer.applyMiddleware({ app, path: '/graphql' })

/**
 * Configure and start http server
 */
const port = normalizePort(process.env.PORT || process.env.API_PORT || '3000')

app.listen(port)
	.on('error', (error: any) => {
		if (error.syscall !== 'listen') {
			throw error
		}

		const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`

		switch (error.code) {
			case 'EACCES':
				console.error(bind + ' requires elevated privileges')
				process.exit(1)
				break
			case 'EADDRINUSE':
				console.error(bind + ' is already in use')
				process.exit(1)
				break
			default:
				throw error
		}
	})
	.on('listening', () => {
		// const addr = app.address()

		// const bind =
		// 	typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port}`

		debug(`⚡️[server]: Server is running at port ${port}`)
	})

export default app
