ALTER TYPE "public"."friendship_status" ADD VALUE 'cancelled';--> statement-breakpoint
ALTER TABLE "collections" DROP CONSTRAINT "collections_slug_unique";--> statement-breakpoint
ALTER TABLE "snippets" DROP CONSTRAINT "snippets_slug_unique";--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "old_slugs" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "friendships" ADD COLUMN "accepted_at" timestamp;--> statement-breakpoint
ALTER TABLE "friendships" ADD COLUMN "rejected_at" timestamp;--> statement-breakpoint
ALTER TABLE "friendships" ADD COLUMN "cancelled_at" timestamp;--> statement-breakpoint
ALTER TABLE "snippets" ADD COLUMN "old_slugs" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "old_names" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "remember_me" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "collections_old_slugs_index" ON "collections" USING btree ("old_slugs");--> statement-breakpoint
CREATE UNIQUE INDEX "collections_slug_index" ON "collections" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "snippets_old_slugs_index" ON "snippets" USING btree ("old_slugs");--> statement-breakpoint
CREATE UNIQUE INDEX "snippets_slug_index" ON "snippets" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "users_old_names_index" ON "users" USING btree ("old_names");