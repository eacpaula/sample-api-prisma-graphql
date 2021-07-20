import 'reflect-metadata'
import { ObjectType, Field, ID, GraphQLTimestamp } from 'type-graphql'
import { User } from '../user/User'

@ObjectType()
export class Subject {
	@Field(() => ID)
	id: number

	@Field()
	title: string

	@Field()
	emails: string

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

	@Field(() => User, { nullable: true })
	createdBy?: User | null

	@Field(() => User, { nullable: true })
	updatedBy?: User | null
}
