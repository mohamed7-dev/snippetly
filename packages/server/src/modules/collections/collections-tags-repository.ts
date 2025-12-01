import { and, eq, inArray } from "drizzle-orm";
import { Database } from "../../common/db/index";
import {
  collectionsTagsTable,
  type CollectionTag,
  type NewCollectionTag,
} from "../../common/db/schema";

export class CollectionsTagsRepository {
  async insert(input: NewCollectionTag[]) {
    return await Database.client
      .insert(collectionsTagsTable)
      .values(input)
      .returning();
  }

  async delete({
    collectionId,
    tagIds,
  }: Pick<CollectionTag, "collectionId"> & {
    tagIds: CollectionTag["tagId"][];
  }) {
    await Database.client
      .delete(collectionsTagsTable)
      .where(
        and(
          eq(collectionsTagsTable.collectionId, collectionId),
          inArray(collectionsTagsTable.tagId, tagIds)
        )
      );
  }
}
