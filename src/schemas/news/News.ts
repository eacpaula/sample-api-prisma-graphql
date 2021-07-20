import 'reflect-metadata'
import { ObjectType, Field, ID, GraphQLTimestamp } from 'type-graphql'
import { Media } from '../media/Media'
import { User } from '../user/User'

@ObjectType()
export class News {
	@Field(() => ID)
	id: number

	@Field(() => ID)
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

	@Field(() => ID)
	userCreatedId: number

	@Field(() => Date)
	createdAt: Date

	@Field(() => ID, { nullable: true })
	userUpdatedId?: number | null

	@Field(() => GraphQLTimestamp, { nullable: true })
	updatedAt?: Date | null

	@Field(() => User, { nullable: true })
	createdBy?: User | null

	@Field(() => User, { nullable: true })
	updatedBy?: User | null

	@Field(() => Media, { nullable: true })
	media?: Media | null
}
