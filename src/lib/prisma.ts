import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

declare global {
  var prisma: PrismaClient | undefined;
}

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

const prismaClient = hasDatabaseUrl
  ? (global.prisma ?? new PrismaClient({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
    }))
  : null;

export const prisma = prismaClient as PrismaClient;

if (process.env.NODE_ENV !== 'production' && prismaClient) {
  global.prisma = prismaClient;
}
