import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema/index.js";

if (!process.env.DATABASE_URL_POOLED) {
  throw new Error("DATABASE_URL_POOLED environment variable is not set.");
}

export const db = drizzle(process.env.DATABASE_URL_POOLED);
export { schema };
