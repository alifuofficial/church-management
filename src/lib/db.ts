import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Always create a fresh PrismaClient to pick up schema changes
// In development mode, we need to ensure the latest schema is loaded
export const db = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query'] : [],
})

// Only cache in production
if (process.env.NODE_ENV === 'production') {
  globalForPrisma.prisma = db
}