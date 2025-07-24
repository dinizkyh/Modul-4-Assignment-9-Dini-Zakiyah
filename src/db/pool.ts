// Database connection pooling setup
import { Pool } from 'pg';

export const pool = new Pool({
  // TODO: Set your database config here
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 5432,
  max: 10, // Example pool size
});
