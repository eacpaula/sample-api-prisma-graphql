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
import { Banner } from './Banner'
import { Context } from '../../config/context'
import SearchInput from '../common/SearchInput'
import { Media } from '../media/Media'
import { AuthenticationError } from 'apollo-server-express'

@InputType()
class BannerInput {
	@Field(() => Int, { nullable: true })
	id?: number

	@Field(() => Int)
	media_id: number

	@Field()
	title: string

	@Field()
	description: string

	@Field()
	link: string

	@Field({ defaultValue: true })
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

@Resolver(Banner)
export class BannerResolver {
	@FieldResolver()
	async media(
		@Root() banner: Banner,
		@Ctx() ctx: Context
	): Promise<Media | null> {
		return ctx.prisma.banner
			.findUnique({
				where: {
					id: banner.id,
				},
			})
			.media()
	}

	@FieldResolver()
	async createdBy(
		@Root() banner: Banner,
		@Ctx() ctx: Context
	): Promise<User | null> {
		return ctx.prisma.banner
			.findUnique({
				where: {
					id: banner.id,
				},
			})
			.createdBy()
	}

	@FieldResolver()
	async updatedBy(
		@Root() banner: Banner,
		@Ctx() ctx: Context
	): Promise<User | null> {
		return ctx.prisma.banner
			.findUnique({
				where: {
					id: banner.id,
				},
			})
			.updatedBy()
	}

	@Mutation(() => Banner)
	async addBanner(
		@Arg('data') data: BannerInput,
		@Ctx() ctx: Context
	): Promise<Banner> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.banner.create({
			data: {
				title: data.title,
				description: data.description,
				link: data.link,
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
				createdAt: data.createdAt,
			},
		})
	}

	@Mutation(() => Banner)
	async updateBanner(
		@Arg('data') data: BannerInput,
		@Ctx() ctx: Context
	): Promise<Banner> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.banner.update({
			data: {
				title: data.title,
				description: data.description,
				link: data.link,
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
				updatedAt: data.updatedAt,
			},
			where: {
				id: data.id,
			},
		})
	}

	@Mutation(() => Banner)
	async removeBanner(
		@Arg('id', () => Int) id: number,
		@Ctx() ctx: Context
	): Promise<Banner> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.banner.delete({
			where: {
				id,
			},
		})
	}

	@Query(() => Banner, { nullable: true })
	async banner(
		@Arg('id', () => Int) id: number,
		@Ctx() ctx: Context
	): Promise<Banner | null> {
		return ctx.prisma.banner.findUnique({
			where: { id: id },
		})
	}

	@Query(() => [Banner], { nullable: true })
	async banners(
		@Arg('params') params: SearchInput,
		@Ctx() ctx: Context
	): Promise<Banner[]> {
		if (!params.skip && !params.take)
			return ctx.prisma.banner.findMany({
				where: {
					title: {
						contains: params.term,
					},
					available: {
						equals: params.available,
					},
				},
			})

		return ctx.prisma.banner.findMany({
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
