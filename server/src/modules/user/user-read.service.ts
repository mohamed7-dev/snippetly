import {
  and,
  arrayContains,
  desc,
  eq,
  getTableColumns,
  inArray,
  isNotNull,
  like,
  lt,
  or,
  sql,
} from "drizzle-orm";
import { Database } from "../../common/db";
import {
  collectionsTable,
  Friendship,
  friendshipsTable,
  snippetsTable,
  snippetsTagsTable,
  tagsTable,
  usersTable,
} from "../../common/db/schema";
import { DiscoverUsersDtoType } from "./dto/discover-users.dto";
import { GetCurrentUserFriendsDtoType } from "./dto/get-current-user-friends.dto";
import { HttpException } from "../../common/lib/exception";
import { StatusCodes } from "http-status-codes";

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
    const recentTags = Database.client.$with("recent_tags").as(
      Database.client
        .select({
          name: tagsTable.name,
          addedBy: tagsTable.addedBy,
        })
        .from(tagsTable)
        .limit(5)
        .orderBy(desc(tagsTable.createdAt))
    );

    const snippetsCount = Database.client.$count(
      snippetsTable,
      eq(snippetsTable.creatorId, usersTable.id)
    );

    // Build base selection
    let query = Database.client
      .with(recentTags)
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
        // snippetsCount,
        recentTags: sql<string>`(
          SELECT json_agg(row_to_json(s))
          FROM recent_tags s
        )`.as("recentTags"),
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
      // .leftJoin(recentTags, eq(recentTags.addedBy, usersTable.id))
      // Sort DESC by snippetsCount, then tie-break by id
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

  async getUserFriends({
    userId,
    limit,
    cursor,
    query: searchString,
  }: GetCurrentUserFriendsDtoType &
    Required<Pick<GetCurrentUserFriendsDtoType, "limit">> & {
      userId: number;
    }) {
    // Subquery: Get friend IDs for current user
    const friendsSubquery = sql`
    SELECT CASE
      WHEN f.requester_id = ${userId} THEN f.addressee_id
      ELSE f.requester_id
    END as friend_id
    FROM ${friendshipsTable} f
    WHERE f.status = 'accepted'
      AND (f.requester_id = ${userId} OR f.addressee_id = ${userId})
  `;

    // Subquery: recent 3 snippets for each friend (as JSON array)
    const recentSnippets = sql<string[]>`(
    SELECT json_agg(row_to_json(sn))
    FROM (
      SELECT s.id, s.title, s.slug, s.code, s.language, s.created_at
      FROM ${snippetsTable} s
      WHERE s.creator_id = ${usersTable.id}
      ORDER BY s.created_at DESC
      LIMIT 3
    ) sn
  )`;

    // Snippets count
    const snippetsCount = sql<number>`(
      SELECT COUNT(*)
      FROM ${snippetsTable} s
      WHERE s.creator_id = ${usersTable.id}
    )`;

    let query = Database.client
      .select({
        id: usersTable.id,
        name: usersTable.name,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        image: usersTable.image,
        bio: usersTable.bio,
        recentSnippets,
        snippetsCount,
      })
      .from(usersTable)
      .where(
        and(
          inArray(usersTable.id, sql`(${friendsSubquery})`),
          cursor ? lt(usersTable.id, cursor.id) : undefined,
          searchString
            ? or(
                like(usersTable.name, `%${searchString}%`),
                like(usersTable.email, `%${searchString}%`)
              )
            : undefined
        )
      )
      .limit(limit + 1)
      .orderBy(desc(usersTable.id));

    const [data, total] = await Promise.all([
      query,
      Database.client.$count(
        usersTable,
        and(
          inArray(usersTable.id, sql`(${friendsSubquery})`),
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

  async getUserInbox({
    userId,
    limit,
    cursor,
    query: searchString,
  }: GetCurrentUserFriendsDtoType &
    Required<Pick<GetCurrentUserFriendsDtoType, "limit">> & {
      userId: number;
    }) {
    // Get friends in the inbox of the userId where the userId is an addressee
    const friendsInbox = Database.client.$with("friends_inbox").as(
      Database.client
        .select({
          createdAt: friendshipsTable.createdAt,
          requesterId: friendshipsTable.requesterId,
        })
        .from(friendshipsTable)
        .where(
          and(
            eq(friendshipsTable.status, "accepted"),
            eq(friendshipsTable.addresseeId, userId)
          )
        )
    );

    let query = Database.client
      .with(friendsInbox)
      .select({
        id: usersTable.id,
        name: usersTable.name,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        image: usersTable.image,
        bio: usersTable.bio,
        requestSentAt: friendsInbox.createdAt,
        snippetsCount: Database.client.$count(
          snippetsTable,
          eq(snippetsTable.creatorId, usersTable.id)
        ),
      })
      .from(usersTable)
      .leftJoin(friendsInbox, eq(friendsInbox.requesterId, usersTable.id))
      .where(
        and(
          inArray(usersTable.id, sql`(${friendsInbox.requesterId})`),
          cursor ? lt(usersTable.id, cursor.id) : undefined,
          searchString
            ? or(
                like(usersTable.name, `%${searchString}%`),
                like(usersTable.email, `%${searchString}%`)
              )
            : undefined
        )
      )
      .limit(limit + 1)
      .orderBy(desc(usersTable.id));

    // TODO: adapt count to the searchString
    const [data, total] = await Promise.all([
      query,
      Database.client.$count(
        friendshipsTable,
        eq(friendshipsTable.addresseeId, userId)
      ),
    ]);
    return { data, total };
  }

  async getUserOutbox({
    userId,
    limit,
    cursor,
    query: searchString,
  }: GetCurrentUserFriendsDtoType &
    Required<Pick<GetCurrentUserFriendsDtoType, "limit">> & {
      userId: number;
    }) {
    // Get friends in the inbox of the userId where the userId is an addressee
    const friendsOutbox = Database.client.$with("friends_inbox").as(
      Database.client
        .select({
          createdAt: friendshipsTable.createdAt,
          addresseeId: friendshipsTable.addresseeId,
        })
        .from(friendshipsTable)
        .where(
          and(
            eq(friendshipsTable.status, "accepted"),
            eq(friendshipsTable.requesterId, userId)
          )
        )
    );

    let query = Database.client
      .with(friendsOutbox)
      .select({
        id: usersTable.id,
        name: usersTable.name,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        image: usersTable.image,
        bio: usersTable.bio,
        snippetsCount: Database.client.$count(
          snippetsTable,
          eq(snippetsTable.creatorId, usersTable.id)
        ),
      })
      .from(usersTable)
      .where(
        and(
          inArray(usersTable.id, sql`(${friendsOutbox.addresseeId})`),
          cursor ? lt(usersTable.id, cursor.id) : undefined,
          searchString
            ? or(
                like(usersTable.name, `%${searchString}%`),
                like(usersTable.email, `%${searchString}%`)
              )
            : undefined
        )
      )
      .limit(limit + 1)
      .orderBy(desc(usersTable.id));

    // TODO: adapt count to the searchString
    const [data, total] = await Promise.all([
      query,
      Database.client.$count(
        friendshipsTable,
        eq(friendshipsTable.requesterId, userId)
      ),
    ]);
    return { data, total };
  }

  // Done
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

  // Done
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

  async getFriendshipRequestInfo({
    addresseeId,
    requesterId,
  }: Pick<Friendship, "addresseeId" | "requesterId">) {
    const [foundRequest] = await Database.client
      .select({
        ...getTableColumns(friendshipsTable),
      })
      .from(friendshipsTable)
      .where(
        and(
          eq(friendshipsTable.requesterId, requesterId),
          eq(friendshipsTable.addresseeId, addresseeId)
        )
      );

    return foundRequest;
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
                  eq(t.requesterId, loggedInUserId),
                  eq(t.addresseeId, id)
                )
              : undefined,
        },
        friendshipsRequested: {
          where: (t, { and, eq }) =>
            loggedInUserId
              ? and(
                  eq(t.status, "accepted"),
                  eq(t.addresseeId, loggedInUserId),
                  eq(t.requesterId, id)
                )
              : undefined,
        },
      },
    });

    return user;
  }
}
