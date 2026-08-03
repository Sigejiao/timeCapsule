import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("未找到 DATABASE_URL，请检查项目根目录下的 .env");
}

const pool = new Pool({
  connectionString: databaseUrl,
});

const db = drizzle(pool);

try {
  const result = await db.execute(sql`
    SELECT
      current_database() AS database_name,
      current_user AS user_name,
      inet_server_addr() AS server_address,
      inet_server_port() AS server_port,
      (
      SELECT extversion
      FROM pg_extension
      WHERE extname = 'vector'
      ) AS vector_version;
  `);

  console.log("数据库连接成功：");
  console.table(result.rows);
} finally {
  await pool.end();
}

