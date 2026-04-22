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

const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: databaseUrl,
  },
});
