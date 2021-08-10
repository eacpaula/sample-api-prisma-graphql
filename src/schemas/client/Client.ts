import 'reflect-metadata'
import { ObjectType, Field, ID, GraphQLTimestamp } from 'type-graphql'
import { Media } from '../media/Media'
import { User } from '../user/User'

@ObjectType()
export class Client {
	@Field(() => ID)
	id: number

	@Field(() => ID)
	media_id: number

	@Field()
	title: string

	@Field()
	available: boolean

	@Field(() => ID, { nullable: true })
	userCreatedId?: number | null

	@Field(() => GraphQLTimestamp)
	createdAt: Date

	@Field(() => ID, { nullable: true })
	userUpdatedId?: number | null

	@Field(() => GraphQLTimestamp, { nullable: true })
	updatedAt?: Date | null

	@Field(() => Media, { nullable: true })
	media?: Media | null

	@Field(() => User, { nullable: true })
	createdBy?: User | null

	@Field(() => User, { nullable: true })
	updatedBy?: User | null
}
