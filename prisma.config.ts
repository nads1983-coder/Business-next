import "dotenv/config";
import { defineConfig } from "prisma/config";

const placeholderDatabaseUrl = "postgresql://placeholder:placeholder@localhost:5432/business_next?sslmode=disable";
const migrationDatabaseUrl =
  process.env.DIRECT_URL ??
  process.env.DATABASE_URL ??
  placeholderDatabaseUrl;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations"
  },
  datasource: {
    url: migrationDatabaseUrl
  }
});
