import { drizzle } from "drizzle-orm/neon-http";

if (!process.env.DATABASE_URL_POOLED) {
  throw new Error("DATABASE_URL_POOLED environment variable is not set.");
}

export const db = drizzle(process.env.DATABASE_URL_POOLED);
