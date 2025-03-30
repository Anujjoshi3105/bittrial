import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import type { Config } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("🔴 Required environment variable DATABASE_URL is not set");
}

const drizzleConfig: Config = {
  schema: "./src/lib/supabase/schema.ts",
  out: "./src/lib/supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
};

export default defineConfig(drizzleConfig);
