import 'dotenv/config';
import { defineConfig } from 'prisma/config';

function normalizeDatabaseUrl(raw: string | undefined): string {
  if (!raw) return '';

  // Netlify/CI values are sometimes pasted with quotes or extra spaces.
  const cleaned = raw.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');

  // Prisma expects postgresql:// for Postgres URLs.
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

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: databaseUrl,
  },
});
