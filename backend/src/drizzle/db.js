import 'dotenv/config';
import * as schema from './schema.js';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL);

const db = drizzle(sql, { schema, logger: true });

export default db; 