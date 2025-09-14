import { and, desc, eq, getTableColumns, like, lt, or, sql } from "drizzle-orm";
import { Database } from "../../common/db";
import {
  collectionsTable,
  collectionsTagsTable,
  snippetsTable,
  tagsTable,
  usersTable,
} from "../../common/db/schema";
import {
  DiscoverCollectionsDtoType,
  FindCollectionDtoType,
  FindCollectionsDtoType,
} from "./dto/find-collection.dto";

export class CollectionReadService {
  /**
   * NO Joined fields
   */
  async findOneSlim(by: "slug" | "id", value: number | string) {
    return await Database.client
      .select()
      .from(collectionsTable)
      .where(
        or(
          by === "id" ? eq(collectionsTable.id, value as number) : undefined,
          by === "slug" ? eq(collectionsTable.slug, value as string) : undefined
        )
      );
  }

  async findOneWithTags(by: "slug" | "id", value: number | string) {
    return await Database.client.query.collectionsTable.findFirst({
      where: (t, { or, eq }) =>
        or(
          by === "id" ? eq(t.id, value as number) : undefined,
          by === "slug" ? eq(t.slug, value as string) : undefined
        ),
      with: {
        tags: {
          with: {
            tag: true,
          },
        },
      },
    });
  }

  async discover({
    limit,
    cursor,
    query,
  }: DiscoverCollectionsDtoType &
    Required<Pick<DiscoverCollectionsDtoType, "limit">>) {
    const [data, total] = await Promise.all([
      Database.client
        .select({
          ...getTableColumns(collectionsTable),
          creator: {
            id: usersTable.id,
            name: usersTable.name,
            image: usersTable.image,
            firstName: usersTable.firstName,
            lastName: usersTable.lastName,
          },
          tags: sql<null | string>`
        (
            SELECT json_agg(row_to_json(t))
            FROM (
                SELECT tg.id, tg.name
                FROM ${collectionsTagsTable} ct
                INNER JOIN ${tagsTable} tg ON tg.id = ct.tag_id
                WHERE ct.collection_id = ${collectionsTable.id}
                ORDER BY tg.name ASC
            ) t
        )
        `.as("tags"),
        })
        .from(collectionsTable)
        .innerJoin(usersTable, eq(collectionsTable.creatorId, usersTable.id))
        .where(
          and(
            eq(collectionsTable.isPrivate, false),
            cursor
              ? lt(collectionsTable.updatedAt, cursor.updatedAt)
              : undefined,
            query
              ? or(
                  sql`to_tsvector('english', ${collectionsTable.title}) @@ plainto_tsquery('english', ${query})`,
                  sql`to_tsvector('english', ${collectionsTable.description}) @@ plainto_tsquery('english', ${query})`
                )
              : undefined
          )
        )
        .limit(limit + 1)
        .orderBy(desc(collectionsTable.updatedAt)),
      Database.client.$count(
        collectionsTable,
        and(
          eq(collectionsTable.isPrivate, false),
          query
            ? or(
                sql`to_tsvector('english', ${collectionsTable.title}) @@ plainto_tsquery('english', ${query})`,
                sql`to_tsvector('english', ${collectionsTable.description}) @@ plainto_tsquery('english', ${query})`
              )
            : undefined
        )
      ),
    ]);

    return { data, total };
  }

  async findUserCollections(
    {
      limit,
      query,
      cursor,
    }: Omit<FindCollectionsDtoType, "creator"> &
      Required<Pick<FindCollectionsDtoType, "limit">>,
    creatorId: number,
    isCurrentUserOwner: boolean
  ) {
    const [data, total] = await Promise.all([
      Database.client
        .select({
          ...getTableColumns(collectionsTable),
          creator: {
            id: usersTable.id,
            name: usersTable.name,
            image: usersTable.image,
            firstName: usersTable.firstName,
            lastName: usersTable.lastName,
          },
          tags: sql<null | string>`
          (
            SELECT json_agg(row_to_json(t))
            FROM (
                SELECT tg.id, tg.name
                FROM ${collectionsTagsTable} ct
                INNER JOIN ${tagsTable} tg ON tg.id = ct.tag_id
                WHERE ct.collection_id = ${collectionsTable.id}
                ORDER BY tg.name ASC
            ) t
          )
          `.as("tags"),
          snippets: sql<null | string>`
          (
            SELECT json_agg(row_to_json(t))
            FROM (
                SELECT s.id, s.title, s.slug, s.language
                FROM ${snippetsTable} s
                WHERE s.collection_id = ${collectionsTable.id}
                ORDER BY s.created_at DESC
                LIMIT 3
            ) t
          )
          `.as("snippets"),
          snippetsCount: sql<number>`
          (
            SELECT COUNT(*)
            FROM ${snippetsTable} s
            WHERE s.collection_id = ${collectionsTable.id}
          )
          `.as("snippets_count"),
        })
        .from(collectionsTable)
        .innerJoin(usersTable, eq(collectionsTable.creatorId, usersTable.id))
        .where(
          and(
            eq(collectionsTable.creatorId, creatorId),
            isCurrentUserOwner
              ? undefined
              : eq(collectionsTable.isPrivate, false),
            cursor
              ? lt(collectionsTable.updatedAt, cursor.updatedAt)
              : undefined,
            query
              ? or(
                  sql`to_tsvector('english', ${collectionsTable.title}) @@ plainto_tsquery('english', ${query})`,
                  sql`to_tsvector('english', ${collectionsTable.description}) @@ plainto_tsquery('english', ${query})`
                )
              : undefined
          )
        )
        .limit(limit + 1)
        .orderBy(desc(collectionsTable.updatedAt)),

      Database.client.$count(
        collectionsTable,
        and(
          eq(collectionsTable.creatorId, creatorId),
          isCurrentUserOwner
            ? undefined
            : eq(collectionsTable.isPrivate, false),
          query
            ? or(
                sql`to_tsvector('english', ${collectionsTable.title}) @@ plainto_tsquery('english', ${query})`,
                sql`to_tsvector('english', ${collectionsTable.description}) @@ plainto_tsquery('english', ${query})`
              )
            : undefined
        )
      ),
    ]);

    return { data, total };
  }

  async getUserCollectionsStats(userId: number) {
    const [stats] = await Database.client
      .select({
        userId: usersTable.id,
        totalCollections: Database.client.$count(
          collectionsTable,
          eq(collectionsTable.creatorId, userId)
        ),
        publicCollections: Database.client.$count(
          collectionsTable,
          eq(collectionsTable.isPrivate, false)
        ),
        totalSnippets: Database.client.$count(
          snippetsTable,
          eq(snippetsTable.collectionId, collectionsTable.id)
        ),
      })
      .from(usersTable)
      .leftJoin(
        collectionsTable,
        eq(collectionsTable.creatorId, usersTable.id)
      );

    return stats;
  }
}
