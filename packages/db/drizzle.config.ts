import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

export default defineConfig({
  out: './drizzle',
  schema: './src/schema/*',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },
});
