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
import { WorkWithUs } from './WorkWithUs'
import { Area } from '../area/Area'
import { Media } from '../media/Media'
import { Context } from '../../config/context'
import SearchInput from '../common/SearchInput'
import { AuthenticationError } from 'apollo-server-express'
import sendEmail from '../../helpers/sendEmail'

@InputType()
class WorkWithUsInput {
	@Field(() => Int, { nullable: true })
	id?: number

	@Field(() => Int)
	area_id: number

	@Field(() => Int)
	media_id: number

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
	updatedAt?: Date
}

@Resolver(WorkWithUs)
export class WorkWithUsResolver {
	@FieldResolver()
	async area(
		@Root() workWithUs: WorkWithUs,
		@Ctx() ctx: Context
	): Promise<Area | null> {
		return ctx.prisma.workWithUs
			.findUnique({
				where: {
					id: workWithUs.id,
				},
			})
			.area()
	}

	@FieldResolver()
	async media(
		@Root() workWithUs: WorkWithUs,
		@Ctx() ctx: Context
	): Promise<Media | null> {
		return ctx.prisma.workWithUs
			.findUnique({
				where: {
					id: workWithUs.id,
				},
			})
			.media()
	}

	@Mutation(() => WorkWithUs)
	async addWorkWithUs(
		@Arg('data') data: WorkWithUsInput,
		@Ctx() ctx: Context
	): Promise<WorkWithUs> {
		const result = await ctx.prisma.workWithUs.create({
			data: {
				fullname: data.fullname,
				email: data.email,
				cellphone: data.cellphone,
				message: data.message,
				area: {
					connect: {
						id: data.area_id,
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

		if (result && result.id > 0) {
			const area = await ctx.prisma.area.findUnique({
				where: { id: result.area_id },
			})

			if (area)
				await sendEmail(
					`Solicitação de Trabalhe Conosco: ${area.title}`,
					`
						<p>
							Nome: ${data.fullname}, <br/>
							Email: ${data.email}, <br/>
							Celular: ${data.cellphone}, <br/>
							Mensagem: ${data.message}
						</p>
					`,
					area.emails.split(',')
				)
		}

		return result
	}

	@Mutation(() => WorkWithUs)
	async updateWorkWithUs(
		@Arg('data') data: WorkWithUsInput,
		@Ctx() ctx: Context
	): Promise<WorkWithUs> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.workWithUs.update({
			data: {
				fullname: data.fullname,
				email: data.email,
				cellphone: data.cellphone,
				message: data.message,
				area: {
					connect: {
						id: data.area_id,
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

	@Mutation(() => WorkWithUs)
	async removeWorkWithUs(
		@Arg('id', () => Int) id: number,
		@Ctx() ctx: Context
	): Promise<WorkWithUs> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.workWithUs.delete({
			where: {
				id,
			},
		})
	}

	@Query(() => WorkWithUs, { nullable: true })
	async employee(
		@Arg('id', () => Int) id: number,
		@Ctx() ctx: Context
	): Promise<WorkWithUs | null> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.workWithUs.findUnique({
			where: { id: id },
		})
	}

	@Query(() => [WorkWithUs], { nullable: true })
	async employees(
		@Arg('params') params: SearchInput,
		@Ctx() ctx: Context
	): Promise<WorkWithUs[]> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.workWithUs.findMany({
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
