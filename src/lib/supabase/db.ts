import * as schema from "./migrations/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  console.log("🔴 Cannot find database url.");
}

const client = postgres(process.env.DATABASE_URL as string, {
  max: 1,
  prepare: false,
});
const db = drizzle(client, { schema });

export default db;
