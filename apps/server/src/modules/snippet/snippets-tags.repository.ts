import { and, eq, inArray } from "drizzle-orm";
import { Database } from "../../common/db/index";
import { snippetsTagsTable } from "../../common/db/schema";
import type {
  CollectionTag,
  NewSnippetsTags,
  SnippetsTags,
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
