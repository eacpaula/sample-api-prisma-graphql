import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface Context {
	prisma: PrismaClient
	user: any
}

export function createContext(): Context {
	return { prisma, user: null }
}
