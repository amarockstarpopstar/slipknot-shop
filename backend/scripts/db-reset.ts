import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { Pool } from 'pg';

const getEnv = (keys: string[], fallback?: string): string | undefined => {
  for (const key of keys) {
    const value = process.env[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return fallback;
};

async function ensureDatabaseExists({
  host,
  port,
  user,
  password,
  database,
}: {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}): Promise<void> {
  const adminDatabase = getEnv(['PGDATABASE', 'POSTGRES_DB', 'DATABASE_TEMPLATE'], 'postgres')!;
  const adminPool = new Pool({ host, port, user, password, database: adminDatabase });
  try {
    await adminPool.query(`CREATE DATABASE "${database}" WITH ENCODING 'UTF8' TEMPLATE template0`);
    console.log(`Database ${database} created`);
  } catch (error) {
    if ((error as { code?: string }).code === '42P04') {
      console.log(`Database ${database} already exists`);
    } else {
      throw error;
    }
  } finally {
    await adminPool.end();
  }
}

async function runSchema({
  host,
  port,
  user,
  password,
  database,
}: {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}): Promise<void> {
  const pool = new Pool({ host, port, user, password, database });
  const client = await pool.connect();
  try {
    const schemaPath = resolve(__dirname, '..', 'database', 'schema.sql');
    const sql = await readFile(schemaPath, 'utf-8');
    console.log(`Applying schema from ${schemaPath}`);
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Database schema applied successfully');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

async function main() {
  const host = getEnv(['DATABASE_HOST', 'DB_HOST'], '127.0.0.1')!;
  const portValue = getEnv(['DATABASE_PORT', 'DB_PORT'], '5432');
  const port = Number.parseInt(portValue ?? '5432', 10);
  const user = getEnv(['DATABASE_USER', 'DB_USER'], 'postgres')!;
  const password = getEnv(['DATABASE_PASSWORD', 'DB_PASSWORD'], 'postgres')!;
  const database = getEnv(['DATABASE_NAME', 'DB_NAME'], 'slipknot_merch')!;

  const connection = { host, port: Number.isNaN(port) ? 5432 : port, user, password, database };

  try {
    await ensureDatabaseExists(connection);
    await runSchema(connection);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to reset database schema: ${message}`);
    process.exitCode = 1;
  }
}

void main();
