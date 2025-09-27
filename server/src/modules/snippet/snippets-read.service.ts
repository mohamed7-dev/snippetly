import {
  and,
  arrayContains,
  desc,
  eq,
  getTableColumns,
  lt,
  not,
  or,
  sql,
} from "drizzle-orm";
import { Database } from "../../common/db/index.ts";
import {
  collectionsTable,
  friendshipsTable,
  snippetsTable,
  snippetsTagsTable,
  type Tags,
  tagsTable,
  usersTable,
} from "../../common/db/schema.ts";
import type { DiscoverSnippetsDtoType } from "./dto/discover-snippets.dto.ts";
import type { GetUserSnippetsDtoType } from "./dto/get-user-snippets.dto.ts";
import type { GetCollectionSnippetsDtoType } from "./dto/get-collection-snippets.ts";

export class SnippetsReadService {
  async findOneSlim(by: "slug" | "id", value: string | number) {
    return await Database.client.query.snippetsTable.findFirst({
      where: (t, { or, eq }) =>
        or(
          by === "id" ? eq(t.id, value as number) : undefined,
          by === "slug" ? eq(t.slug, value as string) : undefined
        ),
    });
  }

  async findOneSlimByOldSlug(slug: string) {
    return await Database.client.query.snippetsTable.findFirst({
      where: (t) => arrayContains(t.oldSlugs, [slug]),
    });
  }

  async findOneWithCollection(by: "slug" | "id", value: string | number) {
    return await Database.client.query.snippetsTable.findFirst({
      where: (t, { or, eq }) =>
        or(
          by === "id" ? eq(t.id, value as number) : undefined,
          by === "slug" ? eq(t.slug, value as string) : undefined
        ),
      with: {
        collection: {
          columns: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });
  }

  async findOneWithTags(by: "slug" | "id", value: number | string) {
    return await Database.client.query.snippetsTable.findFirst({
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

  async findSnippetsByCollection(
    {
      query,
      limit,
      cursor,
    }: Omit<GetCollectionSnippetsDtoType, "collection"> &
      Required<Pick<GetCollectionSnippetsDtoType, "limit">>,
    collectionId: number,
    isCurrentUserOwner: boolean
  ) {
    const [data, total] = await Promise.all([
      Database.client.query.snippetsTable.findMany({
        where: (t, { and, eq, or }) =>
          and(
            eq(t.collectionId, collectionId),
            isCurrentUserOwner ? undefined : eq(t.isPrivate, false),
            cursor ? lt(snippetsTable.updatedAt, cursor.updatedAt) : undefined,
            query
              ? or(
                  sql`to_tsvector('english', ${snippetsTable.title}) @@ plainto_tsquery('english', ${query})`,
                  sql`to_tsvector('english', ${snippetsTable.description}) @@ plainto_tsquery('english', ${query})`
                )
              : undefined
          ),
        columns: {
          oldSlugs: false,
        },
        with: {
          tags: true,
          creator: {
            columns: {
              name: true,
              firstName: true,
              lastName: true,
              image: true,
            },
          },
        },
        orderBy: (t, { desc }) => desc(t.updatedAt),
        limit: limit + 1,
      }),
      Database.client.$count(
        snippetsTable,
        and(
          eq(snippetsTable.collectionId, collectionId),
          isCurrentUserOwner ? undefined : eq(snippetsTable.isPrivate, false),
          query
            ? or(
                sql`to_tsvector('english', ${snippetsTable.title}) @@ plainto_tsquery('english', ${query})`,
                sql`to_tsvector('english', ${snippetsTable.description}) @@ plainto_tsquery('english', ${query})`
              )
            : undefined
        )
      ),
    ]);
    return { data, total };
  }

  async discover({
    limit,
    cursor,
    query,
    loggedInUserId,
  }: DiscoverSnippetsDtoType &
    Required<Pick<DiscoverSnippetsDtoType, "limit">> & {
      loggedInUserId?: number;
    }) {
    const [data, total] = await Promise.all([
      Database.client
        .select({
          ...getTableColumns(snippetsTable),
          creator: {
            id: usersTable.id,
            name: usersTable.name,
            image: usersTable.image,
            firstName: usersTable.firstName,
            lastName: usersTable.lastName,
          },
          collection: {
            id: usersTable.id,
            title: collectionsTable.title,
            slug: collectionsTable.slug,
            color: collectionsTable.color,
          },
          forkedCount: Database.client.$count(
            snippetsTable,
            eq(snippetsTable.forkedFrom, snippetsTable.id)
          ),
          tags: sql<Pick<Tags, "name">[] | []>`
          (
              SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
              FROM (
                  SELECT tg.id, tg.name
                  FROM ${snippetsTagsTable} st
                  INNER JOIN ${tagsTable} tg ON tg.id = st.tag_id
                  WHERE st.snippet_id = ${snippetsTable.id}
                  ORDER BY tg.name ASC
              ) t
          )
          `.as("tags"),
        })
        .from(snippetsTable)
        .innerJoin(usersTable, eq(snippetsTable.creatorId, usersTable.id))
        .innerJoin(
          collectionsTable,
          eq(collectionsTable.id, snippetsTable.collectionId)
        )
        .where(
          and(
            eq(snippetsTable.isPrivate, false),
            cursor ? lt(snippetsTable.updatedAt, cursor.updatedAt) : undefined,
            query
              ? or(
                  sql`to_tsvector('english', ${snippetsTable.title}) @@ plainto_tsquery('english', ${query})`,
                  sql`to_tsvector('english', ${snippetsTable.description}) @@ plainto_tsquery('english', ${query})`
                )
              : undefined,
            loggedInUserId
              ? not(eq(snippetsTable.creatorId, loggedInUserId))
              : undefined
          )
        )
        .limit(limit + 1)
        .orderBy(desc(snippetsTable.updatedAt)),
      Database.client.$count(
        snippetsTable,
        and(
          eq(snippetsTable.isPrivate, false),
          query
            ? or(
                sql`to_tsvector('english', ${snippetsTable.title}) @@ plainto_tsquery('english', ${query})`,
                sql`to_tsvector('english', ${snippetsTable.description}) @@ plainto_tsquery('english', ${query})`
              )
            : undefined,
          loggedInUserId
            ? not(eq(snippetsTable.creatorId, loggedInUserId))
            : undefined
        )
      ),
    ]);

    return { data, total };
  }

  async findUserSnippets(
    {
      limit,
      query,
      cursor,
    }: Omit<GetUserSnippetsDtoType, "creatorName"> &
      Required<Pick<GetUserSnippetsDtoType, "limit">>,
    creatorId: number,
    isCurrentUserOwner: boolean
  ) {
    const [data, total] = await Promise.all([
      Database.client
        .select({
          ...getTableColumns(snippetsTable),
          creator: {
            id: usersTable.id,
            name: usersTable.name,
            image: usersTable.image,
            firstName: usersTable.firstName,
            lastName: usersTable.lastName,
          },
          collection: {
            id: usersTable.id,
            title: collectionsTable.title,
            slug: collectionsTable.slug,
            color: collectionsTable.color,
          },
          forkedCount: Database.client.$count(
            snippetsTable,
            eq(snippetsTable.forkedFrom, snippetsTable.id)
          ),
          tags: sql<Pick<Tags, "name">[] | []>`
            (
              SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
              FROM (
                  SELECT tg.id, tg.name
                  FROM ${snippetsTagsTable} st
                  INNER JOIN ${tagsTable} tg ON tg.id = st.tag_id
                  WHERE st.snippet_id = ${collectionsTable.id}
                  ORDER BY tg.name ASC
              ) t
            )
            `.as("tags"),
        })
        .from(snippetsTable)
        .innerJoin(usersTable, eq(snippetsTable.creatorId, usersTable.id))
        .innerJoin(
          collectionsTable,
          eq(collectionsTable.id, snippetsTable.collectionId)
        )
        .where(
          and(
            eq(snippetsTable.creatorId, creatorId),
            isCurrentUserOwner ? undefined : eq(snippetsTable.isPrivate, false),
            cursor ? lt(snippetsTable.updatedAt, cursor.updatedAt) : undefined,
            query
              ? or(
                  sql`to_tsvector('english', ${snippetsTable.title}) @@ plainto_tsquery('english', ${query})`,
                  sql`to_tsvector('english', ${snippetsTable.description}) @@ plainto_tsquery('english', ${query})`
                )
              : undefined
          )
        )
        .limit(limit + 1)
        .orderBy(desc(snippetsTable.updatedAt)),

      Database.client.$count(
        snippetsTable,
        and(
          eq(snippetsTable.creatorId, creatorId),
          isCurrentUserOwner ? undefined : eq(snippetsTable.isPrivate, false),
          query
            ? or(
                sql`to_tsvector('english', ${snippetsTable.title}) @@ plainto_tsquery('english', ${query})`,
                sql`to_tsvector('english', ${snippetsTable.description}) @@ plainto_tsquery('english', ${query})`
              )
            : undefined
        )
      ),
    ]);

    return { data, total };
  }

  async findUserFriendsSnippets(
    {
      limit,
      query,
      cursor,
    }: Omit<GetUserSnippetsDtoType, "creatorName"> &
      Required<Pick<GetUserSnippetsDtoType, "limit">>,
    userId: number
  ) {
    const [data, total] = await Promise.all([
      Database.client
        .select({
          ...getTableColumns(snippetsTable),
          creator: {
            id: usersTable.id,
            name: usersTable.name,
            image: usersTable.image,
            firstName: usersTable.firstName,
            lastName: usersTable.lastName,
          },
          collection: {
            id: usersTable.id,
            title: collectionsTable.title,
            slug: collectionsTable.slug,
            color: collectionsTable.color,
          },
          forkedCount: Database.client.$count(
            snippetsTable,
            eq(snippetsTable.forkedFrom, snippetsTable.id)
          ),
          tags: sql<Pick<Tags, "name">[] | []>`
            (
              SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
              FROM (
                  SELECT tg.id, tg.name
                  FROM ${snippetsTagsTable} st
                  INNER JOIN ${tagsTable} tg ON tg.id = st.tag_id
                  WHERE st.snippet_id = ${collectionsTable.id}
                  ORDER BY tg.name ASC
              ) t
            )
            `.as("tags"),
        })
        .from(snippetsTable)
        .innerJoin(usersTable, eq(snippetsTable.creatorId, usersTable.id))
        .innerJoin(
          collectionsTable,
          eq(collectionsTable.id, snippetsTable.collectionId)
        )
        .where(
          and(
            eq(snippetsTable.isPrivate, false),
            or(
              // Friend is requester, user is addressee
              sql`${snippetsTable.creatorId} IN (
                SELECT f.requester_id
                FROM ${friendshipsTable} f
                WHERE f.addressee_id = ${userId} AND f.status = 'accepted'
              )`,
              // Friend is addressee, user is requester
              sql`${snippetsTable.creatorId} IN (
                SELECT f.addressee_id
                FROM ${friendshipsTable} f
                WHERE f.requester_id = ${userId} AND f.status = 'accepted'
              )`
            ),
            cursor ? lt(snippetsTable.updatedAt, cursor.updatedAt) : undefined,
            query
              ? or(
                  sql`to_tsvector('english', ${snippetsTable.title}) @@ plainto_tsquery('english', ${query})`,
                  sql`to_tsvector('english', ${snippetsTable.description}) @@ plainto_tsquery('english', ${query})`
                )
              : undefined
          )
        )
        .limit(limit + 1)
        .orderBy(desc(snippetsTable.updatedAt)),

      Database.client.$count(
        snippetsTable,
        and(
          eq(snippetsTable.isPrivate, false),
          or(
            // Friend is requester, user is addressee
            sql`${snippetsTable.creatorId} IN (
                SELECT f.requester_id
                FROM ${friendshipsTable} f
                WHERE f.addressee_id = ${userId} AND f.status = 'accepted'
              )`,
            // Friend is addressee, user is requester
            sql`${snippetsTable.creatorId} IN (
                SELECT f.addressee_id
                FROM ${friendshipsTable} f
                WHERE f.requester_id = ${userId} AND f.status = 'accepted'
              )`
          ),
          query
            ? or(
                sql`to_tsvector('english', ${snippetsTable.title}) @@ plainto_tsquery('english', ${query})`,
                sql`to_tsvector('english', ${snippetsTable.description}) @@ plainto_tsquery('english', ${query})`
              )
            : undefined
        )
      ),
    ]);

    return { data, total };
  }
}
