import 'reflect-metadata'
import { Length, IsEmail } from 'class-validator'
import { ObjectType, Field, ID, GraphQLTimestamp } from 'type-graphql'
import { Subject } from '../subject/Subject'

@ObjectType()
export class Contact {
	@Field(() => ID)
	id: number

	@Field(() => ID)
	subject_id: number

	@Field()
	@Length(1, 256)
	fullname: string

	@Field()
	@IsEmail()
	@Length(1, 256)
	email: string

	@Field()
	@Length(1, 50)
	cellphone: string

	@Field()
	@Length(1, 4000)
	message: string

	@Field(() => GraphQLTimestamp)
	createdAt: Date

	@Field(() => GraphQLTimestamp, { nullable: true })
	updatedAt?: Date | null

	@Field(() => Subject, { nullable: true })
	subject?: Subject | null
}
