import 'reflect-metadata'
import {
	Resolver,
	Query,
	Mutation,
	Arg,
	Ctx,
	Int,
	InputType,
	Field,
	GraphQLTimestamp,
} from 'type-graphql'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { User } from './User'
import { Context } from '../../config/context'
import SearchInput from '../common/SearchInput'
import { AuthenticationError } from 'apollo-server-express'

const BCRYPT_SALT = 10

@InputType()
class SignupUserInput {
	@Field()
	username: string

	@Field()
	password: string

	@Field(() => GraphQLTimestamp, { nullable: true })
	createdAt?: Date

	@Field(() => GraphQLTimestamp, { nullable: true })
	updatedAt?: Date
}

@InputType()
class ChangePasswordUserInput {
	@Field()
	username: string

	@Field()
	password_old: string

	@Field()
	password: string

	@Field()
	password_confirmation: string
}

@Resolver(User)
export class UserResolver {
	@Mutation(() => User)
	async addUser(
		@Arg('data') data: SignupUserInput,
		@Ctx() ctx: Context
	): Promise<User> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		const salt: string = await bcrypt.genSalt(BCRYPT_SALT)
		const hash: string = await bcrypt.hash(data.password, salt)

		if (!hash)
			throw new Error(
				'Houve um erro inesperado tente novamente mais tarde'
			)

		data.password = hash

		return ctx.prisma.user.create({
			data: {
				username: data.username,
				password: data.password,
				role: 'USER',
			},
		})
	}

	@Mutation(() => User)
	async changePassword(
		@Arg('data') data: ChangePasswordUserInput,
		@Ctx() ctx: Context
	): Promise<User> {
		if (data.password !== data.password_confirmation)
			throw new Error('A senha não corresponde a confirmação de senha')

		const user = await ctx.prisma.user.findFirst({
			where: { username: data.username },
		})

		if (!user) throw new Error('Usuário ou senha inválido')

		const isMatch = await bcrypt.compare(data.password_old, user.password)

		if (!isMatch) throw new Error('Usuário ou senha inválido')

		const salt: string = await bcrypt.genSalt(BCRYPT_SALT)
		const hash: string = await bcrypt.hash(data.password, salt)

		if (!hash)
			throw new Error(
				'Houve um erro inesperado tente novamente mais tarde'
			)

		data.password = hash

		return ctx.prisma.user.update({
			data: {
				password: hash,
			},
			where: {
				username: data.username,
			},
		})
	}

	@Mutation(() => User)
	async removeUser(
		@Arg('id', () => Int) id: number,
		@Ctx() ctx: Context
	): Promise<User> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.user.delete({
			where: {
				id,
			},
		})
	}

	@Query(() => User, { nullable: true })
	async user(
		@Arg('id', () => Int) id: number,
		@Ctx() ctx: Context
	): Promise<User | null> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.user.findUnique({
			where: { id: id },
		})
	}

	@Query(() => [User], { nullable: true })
	async users(
		@Arg('params') params: SearchInput,
		@Ctx() ctx: Context
	): Promise<User[]> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.user.findMany({
			skip: params.skip,
			take: params.take,
			where: {
				username: {
					contains: params.term,
				},
			},
		})
	}

	@Query(() => String, { nullable: true })
	async login(
		@Arg('username') username: string,
		@Arg('password') password: string,
		@Ctx() ctx: Context
	): Promise<string> {
		const SECRET = <string>process.env.API_SECRET
		const EXPIRATION = <string>process.env.API_TOKEN_EXPIRATION

		const user = await ctx.prisma.user.findFirst({
			where: { username: username },
		})

		if (!user) throw new Error('Usuário ou senha inválido')

		const isMatch = await bcrypt.compare(password, user.password)

		if (!isMatch) throw new Error('Usuário ou senha inválido')

		return jwt.sign(
			{
				id: user.id,
				username: user.username,
				role: user.role,
			},
			SECRET,
			{
				algorithm: 'HS256',
				subject: `${user.id}`,
				expiresIn: EXPIRATION,
			}
		)
	}
}
