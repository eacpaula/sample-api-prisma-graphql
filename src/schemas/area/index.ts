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
import { Area } from './Area'
import { Context } from '../../config/context'
import SearchInput from '../common/SearchInput'
import { AuthenticationError } from 'apollo-server-express'

@InputType()
class AreaInput {
	@Field(() => Int, { nullable: true })
	id?: number

	@Field()
	title: string

	@Field()
	emails: string

	@Field()
	available: boolean

	@Field(() => Int, { nullable: true })
	userCreatedId?: number

	@Field(() => GraphQLTimestamp, { nullable: true })
	createdAt?: Date

	@Field(() => Int, { nullable: true })
	userUpdatedId?: number | null

	@Field(() => GraphQLTimestamp, { nullable: true })
	updatedAt?: Date | null
}

@Resolver(Area)
export class AreaResolver {
	@FieldResolver()
	async createdBy(
		@Root() area: Area,
		@Ctx() ctx: Context
	): Promise<User | null> {
		return ctx.prisma.area
			.findUnique({
				where: {
					id: area.id,
				},
			})
			.createdBy()
	}

	@FieldResolver()
	async updatedBy(
		@Root() area: Area,
		@Ctx() ctx: Context
	): Promise<User | null> {
		return ctx.prisma.area
			.findUnique({
				where: {
					id: area.id,
				},
			})
			.updatedBy()
	}

	@Mutation(() => Area)
	async addArea(
		@Arg('data') data: AreaInput,
		@Ctx() ctx: Context
	): Promise<Area> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.area.create({
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

	@Mutation(() => Area)
	async updateArea(
		@Arg('data') data: AreaInput,
		@Ctx() ctx: Context
	): Promise<Area> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.area.update({
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

	@Mutation(() => Area)
	async removeArea(
		@Arg('id', () => Int) id: number,
		@Ctx() ctx: Context
	): Promise<Area> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.area.delete({
			where: {
				id,
			},
		})
	}

	@Query(() => Area, { nullable: true })
	async area(
		@Arg('id', () => Int) id: number,
		@Ctx() ctx: Context
	): Promise<Area | null> {
		return ctx.prisma.area.findUnique({
			where: { id: id },
		})
	}

	@Query(() => [Area], { nullable: true })
	async areas(
		@Arg('params') params: SearchInput,
		@Ctx() ctx: Context
	): Promise<Area[]> {
		return ctx.prisma.area.findMany({
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
