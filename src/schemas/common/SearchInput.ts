import 'reflect-metadata'
import { Field, InputType } from 'type-graphql'

@InputType()
export default class SearchInput {
	@Field({ nullable: true })
	skip?: number

	@Field({ nullable: true })
	take?: number

	@Field()
	term: string

	@Field({ nullable: true })
	available?: boolean

	@Field({ nullable: true })
	highlight?: boolean
}
