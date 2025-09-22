import { and, eq, inArray } from "drizzle-orm";
import { Database } from "../../common/db/index.js";
import { collectionsTagsTable } from "../../common/db/schema.js";
export class CollectionsTagsRepository {
    async insert(input) {
        return await Database.client.insert(collectionsTagsTable).values(input).returning();
    }
    async delete({ collectionId, tagIds }) {
        await Database.client.delete(collectionsTagsTable).where(and(eq(collectionsTagsTable.collectionId, collectionId), inArray(collectionsTagsTable.tagId, tagIds)));
    }
}
