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
import { Media } from '../media/Media'
import { News } from './News'
import { Context } from '../../config/context'
import SearchInput from '../common/SearchInput'
import { AuthenticationError } from 'apollo-server-express'

@InputType()
class NewsInput {
	@Field(() => Int, { nullable: true })
	id?: number

	@Field(() => Int)
	media_id: number

	@Field()
	title: string

	@Field()
	description: string

	@Field()
	content: string

	@Field()
	available: boolean

	@Field()
	highlight: boolean

	@Field(() => Date)
	publishDate: Date

	@Field(() => Date)
	expireDate: Date

	@Field(() => Int, { nullable: true })
	userCreatedId?: number

	@Field(() => Date, { nullable: true })
	createdAt?: Date

	@Field(() => Int, { nullable: true })
	userUpdatedId?: number | null

	@Field(() => GraphQLTimestamp, { nullable: true })
	updatedAt?: Date | null
}

@Resolver(News)
export class NewsResolver {
	@FieldResolver()
	async media(
		@Root() news: News,
		@Ctx() ctx: Context
	): Promise<Media | null> {
		return ctx.prisma.news
			.findUnique({
				where: {
					id: news.id,
				},
			})
			.media()
	}

	@FieldResolver()
	async createdBy(
		@Root() news: News,
		@Ctx() ctx: Context
	): Promise<User | null> {
		return ctx.prisma.news
			.findUnique({
				where: {
					id: news.id,
				},
			})
			.createdBy()
	}

	@FieldResolver()
	async updatedBy(
		@Root() news: News,
		@Ctx() ctx: Context
	): Promise<User | null> {
		return ctx.prisma.news
			.findUnique({
				where: {
					id: news.id,
				},
			})
			.updatedBy()
	}

	@Mutation(() => News)
	async addNews(
		@Arg('data') data: NewsInput,
		@Ctx() ctx: Context
	): Promise<News> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.news.create({
			data: {
				title: data.title,
				description: data.description,
				content: data.content,
				available: data.available,
				highlight: data.highlight,
				publishDate: data.publishDate,
				expireDate: data.expireDate,
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

	@Mutation(() => News)
	async updateNews(
		@Arg('data') data: NewsInput,
		@Ctx() ctx: Context
	): Promise<News> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.news.update({
			data: {
				title: data.title,
				description: data.description,
				content: data.content,
				available: data.available,
				highlight: data.highlight,
				publishDate: data.publishDate,
				expireDate: data.expireDate,
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

	@Mutation(() => News)
	async removeNews(
		@Arg('id', () => Int) id: number,
		@Ctx() ctx: Context
	): Promise<News> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.news.delete({
			where: {
				id,
			},
		})
	}

	@Query(() => News, { nullable: true })
	async news(
		@Arg('id', () => Int) id: number,
		@Ctx() ctx: Context
	): Promise<News | null> {
		return ctx.prisma.news.findUnique({
			where: { id: id },
		})
	}

	@Query(() => [News], { nullable: true })
	async tidings(
		@Arg('params') params: SearchInput,
		@Ctx() ctx: Context
	): Promise<News[]> {
		if (!params.skip && !params.take)
			return ctx.prisma.news.findMany({
				where: {
					title: {
						contains: params.term,
					},
					available: {
						equals: params.available,
					},
					highlight: {
						equals: params.highlight,
					},
				},
			})

		return ctx.prisma.news.findMany({
			skip: params.skip,
			take: params.take,
			where: {
				title: {
					contains: params.term,
				},
				available: {
					equals: params.available,
				},
				highlight: {
					equals: params.highlight,
				},
			},
		})
	}
}
