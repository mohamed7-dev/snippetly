import { eq } from "drizzle-orm";
import { Database } from "../../common/db/index.js";
import { snippetsTable } from "../../common/db/schema.js";
export class SnippetRepository {
    async insert(input) {
        return await Database.client.insert(snippetsTable).values(input).returning();
    }
    async update(id, input) {
        return await Database.client.update(snippetsTable).set({
            ...input,
            updatedAt: new Date()
        }).where(eq(snippetsTable.id, id)).returning();
    }
    async delete(id) {
        return await Database.client.delete(snippetsTable).where(eq(snippetsTable.id, id));
    }
    async findOne(by, value, isOwner) {
        const defaultIsOwner = isOwner ?? true;
        const snippet = await Database.client.query.snippetsTable.findFirst({
            where: (t, { eq, or, and })=>and(defaultIsOwner ? undefined : eq(t.isPrivate, false), or(by === "id" ? eq(t.id, value) : undefined, by === "slug" ? eq(t.slug, value) : undefined)),
            extras: {
                forkedCount: Database.client.$count(snippetsTable, eq(snippetsTable.forkedFrom, snippetsTable.id)).as("forked_count")
            },
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
                collection: {
                    columns: {
                        id: true,
                        title: true,
                        slug: true,
                        color: true
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
        return {
            ...snippet,
            forkedCount: Number(snippet?.forkedCount),
            tags: snippet?.tags.map((t)=>({
                    name: t.tag.name
                }))
        };
    }
}
