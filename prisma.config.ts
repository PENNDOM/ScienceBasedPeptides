import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma 7 config defaults to .env; load .env.local first so local Neon URL wins.
loadEnv({ path: ".env.local" });
loadEnv();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url:
      process.env["DATABASE_URL"] ||
      process.env["POSTGRES_URL_NON_POOLING"] ||
      process.env["POSTGRES_URL"] ||
      "",
  },
});
