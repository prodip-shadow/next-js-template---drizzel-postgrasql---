ALTER TABLE "users" ADD COLUMN "avatar_public_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_provider" varchar(24);