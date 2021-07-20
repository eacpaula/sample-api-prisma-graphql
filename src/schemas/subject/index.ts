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
import { User } from '../user/User'
import { Subject } from './Subject'
import { Context } from '../../config/context'
import SearchInput from '../common/SearchInput'
import { AuthenticationError } from 'apollo-server-express'

@InputType()
class SubjectInput {
	@Field(() => Int, { nullable: true })
	id?: number

	@Field()
	title: string

	@Field()
	emails: string

	@Field()
	available: boolean

	@Field(() => Int, { nullable: true })
	userCreatedId?: number | null

	@Field(() => GraphQLTimestamp, { nullable: true })
	createdAt?: Date

	@Field(() => Int, { nullable: true })
	userUpdatedId?: number | null

	@Field(() => GraphQLTimestamp, { nullable: true })
	updatedAt?: Date
}

@Resolver(Subject)
export class SubjectResolver {
	@FieldResolver()
	async createdBy(
		@Root() subject: Subject,
		@Ctx() ctx: Context
	): Promise<User | null> {
		return ctx.prisma.subject
			.findUnique({
				where: {
					id: subject.id,
				},
			})
			.createdBy()
	}

	@FieldResolver()
	async updatedBy(
		@Root() subject: Subject,
		@Ctx() ctx: Context
	): Promise<User | null> {
		return ctx.prisma.subject
			.findUnique({
				where: {
					id: subject.id,
				},
			})
			.updatedBy()
	}

	@Mutation(() => Subject)
	async addSubject(
		@Arg('data') data: SubjectInput,
		@Ctx() ctx: Context
	): Promise<Subject> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.subject.create({
			data: {
				title: data.title,
				emails: data.emails,
				available: data.available,
				createdBy: {
					connect: {
						id: data.userCreatedId
							? data.userCreatedId
							: ctx.user.id,
					},
				},
				createdAt: data.createdAt,
			},
		})
	}

	@Mutation(() => Subject)
	async updateSubject(
		@Arg('data') data: SubjectInput,
		@Ctx() ctx: Context
	): Promise<Subject> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.subject.update({
			data: {
				title: data.title,
				emails: data.emails,
				available: data.available,
				updatedBy: {
					connect: {
						id: data.userUpdatedId
							? data.userUpdatedId
							: ctx.user.id,
					},
				},
				updatedAt: data.updatedAt,
			},
			where: {
				id: data.id,
			},
		})
	}

	@Mutation(() => Subject)
	async removeSubject(
		@Arg('id', () => Int) id: number,
		@Ctx() ctx: Context
	): Promise<Subject> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.subject.delete({
			where: {
				id,
			},
		})
	}

	@Query(() => Subject, { nullable: true })
	async subject(
		@Arg('id', () => Int) id: number,
		@Ctx() ctx: Context
	): Promise<Subject | null> {
		return ctx.prisma.subject.findUnique({
			where: { id: id },
		})
	}

	@Query(() => [Subject], { nullable: true })
	async subjects(
		@Arg('params') params: SearchInput,
		@Ctx() ctx: Context
	): Promise<Subject[]> {
		return ctx.prisma.subject.findMany({
			skip: params.skip,
			take: params.take,
			where: {
				title: {
					contains: params.term,
				},
			},
		})
	}
}
