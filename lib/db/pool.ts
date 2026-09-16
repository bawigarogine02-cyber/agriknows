import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  const databaseName = process.env.DB_NAME;
  const databaseUser = process.env.DB_USER;
  const databaseHost = process.env.DB_HOST;

  if (!databaseUrl && (!databaseName || !databaseUser || !databaseHost)) return null;

  pool ??= databaseUrl
    ? mysql.createPool(databaseUrl)
    : mysql.createPool({
        host: databaseHost,
        user: databaseUser,
        password: process.env.DB_PASSWORD ?? "",
        database: databaseName,
        port: Number(process.env.DB_PORT ?? 3306),
      });
  return pool;
}
