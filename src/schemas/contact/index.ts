import 'reflect-metadata'
import {
	Resolver,
	Query,
	Mutation,
	Arg,
	Ctx,
	FieldResolver,
	Root,
	InputType,
	Field,
	GraphQLTimestamp,
	Int,
} from 'type-graphql'
import { Subject } from '../subject/Subject'
import { Contact } from './Contact'
import { Context } from '../../config/context'
import SearchInput from '../common/SearchInput'
import { AuthenticationError } from 'apollo-server-express'
import sendEmail from '../../helpers/sendEmail'

@InputType()
class ContactInput {
	@Field(() => Int, { nullable: true })
	id?: number

	@Field(() => Int)
	subject_id: number

	@Field()
	fullname: string

	@Field()
	email: string

	@Field()
	cellphone: string

	@Field()
	message: string

	@Field(() => GraphQLTimestamp, { nullable: true })
	createdAt?: Date

	@Field(() => GraphQLTimestamp, { nullable: true })
	updatedAt?: Date | null
}

@Resolver(Contact)
export class ContactResolver {
	@FieldResolver()
	async subject(
		@Root() contact: Contact,
		@Ctx() ctx: Context
	): Promise<Subject | null> {
		return ctx.prisma.contact
			.findUnique({
				where: {
					id: contact.id,
				},
			})
			.subject()
	}

	@Mutation(() => Contact)
	async addContact(
		@Arg('data') data: ContactInput,
		@Ctx() ctx: Context
	): Promise<Contact> {
		const result = await ctx.prisma.contact.create({
			data: {
				fullname: data.fullname,
				email: data.email,
				cellphone: data.cellphone,
				message: data.message,
				subject: {
					connect: {
						id: data.subject_id,
					},
				},
				createdAt: data.createdAt,
			},
		})

		if (result && result.id > 0) {
			const subject = await ctx.prisma.subject.findUnique({
				where: { id: result.subject_id },
			})

			if (subject)
				await sendEmail(
					`Solicitação de Contato: ${subject.title}`,
					`
						<p>
							Nome: ${data.fullname}, <br/>
							Email: ${data.email}, <br/>
							Celular: ${data.cellphone}, <br/>
							Mensagem: ${data.message}
						</p>
					`,
					subject.emails.split(',')
				)
		}

		return result
	}

	@Mutation(() => Contact)
	async updateContact(
		@Arg('data') data: ContactInput,
		@Ctx() ctx: Context
	): Promise<Contact> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.contact.update({
			data: {
				fullname: data.fullname,
				email: data.email,
				cellphone: data.cellphone,
				message: data.message,
				subject: {
					connect: {
						id: data.subject_id,
					},
				},
				updatedAt: data.updatedAt,
			},
			where: {
				id: data.id,
			},
		})
	}

	@Mutation(() => Contact)
	async removeContact(
		@Arg('id', () => Int) id: number,
		@Ctx() ctx: Context
	): Promise<Contact> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.contact.delete({
			where: {
				id,
			},
		})
	}

	@Query(() => Contact, { nullable: true })
	async contact(
		@Arg('id', () => Int) id: number,
		@Ctx() ctx: Context
	): Promise<Contact | null> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.contact.findUnique({
			where: { id: id },
		})
	}

	@Query(() => [Contact], { nullable: true })
	async contacts(
		@Arg('params') params: SearchInput,
		@Ctx() ctx: Context
	): Promise<Contact[]> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.contact.findMany({
			skip: params.skip,
			take: params.take,
			where: {
				fullname: {
					contains: params.term,
				},
			},
		})
	}
}
