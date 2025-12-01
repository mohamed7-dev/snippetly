import { sql } from "drizzle-orm";
import { Database } from "../../common/db/index";
import { type NewTags, tagsTable } from "../../common/db/schema";

export class TagRepository {
  public async insert(input: NewTags[]) {
    return await Database.client
      .insert(tagsTable)
      .values(input)
      .onConflictDoUpdate({
        target: tagsTable.name, // unique constraint on name required!
        set: {
          usageCount: sql`${tagsTable.usageCount} + 1`, // increment usageCount
        },
      })
      .returning();
  }
}
