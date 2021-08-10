import * as tq from 'type-graphql'

import { AreaResolver } from './area'
import { BannerResolver } from './banner'
import { ClientResolver } from './client'
import { ContactResolver } from './contact'
import { MediaResolver } from './media'
import { NewsResolver } from './news'
import { ProductResolver } from './product'
import { ProposalResolver } from './proposal'
import { SubjectResolver } from './subject'
import { UserResolver } from './user'
import { WorkWithUsResolver } from './workwithus'

export const schema = tq.buildSchemaSync({
	resolvers: [
		AreaResolver,
		BannerResolver,
		ClientResolver,
		ContactResolver,
		MediaResolver,
		NewsResolver,
		ProductResolver,
		ProposalResolver,
		SubjectResolver,
		UserResolver,
		WorkWithUsResolver,
	],
})
