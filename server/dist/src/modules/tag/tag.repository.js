import { sql } from "drizzle-orm";
import { Database } from "../../common/db/index.js";
import { tagsTable } from "../../common/db/schema.js";
export class TagRepository {
    async insert(input) {
        return await Database.client.insert(tagsTable).values(input).onConflictDoUpdate({
            target: tagsTable.name,
            set: {
                usageCount: sql`${tagsTable.usageCount} + 1`
            }
        }).returning();
    }
}
