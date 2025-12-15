CREATE TYPE "public"."friendship_status" AS ENUM('pending', 'accepted', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TABLE "collections" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"old_slugs" text[] DEFAULT '{}' NOT NULL,
	"description" text,
	"color" text NOT NULL,
	"is_private" boolean DEFAULT false NOT NULL,
	"allow_forking" boolean DEFAULT true NOT NULL,
	"forked_from" integer,
	"creator_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collections_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"collection_id" integer NOT NULL,
	"tag_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"requester_id" integer NOT NULL,
	"addressee_id" integer NOT NULL,
	"status" "friendship_status" DEFAULT 'pending' NOT NULL,
	"accepted_at" timestamp,
	"rejected_at" timestamp,
	"cancelled_at" timestamp,
	CONSTRAINT "friendships_requester_id_addressee_id_unique" UNIQUE("requester_id","addressee_id"),
	CONSTRAINT "no_self_friendship" CHECK ("friendships"."requester_id" <> "friendships"."addressee_id")
);
--> statement-breakpoint
CREATE TABLE "snippets" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"old_slugs" text[] DEFAULT '{}' NOT NULL,
	"code" text NOT NULL,
	"language" text NOT NULL,
	"description" text,
	"note" text,
	"is_private" boolean DEFAULT false NOT NULL,
	"allow_forking" boolean DEFAULT true NOT NULL,
	"forked_from" integer,
	"creator_id" integer NOT NULL,
	"collection_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "snippets_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"snippet_id" integer NOT NULL,
	"tag_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"added_by" integer
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"old_names" text[] DEFAULT '{}' NOT NULL,
	"firstName" text,
	"lastName" text,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"bio" text,
	"image" text,
	"image_custom_id" text,
	"image_Key" text,
	"remember_me" boolean DEFAULT false NOT NULL,
	"is_private" boolean DEFAULT false NOT NULL,
	"accepted_policies" boolean DEFAULT false NOT NULL,
	"email_verified_at" timestamp,
	"email_verification_token" text,
	"email_verification_token_expires_at" timestamp,
	"reset_password_token" text,
	"reset_password_token_expires_at" timestamp,
	"refresh_tokens" text[] DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_forked_from_collections_id_fk" FOREIGN KEY ("forked_from") REFERENCES "public"."collections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collections_tags" ADD CONSTRAINT "collections_tags_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collections_tags" ADD CONSTRAINT "collections_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_addressee_id_users_id_fk" FOREIGN KEY ("addressee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snippets" ADD CONSTRAINT "snippets_forked_from_snippets_id_fk" FOREIGN KEY ("forked_from") REFERENCES "public"."snippets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snippets" ADD CONSTRAINT "snippets_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snippets" ADD CONSTRAINT "snippets_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snippets_tags" ADD CONSTRAINT "snippets_tags_snippet_id_snippets_id_fk" FOREIGN KEY ("snippet_id") REFERENCES "public"."snippets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snippets_tags" ADD CONSTRAINT "snippets_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "collections_creator_id_index" ON "collections" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "collections_old_slugs_index" ON "collections" USING btree ("old_slugs");--> statement-breakpoint
CREATE UNIQUE INDEX "collections_slug_index" ON "collections" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "collection_title_search_index" ON "collections" USING gin (to_tsvector('english', "title"));--> statement-breakpoint
CREATE INDEX "collection_description_search_index" ON "collections" USING gin (to_tsvector('english', "description"));--> statement-breakpoint
CREATE INDEX "snippets_creator_id_index" ON "snippets" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "snippets_collection_id_index" ON "snippets" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "snippets_old_slugs_index" ON "snippets" USING btree ("old_slugs");--> statement-breakpoint
CREATE UNIQUE INDEX "snippets_slug_index" ON "snippets" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "snippet_title_search_index" ON "snippets" USING gin (to_tsvector('english', "title"));--> statement-breakpoint
CREATE INDEX "snippet_description_search_index" ON "snippets" USING gin (to_tsvector('english', "description"));--> statement-breakpoint
CREATE UNIQUE INDEX "tags_name_index" ON "tags" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "users_name_index" ON "users" USING btree ("name");--> statement-breakpoint
CREATE INDEX "users_old_names_index" ON "users" USING btree ("old_names");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_index" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_firstName_index" ON "users" USING btree ("firstName");--> statement-breakpoint
CREATE INDEX "users_lastName_index" ON "users" USING btree ("lastName");