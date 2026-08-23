import "dotenv/config";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as authSchema from "./auth-schema.ts";
import * as businessSchema from "./schema.ts";

const schema = {
  ...businessSchema,
  ...authSchema,
};

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
