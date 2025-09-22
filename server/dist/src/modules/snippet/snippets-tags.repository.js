import { and, eq, inArray } from "drizzle-orm";
import { Database } from "../../common/db/index.js";
import { snippetsTagsTable } from "../../common/db/schema.js";
export class SnippetsTagsRepository {
    async insert(input) {
        return await Database.client.insert(snippetsTagsTable).values(input).returning();
    }
    async delete({ snippetId, tagIds }) {
        await Database.client.delete(snippetsTagsTable).where(and(eq(snippetsTagsTable.snippetId, snippetId), inArray(snippetsTagsTable.tagId, tagIds)));
    }
}
