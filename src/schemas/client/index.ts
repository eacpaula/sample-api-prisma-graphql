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
import { Segment } from '../segment/Segment'
import { Media } from '../media/Media'
import { Client } from './Client'
import { Context } from '../../config/context'
import SearchInput from '../common/SearchInput'
import { AuthenticationError } from 'apollo-server-express'

@InputType()
class ClientInput {
	@Field(() => Int, { nullable: true })
	id?: number

	@Field(() => Int)
	media_id: number

	@Field(() => Int)
	segment_id: number

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
	updatedAt?: Date | null
}

@InputType()
class SearchInputClient extends SearchInput {
	@Field(() => Int, { nullable: true })
	segment_id?: number | null

	@Field({ nullable: true })
	available?: boolean
}

@Resolver(Client)
export class ClientResolver {
	@FieldResolver()
	async media(
		@Root() client: Client,
		@Ctx() ctx: Context
	): Promise<Media | null> {
		return ctx.prisma.client
			.findUnique({
				where: {
					id: client.id,
				},
			})
			.media()
	}

	@FieldResolver()
	async segment(
		@Root() client: Client,
		@Ctx() ctx: Context
	): Promise<Segment | null> {
		return ctx.prisma.client
			.findUnique({
				where: {
					id: client.id,
				},
			})
			.segment()
	}

	@FieldResolver()
	async createdBy(
		@Root() client: Client,
		@Ctx() ctx: Context
	): Promise<User | null> {
		return ctx.prisma.client
			.findUnique({
				where: {
					id: client.id,
				},
			})
			.createdBy()
	}

	@FieldResolver()
	async updatedBy(
		@Root() client: Client,
		@Ctx() ctx: Context
	): Promise<User | null> {
		return ctx.prisma.client
			.findUnique({
				where: {
					id: client.id,
				},
			})
			.updatedBy()
	}

	@Mutation(() => Client)
	async addClient(
		@Arg('data') data: ClientInput,
		@Ctx() ctx: Context
	): Promise<Client> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.client.create({
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
				media: {
					connect: {
						id: data.media_id,
					},
				},
				segment: {
					connect: {
						id: data.segment_id,
					},
				},
				createdAt: data.createdAt,
			},
		})
	}

	@Mutation(() => Client)
	async updateClient(
		@Arg('data') data: ClientInput,
		@Ctx() ctx: Context
	): Promise<Client> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.client.update({
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
				media: {
					connect: {
						id: data.media_id,
					},
				},
				segment: {
					connect: {
						id: data.segment_id,
					},
				},
				updatedAt: data.updatedAt,
			},
			where: {
				id: data.id,
			},
		})
	}

	@Mutation(() => Client)
	async removeClient(
		@Arg('id', () => Int) id: number,
		@Ctx() ctx: Context
	): Promise<Client> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.client.delete({
			where: {
				id,
			},
		})
	}

	@Query(() => Client, { nullable: true })
	async client(
		@Arg('id', () => Int) id: number,
		@Ctx() ctx: Context
	): Promise<Client | null> {
		return ctx.prisma.client.findUnique({
			where: { id: id },
		})
	}

	@Query(() => [Client], { nullable: true })
	async clients(
		@Arg('params') params: SearchInputClient,
		@Ctx() ctx: Context
	): Promise<Client[]> {
		if (params.segment_id)
			return ctx.prisma.client.findMany({
				skip: params.skip,
				take: params.take,
				where: {
					title: {
						contains: params.term,
					},
					segment_id: {
						equals: params.segment_id,
					},
					available: {
						equals: params.available,
					},
				},
			})

		return ctx.prisma.client.findMany({
			skip: params.skip,
			take: params.take,
			where: {
				title: {
					contains: params.term,
				},
				available: {
					equals: params.available,
				},
			},
		})
	}
}
