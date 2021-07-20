import * as path from 'path'
import { createWriteStream, unlinkSync } from 'fs'
import { v4 as uuid } from 'uuid'
import { FileUpload } from 'graphql-upload'

export class FileUploadResult {
	success: boolean

	message: string

	mimetype: string

	filename: string

	filename_original: string

	encoding: string

	extension: string

	location: string
}

export class FileDeleteResult {
	success: boolean

	message: string
}

export const processUploadLocalFile = async (
	file: FileUpload
): Promise<FileUploadResult> => {
	const { createReadStream, mimetype, encoding, filename } = await file

	const DIRECTORY = <string>(
		`${process.cwd()}/${process.env.UPLOAD_DIRECTORY}/files`
	)
	const EXTENSION = path.extname(filename)
	const FILENAME = `${uuid()}${EXTENSION}`
	const PATH = path.resolve(DIRECTORY, FILENAME)

	const stream = createReadStream()

	return await new Promise((resolve, reject) => {
		stream
			.pipe(createWriteStream(PATH))
			.on('finish', () => {
				resolve({
					success: true,
					message: 'Successfully Uploaded',
					extension: EXTENSION,
					filename_original: filename,
					filename: FILENAME,
					mimetype,
					encoding,
					location: PATH,
				})
			})
			.on('error', () => {
				reject({
					success: false,
					message: `Falha para realizar o upload do arquivo ${filename}`,
				})
			})
	})
}

export const processDeleteLocalFile = async (
	path: string
): Promise<FileDeleteResult> => {
	await unlinkSync(path)

	return {
		success: true,
		message: `Arquivo removido com sucesso`,
	}
}
