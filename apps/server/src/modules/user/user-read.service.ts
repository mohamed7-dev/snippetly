import { DiscoverUsersRequestQueryDtoType } from "@snippetly/common/dto";
import {
  and,
  arrayContains,
  desc,
  eq,
  inArray,
  like,
  lt,
  not,
  or,
  sql,
} from "drizzle-orm";
import { Database } from "../../common/db/index";
import {
  collectionsTable,
  Friendship,
  friendshipsTable,
  snippetsTable,
  type Tags,
  tagsTable,
  User,
  usersTable,
} from "../../common/db/schema";
import { normalizeCounts } from "../../common/lib/utils";

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
    const foundUser = await Database.client.query.usersTable.findFirst({
      where: (t, { or, eq, like }) => {
        const conditions = [];

        if (by === "name") {
          conditions.push(
            exact ? eq(t.name, value as string) : like(t.name, value as string)
          );
        }

        if (by === "email") {
          conditions.push(eq(t.email, value as string));
        }

        if (by === "id") {
          conditions.push(eq(t.id, value as number));
        }
        // Drizzle requires OR with at least 1 condition
        return conditions.length === 1 ? conditions[0]! : or(...conditions);
      },
    });
    return foundUser;
  }

  /**
   * @description
   * without joining.
   */
  public async findOneByOldNames(name: string) {
    return await Database.client.query.usersTable.findFirst({
      where: (t) => arrayContains(t.oldNames, [name]),
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

  /**
   * @description
   * Discover Users
   */
  async discoverUsers({
    cursor,
    limit,
    query: searchString,
    loggedInUserId,
  }: DiscoverUsersRequestQueryDtoType &
    Required<Pick<DiscoverUsersRequestQueryDtoType, "limit">> & {
      loggedInUserId?: number;
    }) {
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
        image: usersTable.image,
        imageKey: usersTable.imageKey,
        createdAt: usersTable.createdAt,
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
            : undefined,
          loggedInUserId ? not(eq(usersTable.id, loggedInUserId)) : undefined
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
            : undefined,
          loggedInUserId ? not(eq(usersTable.id, loggedInUserId)) : undefined
        )
      ),
    ]);
    return { data, total };
  }

  /**
   * @description
   * Get User Info For Display In The Dashboard
   */
  async getUserForDashboard({ userId }: { userId: number }) {
    const foundUser = await Database.client.query.usersTable.findFirst({
      where: (t, { eq }) => eq(t.id, userId),
      columns: {
        password: false,
        refreshTokens: false,
        oldNames: false,
      },
      with: {
        collections: {
          limit: 5,
          orderBy: (t, { desc }) => desc(t.updatedAt),
          columns: {
            title: true,
            slug: true,
            color: true,
            createdAt: true,
            updatedAt: true,
            id: true,
          },
        },
      },
    });

    if (!foundUser) {
      return null;
    }

    const collectionIds = foundUser.collections.map((c) => c.id);

    if (collectionIds.length === 0) {
      return { ...foundUser, collections: [] };
    }

    const snippetsCounts = await Database.client
      .select({
        collectionId: snippetsTable.collectionId,
        count: sql<number>`count(*)`,
      })
      .from(snippetsTable)
      .where(inArray(snippetsTable.collectionId, collectionIds))
      .groupBy(snippetsTable.collectionId);

    const countsMap = Object.fromEntries(
      snippetsCounts.map((c) => [c.collectionId, Number(c.count)])
    );

    const collections = foundUser.collections.map((col) => ({
      ...col,
      snippetsCount: countsMap[col.id] ?? 0,
    }));

    return { ...foundUser, collections };
  }

  /**
   * @description
   * Get User Activity Statistics
   */
  async getUserActivityStats({ userId }: { userId: number }) {
    const snippetQuery = Database.client
      .select({
        snippetsCount: sql<number>`
      count(*) filter (where ${snippetsTable.creatorId} = ${userId})
    `,
        forkedSnippetsCount: sql<number>`
      count(*) filter (
        where ${snippetsTable.creatorId} = ${userId}
          and ${snippetsTable.forkedFrom} is not null
      )
    `,
      })
      .from(snippetsTable);

    const collectionQuery = Database.client
      .select({
        collectionsCount: sql<number>`
      count(*) filter (where ${collectionsTable.creatorId} = ${userId})
    `,
        forkedCollectionsCount: sql<number>`
      count(*) filter (
        where ${collectionsTable.creatorId} = ${userId}
          and ${collectionsTable.forkedFrom} is not null
      )
    `,
      })
      .from(collectionsTable);

    const friendsQuery = Database.client
      .select({
        friendsCount: sql<number>`
      count(*) filter (
        where ${friendshipsTable.status} = 'accepted'
          and (
            ${friendshipsTable.requesterId} = ${userId}
            or ${friendshipsTable.addresseeId} = ${userId}
          )
      )
    `,
        friendsInboxCount: sql<number>`
      count(*) filter (
        where ${friendshipsTable.status} = 'pending'
          and ${friendshipsTable.addresseeId} = ${userId}
      )
    `,
        friendsOutboxCount: sql<number>`
      count(*) filter (
        where ${friendshipsTable.status} = 'pending'
          and ${friendshipsTable.requesterId} = ${userId}
      )
    `,
      })
      .from(friendshipsTable);

    const [[snippetStats], [collectionStats], [friendStats]] =
      await Promise.all([snippetQuery, collectionQuery, friendsQuery]);

    const normalizedSnippetStats = normalizeCounts(snippetStats, [
      "snippetsCount",
      "forkedSnippetsCount",
    ]);
    const normalizedCollectionStats = normalizeCounts(collectionStats, [
      "collectionsCount",
      "forkedCollectionsCount",
    ]);
    const normalizedFriendStats = normalizeCounts(friendStats, [
      "friendsCount",
      "friendsInboxCount",
      "friendsOutboxCount",
    ]);
    return {
      ...normalizedSnippetStats,
      ...normalizedCollectionStats,
      ...normalizedFriendStats,
    };
  }

  /**
   * @description
   * Get User Profile Along With Their Friendships If Logged-In
   */
  async getUserProfile(
    id: number,
    isCurrentUserOwner: boolean,
    loggedInUserId?: number
  ): Promise<
    | (Omit<User, "password"> & {
        friendshipsRequested?: Friendship[];
        friendshipsReceived?: Friendship[];
      })
    | undefined
  > {
    // If there is no logged-in user, don’t join friendships at all
    if (!loggedInUserId) {
      return await Database.client.query.usersTable.findFirst({
        where: (t, { eq, and }) =>
          and(
            eq(t.id, id),
            isCurrentUserOwner ? undefined : eq(t.isPrivate, false)
          ),
        columns: {
          password: false,
        },
      });
    }

    // Logged-in viewer: fetch friendship relations with targeted filters
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
          // logged-in is requester
          where: (t, { eq }) => eq(t.requesterId, loggedInUserId),
        },
        friendshipsRequested: {
          // logged-in is addressee
          where: (t, { eq }) => eq(t.addresseeId, loggedInUserId),
        },
      },
    });

    return user;
  }
}
