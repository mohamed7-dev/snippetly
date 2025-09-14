CREATE TABLE "collections" (
	"id" serial PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"color" text NOT NULL,
	"is_private" boolean DEFAULT false NOT NULL,
	"allow_forking" boolean DEFAULT true NOT NULL,
	"forked_from" integer,
	"creator_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "snippets" (
	"id" serial PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"code" text NOT NULL,
	"language" text NOT NULL,
	"description" text,
	"is_private" boolean DEFAULT false NOT NULL,
	"allow_forking" boolean DEFAULT true NOT NULL,
	"forked_from" integer,
	"creator_id" integer NOT NULL,
	"collection_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"added_by" integer
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_private" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_forked_from_collections_id_fk" FOREIGN KEY ("forked_from") REFERENCES "public"."collections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snippets" ADD CONSTRAINT "snippets_forked_from_snippets_id_fk" FOREIGN KEY ("forked_from") REFERENCES "public"."snippets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snippets" ADD CONSTRAINT "snippets_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snippets" ADD CONSTRAINT "snippets_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "collections_slug_index" ON "collections" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "collections_title_index" ON "collections" USING btree ("title");--> statement-breakpoint
CREATE INDEX "collections_creator_id_index" ON "collections" USING btree ("creator_id");--> statement-breakpoint
CREATE UNIQUE INDEX "snippets_slug_index" ON "snippets" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "snippets_title_index" ON "snippets" USING btree ("title");--> statement-breakpoint
CREATE INDEX "snippets_creator_id_index" ON "snippets" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "snippets_collection_id_index" ON "snippets" USING btree ("collection_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_name_index" ON "tags" USING btree ("name");