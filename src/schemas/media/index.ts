import 'reflect-metadata'
import { Resolver, Query, Mutation, Arg, Ctx, Int } from 'type-graphql'
import { Media } from './Media'
import { Context } from '../../config/context'
import { GraphQLUpload, FileUpload } from 'graphql-upload'
import {
	processUploadLocalFile,
	FileUploadResult,
	processDeleteLocalFile,
} from '../../helpers/processUpload'
import SearchInput from '../common/SearchInput'
import { AuthenticationError } from 'apollo-server-express'

@Resolver(Media)
export class MediaResolver {
	@Mutation(() => Media)
	async addMedia(
		@Arg('file', () => GraphQLUpload) file: FileUpload,
		@Ctx() ctx: Context
	): Promise<Media> {
		const result: FileUploadResult = await processUploadLocalFile(file)

		if (!result.success) throw new Error(result.message)

		return ctx.prisma.media.create({
			data: {
				filename: result.filename,
				filename_original: result.filename_original,
				mimetype: result.mimetype,
				extension: result.extension,
				path: result.location,
			},
		})
	}

	@Mutation(() => [Media])
	async addMultipleMedia(
		@Arg('files', () => [GraphQLUpload]) files: [FileUpload],
		@Ctx() ctx: Context
	): Promise<Array<Media>> {
		const medias: Array<Media> = []

		for (const file of files) {
			const result = await processUploadLocalFile(file)

			if (!result.success) throw new Error(result.message)

			const register = await ctx.prisma.media.create({
				data: {
					filename: result.filename,
					filename_original: result.filename_original,
					mimetype: result.mimetype,
					extension: result.extension,
					path: result.location,
				},
			})

			medias.push(register)
		}

		return medias
	}

	@Mutation(() => Media)
	async removeMedia(
		@Arg('id', () => Int) id: number,
		@Ctx() ctx: Context
	): Promise<Media> {
		if (!ctx.user)
			throw new AuthenticationError(
				'Usuário não logado para realizar a operação solicitada!'
			)

		const resultDeleteFromDatabase = await ctx.prisma.media.delete({
			where: {
				id: id,
			},
		})

		await processDeleteLocalFile(resultDeleteFromDatabase.path)

		return resultDeleteFromDatabase
	}

	@Query(() => Media, { nullable: true })
	async media(
		@Arg('id', () => Int) id: number,
		@Ctx() ctx: Context
	): Promise<Media | null> {
		return ctx.prisma.media.findUnique({
			where: { id: id },
		})
	}

	@Query(() => [Media], { nullable: true })
	async medias(
		@Arg('params') params: SearchInput,
		@Ctx() ctx: Context
	): Promise<Media[]> {
		return ctx.prisma.media.findMany({
			skip: params.skip,
			take: params.take,
			where: {
				filename: {
					contains: params.term,
				},
			},
		})
	}
}
