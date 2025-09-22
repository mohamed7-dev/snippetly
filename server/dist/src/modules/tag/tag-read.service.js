import { desc, inArray } from "drizzle-orm";
import { Database } from "../../common/db/index.js";
import { tagsTable } from "../../common/db/schema.js";
export class TagReadService {
    async findTagsByNames(names) {
        return await Database.client.select().from(tagsTable).where(inArray(tagsTable.name, names));
    }
    async findPopularTags() {
        return await Database.client.select({
            id: tagsTable.id,
            name: tagsTable.name,
            count: tagsTable.usageCount
        }).from(tagsTable).orderBy(desc(tagsTable.usageCount)).limit(10);
    }
}
