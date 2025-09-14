import { and, eq, inArray } from "drizzle-orm";
import { Database } from "../../common/db";
import {
  CollectionTag,
  NewSnippetsTags,
  SnippetsTags,
  snippetsTagsTable,
} from "../../common/db/schema";

export class SnippetsTagsRepository {
  async insert(input: NewSnippetsTags[]) {
    return await Database.client
      .insert(snippetsTagsTable)
      .values(input)
      .returning();
  }

  async delete({
    snippetId,
    tagIds,
  }: Pick<SnippetsTags, "snippetId"> & {
    tagIds: CollectionTag["tagId"][];
  }) {
    await Database.client
      .delete(snippetsTagsTable)
      .where(
        and(
          eq(snippetsTagsTable.snippetId, snippetId),
          inArray(snippetsTagsTable.tagId, tagIds)
        )
      );
  }
}
