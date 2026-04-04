import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as tenants from './schema/tenants';
import * as boats from './schema/boats';
import * as products from './schema/products';
import * as quotes from './schema/quotes';
import * as apiKeys from './schema/api-keys';
import * as analytics from './schema/analytics';

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, {
  schema: {
    ...tenants,
    ...boats,
    ...products,
    ...quotes,
    ...apiKeys,
    ...analytics,
  },
});
