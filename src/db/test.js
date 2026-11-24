import { sql } from "drizzle-orm";
import { db } from "./index.js";

async function testConnection() {
  try {
    const result = await db.execute(sql`SELECT NOW()`);

    console.log("Database connected successfully!");
    console.log(result);
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

testConnection();


// bun src/db/test.js   ---use this in terminal for test the conection
    