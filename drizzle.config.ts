import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("未找到 DATABASE_URL，请检查项目根目录下的 .env");
}

export default defineConfig({
  dialect: "postgresql",

  schema: [
    "./src/db/schema.ts",
    "./src/db/auth-schema.ts",
  ],


  out: "./drizzle",
  dbCredentials: {
    url: databaseUrl,
  },
  verbose: true,
  strict: true,
});
