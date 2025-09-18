import { and, desc, eq, getTableColumns, or, sql } from "drizzle-orm";
import { Database } from "../../common/db";
import {
  collectionsTable,
  collectionsTagsTable,
  NewCollection,
  snippetsTable,
  Tags,
  tagsTable,
  usersTable,
} from "../../common/db/schema";
import { alias } from "drizzle-orm/pg-core";

export class CollectionRepository {
  public async insert(input: NewCollection[]) {
    return await Database.client
      .insert(collectionsTable)
      .values(input)
      .returning();
  }

  public async update(id: number, input: Partial<NewCollection>) {
    return await Database.client
      .update(collectionsTable)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(collectionsTable.id, id))
      .returning();
  }

  public async delete(id: number) {
    return await Database.client
      .delete(collectionsTable)
      .where(eq(collectionsTable.id, id));
  }

  public async findOne(
    by: "slug" | "id",
    value: number | string,
    isOwner: boolean
  ) {
    const queryCollection = Database.client.query.collectionsTable.findFirst({
      where: (t, { eq, or, and }) =>
        and(
          isOwner ? undefined : eq(t.isPrivate, false),
          or(
            by === "id" ? eq(collectionsTable.id, value as number) : undefined,
            by === "slug"
              ? eq(collectionsTable.slug, value as string)
              : undefined
          )
        ),
      with: {
        creator: {
          columns: {
            id: true,
            name: true,
            lastName: true,
            firstName: true,
            image: true,
          },
        },
        snippets: {
          limit: 3,
          orderBy: (t, { desc }) => desc(t.updatedAt),
          columns: {
            title: true,
            slug: true,
            language: true,
            code: true,
            createdAt: true,
            updatedAt: true,
            id: true,
          },
        },
        tags: {
          with: {
            tag: {
              columns: {
                name: true,
              },
            },
          },
        },
      },
    });

    const [collection, total] = await Promise.all([
      queryCollection,
      Database.client.$count(
        snippetsTable,
        eq(snippetsTable.collectionId, value as number)
      ),
    ]);
    return {
      ...collection,
      snippetsCount: total,
      tags: collection?.tags.map((t) => ({ name: t.tag.name })),
    } as unknown as typeof collection & { tags: Pick<Tags, "name">[] };
  }
}
