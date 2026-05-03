import { PrismaClient } from "@/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const globalForPrisma = global as unknown as { prisma: PrismaClient }

/**
 * Instantiates a new {@link PrismaClient} backed by a `pg` connection pool.
 * Uses the `DATABASE_URL` environment variable as the connection string.
 *
 * @returns A configured {@link PrismaClient} instance.
 */
export function createPrismaClient(): PrismaClient {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma