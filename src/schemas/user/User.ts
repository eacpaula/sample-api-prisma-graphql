import 'reflect-metadata'
import { ObjectType, Field, ID, GraphQLTimestamp } from 'type-graphql'

@ObjectType()
export class User {
	@Field(() => ID)
	id: number

	@Field()
	username: string

	@Field()
	password: string

	@Field(() => GraphQLTimestamp)
	createdAt: Date

	@Field(() => GraphQLTimestamp, { nullable: true })
	updatedAt?: Date | null
}
