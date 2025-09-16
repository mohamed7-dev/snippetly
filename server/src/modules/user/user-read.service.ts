import {
  and,
  arrayContains,
  desc,
  eq,
  isNotNull,
  like,
  lt,
  or,
  sql,
} from "drizzle-orm";
import { Database } from "../../common/db";
import {
  collectionsTable,
  friendshipsTable,
  snippetsTable,
  snippetsTagsTable,
  Tags,
  tagsTable,
  usersTable,
} from "../../common/db/schema";
import { DiscoverUsersDtoType } from "./dto/discover-users.dto";

export class UserReadService {
  /**
   * @description
   * without joining.
   */
  public async findOneSlim(
    by: "name" | "id" | "email",
    value: string | number,
    exact?: boolean
  ) {
    return await Database.client.query.usersTable.findFirst({
      where: (t, { or, eq, like }) =>
        or(
          by === "name"
            ? exact
              ? eq(t.name, value as string)
              : like(t.name, value as string)
            : undefined,
          by === "email" ? eq(t.email, value as string) : undefined,
          by === "id" ? eq(t.id, value as number) : undefined
        ),
    });
  }

  /**
   * @description
   * without joining.
   */
  public async findOneByRefreshToken(refreshToken: string) {
    return await Database.client.query.usersTable.findFirst({
      where: (t) => arrayContains(t.refreshTokens, [refreshToken]),
    });
  }

  /**
   * @description
   * without joining.
   */
  public async findOneByEmailVToken(emailVToken: string) {
    return await Database.client.query.usersTable.findFirst({
      where: (t, { eq }) => eq(t.emailVerificationToken, emailVToken),
    });
  }

  /**
   * @description
   * without joining.
   */
  public async findOneByResetToken(passwordRToken: string) {
    return await Database.client.query.usersTable.findFirst({
      where: (t, { eq }) => eq(t.resetPasswordToken, passwordRToken),
    });
  }

  /**
   * @description
   * without joining.
   */
  async findManySlim(
    by: "name" | "id" | "email",
    value: string | number,
    exact?: boolean
  ) {
    return await Database.client.query.usersTable.findMany({
      where: (t, { or, eq, like }) =>
        or(
          by === "name"
            ? exact
              ? eq(t.name, value as string)
              : like(t.name, value as string)
            : undefined,
          by === "email" ? eq(t.email, value as string) : undefined,
          by === "id" ? eq(t.id, value as number) : undefined
        ),
      columns: {
        password: false,
      },
    });
  }

  async discoverUsers({
    cursor,
    limit,
    query: searchString,
  }: DiscoverUsersDtoType & Required<Pick<DiscoverUsersDtoType, "limit">>) {
    const snippetsCount = Database.client.$count(
      snippetsTable,
      eq(snippetsTable.creatorId, usersTable.id)
    );

    const query = Database.client
      .select({
        id: usersTable.id,
        name: usersTable.name,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        email: usersTable.email,
        bio: usersTable.bio,
        friendsCount: Database.client.$count(
          friendshipsTable,
          and(
            eq(friendshipsTable.status, "accepted"),
            or(
              eq(friendshipsTable.requesterId, usersTable.id),
              eq(friendshipsTable.addresseeId, usersTable.id)
            )
          )
        ),
        snippetsCount,
        tags: sql<Pick<Tags, "name" | "id" | "addedBy">[] | []>`(
          SELECT COALESCE(json_agg(row_to_json(tag_row)), '[]'::json)
          FROM (
            SELECT t.name, t.id, t.added_by
            FROM ${tagsTable} t
            WHERE t.added_by = ${usersTable.id}
            ORDER BY t.created_at DESC
            LIMIT 5
          ) tag_row
        )`.as("tags"),
      })
      .from(usersTable)
      .where(
        and(
          eq(usersTable.isPrivate, false),
          searchString
            ? or(
                like(usersTable.name, `%${searchString}%`),
                like(usersTable.email, `%${searchString}%`)
              )
            : undefined,
          cursor
            ? or(
                lt(snippetsCount, cursor.snippetsCount),
                and(
                  eq(snippetsCount, cursor.snippetsCount),
                  lt(usersTable.id, cursor.id)
                )
              )
            : undefined
        )
      )
      .limit(limit + 1)
      .orderBy(desc(snippetsCount), desc(usersTable.id));

    const [data, total] = await Promise.all([
      query,
      Database.client.$count(
        usersTable,
        and(
          eq(usersTable.isPrivate, false),
          searchString
            ? or(
                like(usersTable.name, `%${searchString}%`),
                like(usersTable.email, `%${searchString}%`)
              )
            : undefined
        )
      ),
    ]);

    return { data, total };
  }

  async getUserForDashboard({ userId }: { userId: number }) {
    const snippetTags = Database.client.$with("snippet_tags").as(
      Database.client
        .select({
          snippetId: sql<number>`t.snippet_id`.as("snippet_id"),
          tags: sql<string | null>`
                json_agg(row_to_json(t)) FILTER (WHERE t.id IS NOT NULL)
          `.as("tags"),
        })
        .from(
          sql`(
            SELECT st.snippet_id, tg.id, tg.name
            FROM ${snippetsTagsTable} st
            JOIN ${tagsTable} tg ON tg.id = st.tag_id
            ORDER BY st.created_at DESC
          ) t`
        )
        .groupBy(sql`t.snippet_id`)
    );

    const userSnippets = Database.client.$with("user_snippets").as(
      Database.client
        .select({
          title: snippetsTable.title,
          slug: snippetsTable.slug,
          id: snippetsTable.id,
          code: snippetsTable.code,
          language: snippetsTable.language,
          description: snippetsTable.description,
          createdAt: snippetsTable.createdAt,
          updatedAt: snippetsTable.updatedAt,
          creatorId: snippetsTable.creatorId,
          tags: snippetTags.tags,
        })
        .from(snippetsTable)
        .leftJoin(snippetTags, eq(snippetTags.snippetId, snippetsTable.id))
        .where(eq(snippetsTable.creatorId, userId))
        .orderBy(desc(snippetsTable.updatedAt))
        .limit(5)
    );

    const userCollections = Database.client.$with("user_collections").as(
      Database.client
        .select({
          title: collectionsTable.title,
          slug: collectionsTable.slug,
          id: collectionsTable.id,
          color: collectionsTable.color,
          createdAt: collectionsTable.createdAt,
          updatedAt: collectionsTable.updatedAt,
          creatorId: collectionsTable.creatorId,
          snippetsCount: Database.client.$count(
            snippetsTable,
            eq(collectionsTable.id, snippetsTable.collectionId)
          ),
        })
        .from(collectionsTable)
        .where(eq(collectionsTable.creatorId, userId))
        .orderBy(desc(collectionsTable.createdAt))
        .limit(5)
    );

    const foundUser = await Database.client
      .with(snippetTags, userSnippets, userCollections)
      .select({
        id: usersTable.id,
        name: usersTable.name,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        image: usersTable.image,
        email: usersTable.email,
        snippets: sql<string | null>`(
          SELECT json_agg(row_to_json(s))
          FROM user_snippets s
        )`.as("snippets"),
        collections: sql<string | null>`(
          SELECT json_agg(row_to_json(c))
          FROM user_collections c
        )`.as("collections"),
      })
      .from(usersTable)
      .leftJoin(userSnippets, eq(userSnippets.creatorId, usersTable.id))
      .leftJoin(userCollections, eq(userCollections.creatorId, usersTable.id))
      .where(eq(usersTable.id, userId));

    return foundUser;
  }

  async getUserActivityStats({ userId }: { userId: number }) {
    const stats = await Database.client
      .select({
        snippetsCount: Database.client.$count(
          snippetsTable,
          eq(snippetsTable.creatorId, usersTable.id)
        ),
        collectionsCount: Database.client.$count(
          collectionsTable,
          eq(collectionsTable.creatorId, usersTable.id)
        ),
        forkedSnippetsCount: Database.client.$count(
          snippetsTable,
          and(
            eq(snippetsTable.creatorId, usersTable.id),
            isNotNull(snippetsTable.forkedFrom)
          )
        ),
        forkedCollectionsCount: Database.client.$count(
          collectionsTable,
          and(
            eq(collectionsTable.creatorId, usersTable.id),
            isNotNull(collectionsTable.forkedFrom)
          )
        ),
        friendsCount: Database.client.$count(
          friendshipsTable,
          and(
            eq(friendshipsTable.status, "accepted"),
            or(
              eq(friendshipsTable.requesterId, usersTable.id),
              eq(friendshipsTable.addresseeId, usersTable.id)
            )
          )
        ),
        friendsInboxCount: Database.client.$count(
          friendshipsTable,
          and(
            eq(friendshipsTable.status, "pending"),
            eq(friendshipsTable.addresseeId, usersTable.id)
          )
        ),
        friendsOutboxCount: Database.client.$count(
          friendshipsTable,
          and(
            eq(friendshipsTable.status, "pending"),
            eq(friendshipsTable.requesterId, usersTable.id)
          )
        ),
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    return stats;
  }

  async getUserProfile(
    id: number,
    isCurrentUserOwner: boolean,
    loggedInUserId?: number
  ) {
    const user = await Database.client.query.usersTable.findFirst({
      where: (t, { eq, and }) =>
        and(
          eq(t.id, id),
          isCurrentUserOwner ? undefined : eq(t.isPrivate, false)
        ),
      columns: {
        password: false,
      },
      with: {
        friendshipsReceived: {
          where: (t, { and, eq }) =>
            loggedInUserId
              ? and(
                  eq(t.status, "accepted"),
                  eq(t.requesterId, loggedInUserId) // logged-in is requester
                )
              : undefined,
        },
        friendshipsRequested: {
          where: (t, { and, eq }) =>
            loggedInUserId
              ? and(
                  eq(t.status, "accepted"),
                  eq(t.addresseeId, loggedInUserId) // logged-in is addressee
                )
              : undefined,
        },
      },
    });

    return user;
  }
}
