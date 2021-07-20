import 'reflect-metadata'
import { ObjectType, Field, ID, GraphQLTimestamp } from 'type-graphql'
import { User } from '../user/User'
import { Media } from '../media/Media'

@ObjectType()
export class Banner {
	@Field(() => ID)
	id: number

	@Field(() => ID)
	media_id: number

	@Field()
	title: string

	@Field()
	description: string

	@Field()
	link: string

	@Field({ defaultValue: true })
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
