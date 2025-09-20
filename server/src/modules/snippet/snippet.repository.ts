import { eq, isNotNull } from "drizzle-orm";
import { Database } from "../../common/db";
import { NewSnippet, snippetsTable, Tags } from "../../common/db/schema";

export class SnippetRepository {
  async insert(input: NewSnippet[]) {
    return await Database.client
      .insert(snippetsTable)
      .values(input)
      .returning();
  }

  async update(id: number, input: Partial<NewSnippet>) {
    return await Database.client
      .update(snippetsTable)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(snippetsTable.id, id))
      .returning();
  }

  async delete(id: number) {
    return await Database.client
      .delete(snippetsTable)
      .where(eq(snippetsTable.id, id));
  }

  public async findOne(
    by: "slug" | "id",
    value: number | string,
    isOwner?: boolean
  ) {
    const defaultIsOwner = isOwner ?? true;
    const snippet = await Database.client.query.snippetsTable.findFirst({
      where: (t, { eq, or, and }) =>
        and(
          defaultIsOwner ? undefined : eq(t.isPrivate, false),
          or(
            by === "id" ? eq(t.id, value as number) : undefined,
            by === "slug" ? eq(t.slug, value as string) : undefined
          )
        ),
      extras: {
        forkedCount: Database.client
          .$count(snippetsTable, eq(snippetsTable.forkedFrom, snippetsTable.id))
          .as("forked_count"),
      },
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
        collection: {
          columns: {
            id: true,
            title: true,
            slug: true,
            color: true,
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

    return {
      ...snippet,
      forkedCount: Number(snippet?.forkedCount),
      tags: snippet?.tags.map((t) => ({
        name: t.tag.name,
      })),
    } as unknown as typeof snippet & { tags: Pick<Tags, "name">[] };
  }
}
