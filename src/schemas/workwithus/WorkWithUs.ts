import 'reflect-metadata'
import { Length, IsEmail } from 'class-validator'
import { ObjectType, Field, ID, GraphQLTimestamp } from 'type-graphql'
import { Area } from '../area/Area'
import { Media } from '../media/Media'

@ObjectType()
export class WorkWithUs {
	@Field(() => ID)
	id: number

	@Field(() => ID)
	area_id: number

	@Field(() => ID)
	media_id: number

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

	@Field(() => Area, { nullable: true })
	area?: Area | null

	@Field(() => Media, { nullable: true })
	media?: Media | null
}
