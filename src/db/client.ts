import "dotenv/config";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema.ts";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "未找到 DATABASE_URL，请检查项目根目录下的 .env",
  );
}

export const pool = new Pool({
  connectionString: databaseUrl,
});

export const db = drizzle(pool, {
  schema,
});
