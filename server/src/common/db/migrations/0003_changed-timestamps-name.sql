ALTER TABLE "collections" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "collections" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "collections_tags" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "collections_tags" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "friendships" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "friendships" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "snippets" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "snippets" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "snippets_tags" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "snippets_tags" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "tags" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "tags" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "updatedAt" TO "updated_at";