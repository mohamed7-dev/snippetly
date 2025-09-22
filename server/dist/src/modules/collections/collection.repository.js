import { eq } from "drizzle-orm";
import { Database } from "../../common/db/index.js";
import { collectionsTable } from "../../common/db/schema.js";
import { snippetsTable } from "../../common/db/schema.js";
export class CollectionRepository {
    async insert(input) {
        return await Database.client.insert(collectionsTable).values(input).returning();
    }
    async update(id, input) {
        return await Database.client.update(collectionsTable).set({
            ...input,
            updatedAt: new Date()
        }).where(eq(collectionsTable.id, id)).returning();
    }
    async delete(id) {
        return await Database.client.delete(collectionsTable).where(eq(collectionsTable.id, id));
    }
    async findOne(by, value, isOwner) {
        const queryCollection = Database.client.query.collectionsTable.findFirst({
            where: (t, { eq, or, and })=>and(isOwner ? undefined : eq(t.isPrivate, false), or(by === "id" ? eq(collectionsTable.id, value) : undefined, by === "slug" ? eq(collectionsTable.slug, value) : undefined)),
            with: {
                creator: {
                    columns: {
                        id: true,
                        name: true,
                        lastName: true,
                        firstName: true,
                        image: true
                    }
                },
                snippets: {
                    limit: 3,
                    orderBy: (t, { desc })=>desc(t.updatedAt),
                    columns: {
                        title: true,
                        slug: true,
                        language: true,
                        code: true,
                        createdAt: true,
                        updatedAt: true,
                        id: true
                    }
                },
                tags: {
                    with: {
                        tag: {
                            columns: {
                                name: true
                            }
                        }
                    }
                }
            }
        });
        const [collection, total] = await Promise.all([
            queryCollection,
            Database.client.$count(snippetsTable, eq(snippetsTable.collectionId, value))
        ]);
        return {
            ...collection,
            snippetsCount: total,
            tags: collection?.tags.map((t)=>({
                    name: t.tag.name
                }))
        };
    }
}
