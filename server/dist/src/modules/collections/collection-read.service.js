import { and, arrayContains, desc, eq, getTableColumns, lt, or, sql } from "drizzle-orm";
import { Database } from "../../common/db/index.js";
import { collectionsTable } from "../../common/db/schema.js";
import { collectionsTagsTable } from "../../common/db/schema.js";
import { snippetsTable } from "../../common/db/schema.js";
import { tagsTable } from "../../common/db/schema.js";
import { usersTable } from "../../common/db/schema.js";
export class CollectionReadService {
    /**
   * NO Joined fields
   */ async findOneSlim(by, value) {
        return await Database.client.query.collectionsTable.findFirst({
            where: (t, { or, eq })=>or(by === "id" ? eq(t.id, value) : undefined, by === "slug" ? eq(t.slug, value) : undefined)
        });
    }
    /**
   * NO Joined fields
   */ async findOneSlimByOldSlug(slug) {
        return await Database.client.query.collectionsTable.findFirst({
            where: (t)=>arrayContains(t.oldSlugs, [
                    slug
                ])
        });
    }
    async findOneSlimWithCreator(by, value) {
        return await Database.client.query.collectionsTable.findFirst({
            where: (t, { or, eq })=>or(by === "id" ? eq(t.id, value) : undefined, by === "slug" ? eq(t.slug, value) : undefined),
            with: {
                creator: {
                    columns: {
                        password: false,
                        refreshTokens: false
                    }
                }
            }
        });
    }
    async findOneWithTags(by, value) {
        return await Database.client.query.collectionsTable.findFirst({
            where: (t, { or, eq })=>or(by === "id" ? eq(t.id, value) : undefined, by === "slug" ? eq(t.slug, value) : undefined),
            with: {
                tags: {
                    with: {
                        tag: true
                    }
                }
            }
        });
    }
    async discover({ limit, cursor, query }) {
        const [data, total] = await Promise.all([
            Database.client.select({
                ...getTableColumns(collectionsTable),
                creator: {
                    id: usersTable.id,
                    name: usersTable.name,
                    image: usersTable.image,
                    firstName: usersTable.firstName,
                    lastName: usersTable.lastName
                },
                forkedCount: Database.client.$count(collectionsTable, eq(collectionsTable.forkedFrom, collectionsTable.id)),
                tags: sql`
          (
              SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
              FROM (
                  SELECT tg.id, tg.name
                  FROM ${collectionsTagsTable} ct
                  INNER JOIN ${tagsTable} tg ON tg.id = ct.tag_id
                  WHERE ct.collection_id = ${collectionsTable.id}
                  ORDER BY tg.name ASC
              ) t
          )
          `.as("tags")
            }).from(collectionsTable).innerJoin(usersTable, eq(collectionsTable.creatorId, usersTable.id)).where(and(eq(collectionsTable.isPrivate, false), cursor ? lt(collectionsTable.updatedAt, cursor.updatedAt) : undefined, query ? or(sql`to_tsvector('english', ${collectionsTable.title}) @@ plainto_tsquery('english', ${query})`, sql`to_tsvector('english', ${collectionsTable.description}) @@ plainto_tsquery('english', ${query})`) : undefined)).limit(limit + 1).orderBy(desc(collectionsTable.updatedAt)),
            Database.client.$count(collectionsTable, and(eq(collectionsTable.isPrivate, false), query ? or(sql`to_tsvector('english', ${collectionsTable.title}) @@ plainto_tsquery('english', ${query})`, sql`to_tsvector('english', ${collectionsTable.description}) @@ plainto_tsquery('english', ${query})`) : undefined))
        ]);
        return {
            data,
            total
        };
    }
    async findUserCollections({ limit, query, cursor }, creatorId, isCurrentUserOwner) {
        const collectionsQuery = Database.client.query.collectionsTable.findMany({
            where: (t, { eq, or, and, lt })=>and(eq(t.creatorId, creatorId), isCurrentUserOwner ? undefined : eq(t.isPrivate, false), cursor ? lt(t.updatedAt, cursor.updatedAt) : undefined, query ? or(sql`to_tsvector('english', ${t.title}) @@ plainto_tsquery('english', ${query})`, sql`to_tsvector('english', ${t.description}) @@ plainto_tsquery('english', ${query})`) : undefined),
            orderBy: (t, { desc })=>desc(t.updatedAt),
            limit: limit + 1,
            with: {
                creator: {
                    columns: {
                        name: true,
                        firstName: true,
                        lastName: true,
                        image: true,
                        id: true
                    }
                },
                tags: {
                    with: {
                        tag: {
                            columns: {
                                name: true,
                                id: true
                            }
                        }
                    }
                },
                snippets: {
                    limit: 3,
                    orderBy: (t, { desc })=>desc(t.updatedAt),
                    columns: {
                        title: true,
                        slug: true,
                        language: true,
                        id: true,
                        createdAt: true,
                        updatedAt: true
                    }
                }
            },
            columns: {
                oldSlugs: false
            }
        });
        const collectionSnippetsCountQuery = Database.client.select({
            collectionId: snippetsTable.collectionId,
            count: sql`count(*)`
        }).from(snippetsTable).groupBy(snippetsTable.collectionId);
        const [data, snippetsCounts, total] = await Promise.all([
            collectionsQuery,
            collectionSnippetsCountQuery,
            Database.client.$count(collectionsTable, and(eq(collectionsTable.creatorId, creatorId), isCurrentUserOwner ? undefined : eq(collectionsTable.isPrivate, false), query ? or(sql`to_tsvector('english', ${collectionsTable.title}) @@ plainto_tsquery('english', ${query})`, sql`to_tsvector('english', ${collectionsTable.description}) @@ plainto_tsquery('english', ${query})`) : undefined))
        ]);
        // Map collectionId → count
        const countsMap = Object.fromEntries(snippetsCounts.map((c)=>[
                c.collectionId,
                Number(c.count)
            ]));
        const collections = data.map((col)=>({
                ...col,
                snippetsCount: countsMap[col.id.toString()] ?? 0,
                tags: col.tags.map((tag)=>({
                        name: tag.tag.name
                    }))
            }));
        return {
            data: collections,
            total
        };
    }
    async getUserCollectionsStats(userId) {
        const [stats] = await Database.client.select({
            totalCollections: Database.client.$count(collectionsTable, eq(collectionsTable.creatorId, userId)),
            publicCollections: Database.client.$count(collectionsTable, and(eq(collectionsTable.creatorId, userId), eq(collectionsTable.isPrivate, false))),
            totalSnippets: sql`
          (
            select count(*) 
            from ${snippetsTable} 
            where ${snippetsTable.collectionId} in (
              select ${collectionsTable.id}
              from ${collectionsTable}
              where ${collectionsTable.creatorId} = ${userId}
            )
          )
        `.as("totalSnippets"),
            forkedCollections: Database.client.$count(collectionsTable, eq(collectionsTable.forkedFrom, collectionsTable.id))
        }).from(collectionsTable);
        return stats ? Object.fromEntries(Object.entries(stats).map(([key, value])=>[
                key,
                typeof value === "number" ? value : Number(value)
            ])) : {
            forkedCollections: 0,
            totalSnippets: 0,
            publicCollections: 0,
            totalCollections: 0
        };
    }
}
