DROP INDEX "collections_slug_index";--> statement-breakpoint
DROP INDEX "collections_title_index";--> statement-breakpoint
DROP INDEX "snippets_slug_index";--> statement-breakpoint
DROP INDEX "snippets_title_index";--> statement-breakpoint
ALTER TABLE "snippets" ADD COLUMN "note" text;--> statement-breakpoint
CREATE INDEX "collection_title_search_index" ON "collections" USING gin (to_tsvector('english', "title"));--> statement-breakpoint
CREATE INDEX "collection_description_search_index" ON "collections" USING gin (to_tsvector('english', "description"));--> statement-breakpoint
CREATE INDEX "snippet_title_search_index" ON "snippets" USING gin (to_tsvector('english', "title"));--> statement-breakpoint
CREATE INDEX "snippet_description_search_index" ON "snippets" USING gin (to_tsvector('english', "description"));--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "snippets" ADD CONSTRAINT "snippets_slug_unique" UNIQUE("slug");