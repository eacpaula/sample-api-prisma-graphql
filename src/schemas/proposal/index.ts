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
import { Proposal } from './Proposal'
import { Product } from '../product/Product'
import { Context } from '../../config/context'
import SearchInput from '../common/SearchInput'
import { AuthenticationError } from 'apollo-server-express'
import sendEmail from '../../helpers/sendEmail'

@InputType()
class ProposalInput {
	@Field(() => Int, { nullable: true })
	id?: number

	@Field(() => Int)
	product_id: number

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

@Resolver(Proposal)
export class ProposalResolver {
	@FieldResolver()
	async product(
		@Root() proposal: Proposal,
		@Ctx() ctx: Context
	): Promise<Product | null> {
		return ctx.prisma.proposal
			.findUnique({
				where: {
					id: proposal.id,
				},
			})
			.product()
	}

	@Mutation(() => Proposal)
	async addProposal(
		@Arg('data') data: ProposalInput,
		@Ctx() ctx: Context
	): Promise<Proposal> {
		const result = await ctx.prisma.proposal.create({
			data: {
				fullname: data.fullname,
				email: data.email,
				cellphone: data.cellphone,
				message: data.message,
				product: {
					connect: {
						id: data.product_id,
					},
				},
				createdAt: data.createdAt,
			},
		})

		if (result && result.id > 0) {
			const product = await ctx.prisma.product.findUnique({
				where: { id: result.product_id },
			})

			const { PROPOSAL_EMAIL_ADDRESS } = process.env

			if (product)
				await sendEmail(
					`Solicitação de Apresentação de Solução: ${product.title}`,
					`
						<p>
							Nome: ${data.fullname}, <br/>
							Email: ${data.email}, <br/>
							Celular: ${data.cellphone}, <br/>
							Produto: ${product.title}, <br/>
							Mensagem: ${data.message}
						</p>
					`,
					[String(PROPOSAL_EMAIL_ADDRESS)]
				)
		}

		return result
	}

	@Mutation(() => Proposal)
	async updateProposal(
		@Arg('data') data: ProposalInput,
		@Ctx() ctx: Context
	): Promise<Proposal> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.proposal.update({
			data: {
				fullname: data.fullname,
				email: data.email,
				cellphone: data.cellphone,
				message: data.message,
				product: {
					connect: {
						id: data.product_id,
					},
				},
				updatedAt: data.updatedAt,
			},
			where: {
				id: data.id,
			},
		})
	}

	@Mutation(() => Proposal)
	async removeProposal(
		@Arg('id', () => Int) id: number,
		@Ctx() ctx: Context
	): Promise<Proposal> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.proposal.delete({
			where: {
				id,
			},
		})
	}

	@Query(() => Proposal, { nullable: true })
	async proposal(
		@Arg('id', () => Int) id: number,
		@Ctx() ctx: Context
	): Promise<Proposal | null> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.proposal.findUnique({
			where: { id: id },
		})
	}

	@Query(() => [Proposal], { nullable: true })
	async proposals(
		@Arg('params') params: SearchInput,
		@Ctx() ctx: Context
	): Promise<Proposal[]> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		return ctx.prisma.proposal.findMany({
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
