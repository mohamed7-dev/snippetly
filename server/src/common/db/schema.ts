import {
  type AnyPgColumn,
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { baseTable } from "./utils.ts";
import { relations, sql } from "drizzle-orm";

// ------------------- User -------------------

export const usersTable = pgTable(
  "users",
  {
    ...baseTable,
    name: text("name").notNull(),
    oldNames: text("old_names").array().default([]).notNull(),
    firstName: text("firstName").notNull(),
    lastName: text("lastName").notNull(),
    email: text("email").notNull(),
    password: text("password").notNull(),
    bio: text("bio"),
    image: text("image"),
    rememberMe: boolean("remember_me").default(false).notNull(),
    isPrivate: boolean("is_private").default(false).notNull(),
    acceptedPolicies: boolean("accepted_policies").default(true).notNull(),
    emailVerifiedAt: timestamp("email_verified_at", { mode: "date" }),
    emailVerificationToken: text("email_verification_token"),
    emailVerificationTokenExpiresAt: timestamp(
      "email_verification_token_expires_at",
      { mode: "date" }
    ),
    resetPasswordToken: text("reset_password_token"),
    resetPasswordTokenExpiresAt: timestamp("reset_password_token_expires_at", {
      mode: "date",
    }),
    refreshTokens: text("refresh_tokens").array().default([]).notNull(),
  },
  (t) => [
    uniqueIndex().on(t.name),
    index().on(t.oldNames),
    uniqueIndex().on(t.email),
    index().on(t.firstName),
    index().on(t.lastName),
  ]
);

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

export const usersRelations = relations(usersTable, ({ many }) => ({
  collections: many(collectionsTable),
  snippets: many(snippetsTable),
  addedTags: many(tagsTable),
  friendshipsRequested: many(friendshipsTable, { relationName: "requester" }),
  friendshipsReceived: many(friendshipsTable, { relationName: "addressee" }),
}));

// ------------------- Friendship -------------------

export const friendshipStatus = pgEnum("friendship_status", [
  "pending",
  "accepted",
  "rejected",
  "cancelled",
]);

export const friendshipsTable = pgTable(
  "friendships",
  {
    ...baseTable,
    requesterId: integer("requester_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    addresseeId: integer("addressee_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    status: friendshipStatus("status").default("pending").notNull(),
    acceptedAt: timestamp("accepted_at", { mode: "date" }),
    rejectedAt: timestamp("rejected_at", { mode: "date" }),
    cancelledAt: timestamp("cancelled_at", { mode: "date" }),
  },
  (t) => [
    unique().on(t.requesterId, t.addresseeId),
    check("no_self_friendship", sql`${t.requesterId} <> ${t.addresseeId}`),
  ]
);
export type Friendship = typeof friendshipsTable.$inferSelect;
export type NewFriendship = typeof friendshipsTable.$inferInsert;

export const friendshipsRelations = relations(friendshipsTable, ({ one }) => ({
  requester: one(usersTable, {
    fields: [friendshipsTable.requesterId],
    references: [usersTable.id],
    relationName: "requester",
  }),
  addressee: one(usersTable, {
    fields: [friendshipsTable.addresseeId],
    references: [usersTable.id],
    relationName: "addressee",
  }),
}));

// ------------------- Collections -------------------

export const collectionsTable = pgTable(
  "collections",
  {
    ...baseTable,
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    oldSlugs: text("old_slugs").array().default([]).notNull(),
    description: text("description"),
    color: text("color").notNull(),
    isPrivate: boolean("is_private").default(false).notNull(),
    allowForking: boolean("allow_forking").default(true).notNull(),
    forkedFrom: integer("forked_from").references(
      (): AnyPgColumn => collectionsTable.id,
      {
        onDelete: "set null",
      }
    ),
    creatorId: integer("creator_id")
      .references(() => usersTable.id, {
        onDelete: "cascade",
      })
      .notNull(),
  },
  (t) => [
    index().on(t.creatorId),
    index().on(t.oldSlugs),
    uniqueIndex().on(t.slug),
    index("collection_title_search_index").using(
      "gin",
      sql`to_tsvector('english', ${t.title})`
    ),
    index("collection_description_search_index").using(
      "gin",
      sql`to_tsvector('english', ${t.description})`
    ),
  ]
);
export type Collection = typeof collectionsTable.$inferSelect;
export type NewCollection = typeof collectionsTable.$inferInsert;

export const collectionsRelations = relations(
  collectionsTable,
  ({ one, many }) => ({
    creator: one(usersTable, {
      fields: [collectionsTable.creatorId],
      references: [usersTable.id],
    }),
    forkedFrom: one(collectionsTable, {
      fields: [collectionsTable.forkedFrom],
      references: [collectionsTable.id],
    }),
    snippets: many(snippetsTable),
    tags: many(collectionsTagsTable),
  })
);

// ------------------- Snippets -------------------

export const snippetsTable = pgTable(
  "snippets",
  {
    ...baseTable,
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    oldSlugs: text("old_slugs").array().default([]).notNull(),
    code: text("code").notNull(),
    language: text("language").notNull(),
    description: text("description"),
    note: text("note"),
    isPrivate: boolean("is_private").default(false).notNull(),
    allowForking: boolean("allow_forking").default(true).notNull(),
    forkedFrom: integer("forked_from").references(
      (): AnyPgColumn => snippetsTable.id,
      {
        onDelete: "set null",
      }
    ),
    creatorId: integer("creator_id")
      .references(() => usersTable.id, {
        onDelete: "cascade",
      })
      .notNull(),
    collectionId: integer("collection_id")
      .references(() => collectionsTable.id, {
        onDelete: "cascade",
      })
      .notNull(),
  },
  (t) => [
    index().on(t.creatorId),
    index().on(t.collectionId),
    index().on(t.oldSlugs),
    uniqueIndex().on(t.slug),
    index("snippet_title_search_index").using(
      "gin",
      sql`to_tsvector('english', ${t.title})`
    ),
    index("snippet_description_search_index").using(
      "gin",
      sql`to_tsvector('english', ${t.description})`
    ),
  ]
);
export type Snippet = typeof snippetsTable.$inferSelect;
export type NewSnippet = typeof snippetsTable.$inferInsert;

export const snippetsRelations = relations(snippetsTable, ({ one, many }) => ({
  creator: one(usersTable, {
    fields: [snippetsTable.creatorId],
    references: [usersTable.id],
  }),
  collection: one(collectionsTable, {
    fields: [snippetsTable.collectionId],
    references: [collectionsTable.id],
  }),
  forkedFrom: one(snippetsTable, {
    fields: [snippetsTable.forkedFrom],
    references: [snippetsTable.id],
  }),
  tags: many(snippetsTagsTable),
}));

// ------------------- Tags -------------------

export const tagsTable = pgTable(
  "tags",
  {
    ...baseTable,
    name: text("name").notNull(),
    usageCount: integer("usage_count").default(0).notNull(),
    addedBy: integer("added_by").references(() => usersTable.id, {
      onDelete: "set null",
    }),
  },
  (t) => [uniqueIndex().on(t.name)]
);
export type Tags = typeof tagsTable.$inferSelect;
export type NewTags = typeof tagsTable.$inferInsert;

export const tagsRelations = relations(tagsTable, ({ one, many }) => ({
  addedBy: one(usersTable, {
    fields: [tagsTable.addedBy],
    references: [usersTable.id],
  }),
  collections: many(collectionsTagsTable),
  snippets: many(snippetsTagsTable),
}));

// ------------------- Collection ↔ Tags join -------------------

export const collectionsTagsTable = pgTable("collections_tags", {
  ...baseTable,
  collectionId: integer("collection_id")
    .references(() => collectionsTable.id, { onDelete: "cascade" })
    .notNull(),
  tagId: integer("tag_id")
    .references(() => tagsTable.id, { onDelete: "cascade" })
    .notNull(),
});
export type CollectionTag = typeof collectionsTagsTable.$inferSelect;
export type NewCollectionTag = typeof collectionsTagsTable.$inferInsert;

export const collectionsTagsRelations = relations(
  collectionsTagsTable,
  ({ one }) => ({
    collection: one(collectionsTable, {
      fields: [collectionsTagsTable.collectionId],
      references: [collectionsTable.id],
    }),
    tag: one(tagsTable, {
      fields: [collectionsTagsTable.tagId],
      references: [tagsTable.id],
    }),
  })
);

// ------------------- Snippet ↔ Tags join -------------------

export const snippetsTagsTable = pgTable("snippets_tags", {
  ...baseTable,
  snippetId: integer("snippet_id")
    .references(() => snippetsTable.id, { onDelete: "cascade" })
    .notNull(),
  tagId: integer("tag_id")
    .references(() => tagsTable.id, { onDelete: "cascade" })
    .notNull(),
});
export type SnippetsTags = typeof snippetsTagsTable.$inferSelect;
export type NewSnippetsTags = typeof snippetsTagsTable.$inferInsert;

export const snippetsTagsRelations = relations(
  snippetsTagsTable,
  ({ one }) => ({
    snippet: one(snippetsTable, {
      fields: [snippetsTagsTable.snippetId],
      references: [snippetsTable.id],
    }),
    tag: one(tagsTable, {
      fields: [snippetsTagsTable.tagId],
      references: [tagsTable.id],
    }),
  })
);
