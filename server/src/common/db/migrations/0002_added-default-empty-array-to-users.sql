ALTER TABLE "users" ALTER COLUMN "refresh_tokens" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "refresh_tokens" SET NOT NULL;