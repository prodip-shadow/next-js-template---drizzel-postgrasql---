import { eq } from "drizzle-orm";
import { db, schema } from "./drizzle.js";
import { createNotificationFactory, createUserFactory } from "./factories.js";

async function seed() {
  const demoEmail = "test1@gmail.com";

  const [existingUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, demoEmail))
    .limit(1);

  if (existingUser) {
    console.log(`Seed skipped: demo user already exists (id=${existingUser.id}).`);
    return;
  }

  const { user } = await createUserFactory({
    name: "test1",
    email: demoEmail,
    password: "password",
  });

  await createNotificationFactory(user.id, {
    type: "system",
    title: "Welcome to Scout Website",
    message: "Your demo account has been seeded successfully.",
  });

  console.log(`Seeded demo user (id=${user.id}).`);
}

seed()
  .then(() => {
    console.log("Database seeding completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Database seeding failed:", error);
    process.exit(1);
  });
