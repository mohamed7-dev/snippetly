ALTER TABLE "users" ALTER COLUMN "firstName" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "lastName" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "accepted_policies" SET DEFAULT false;