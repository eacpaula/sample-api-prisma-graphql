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
import { Segment } from './Segment'
import { Context } from '../../config/context'
import SearchInput from '../common/SearchInput'
import { AuthenticationError } from 'apollo-server-express'

@InputType()
class SegmentInput {
	@Field(() => Int, { nullable: true })
	id?: number

	@Field()
	title: string

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

@Resolver(Segment)
export class SegmentResolver {
	@FieldResolver()
	async createdBy(
		@Root() segment: Segment,
		@Ctx() ctx: Context
	): Promise<User | null> {
		return ctx.prisma.segment
			.findUnique({
				where: {
					id: segment.id,
				},
			})
			.createdBy()
	}

	@FieldResolver()
	async updatedBy(
		@Root() segment: Segment,
		@Ctx() ctx: Context
	): Promise<User | null> {
		return ctx.prisma.segment
			.findUnique({
				where: {
					id: segment.id,
				},
			})
			.updatedBy()
	}

	@Mutation(() => Segment)
	async addSegment(
		@Arg('data') data: SegmentInput,
		@Ctx() ctx: Context
	): Promise<Segment> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.segment.create({
			data: {
				title: data.title,
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

	@Mutation(() => Segment)
	async updateSegment(
		@Arg('data') data: SegmentInput,
		@Ctx() ctx: Context
	): Promise<Segment> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.segment.update({
			data: {
				title: data.title,
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

	@Mutation(() => Segment)
	async removeSegment(
		@Arg('id', () => Int) id: number,
		@Ctx() ctx: Context
	): Promise<Segment> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.segment.delete({
			where: {
				id,
			},
		})
	}

	@Query(() => Segment, { nullable: true })
	async segment(
		@Arg('id', () => Int) id: number,
		@Ctx() ctx: Context
	): Promise<Segment | null> {
		return ctx.prisma.segment.findUnique({
			where: { id: id },
		})
	}

	@Query(() => [Segment], { nullable: true })
	async segments(
		@Arg('params') params: SearchInput,
		@Ctx() ctx: Context
	): Promise<Segment[]> {
		if (!params.skip && !params.take)
			return ctx.prisma.segment.findMany({
				where: {
					title: {
						contains: params.term,
					},
				},
			})

		return ctx.prisma.segment.findMany({
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
