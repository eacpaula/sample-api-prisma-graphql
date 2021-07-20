import 'reflect-metadata'
import { ObjectType, Field, ID } from 'type-graphql'

@ObjectType()
export class Media {
	@Field(() => ID)
	id: number

	@Field()
	path: string

	@Field()
	filename: string

	@Field()
	filename_original: string

	@Field()
	mimetype: string
}
