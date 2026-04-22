import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

declare global {
  var prisma: PrismaClient | undefined;
}

function normalizeDatabaseUrl(raw: string | undefined): string {
  if (!raw) return '';
  const cleaned = raw.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
  if (cleaned.startsWith('postgres://')) {
    return cleaned.replace(/^postgres:\/\//, 'postgresql://');
  }
  return cleaned;
}

const rawDatabaseUrl =
  process.env.DATABASE_URL
  ?? process.env.NETLIFY_DATABASE_URL
  ?? process.env.POSTGRES_URL;

const databaseUrl = normalizeDatabaseUrl(rawDatabaseUrl);
const hasDatabaseUrl = Boolean(databaseUrl);

const prismaClient = hasDatabaseUrl
  ? (global.prisma ?? new PrismaClient({
      adapter: new PrismaPg({ connectionString: databaseUrl }),
    }))
  : null;

export const prisma = prismaClient as PrismaClient;

if (process.env.NODE_ENV !== 'production' && prismaClient) {
  global.prisma = prismaClient;
}
