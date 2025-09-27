import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  like,
  lt,
  or,
  sql,
} from "drizzle-orm";
import { Database } from "../../common/db/index";
import {
  type Friendship,
  friendshipsTable,
  snippetsTable,
  usersTable,
} from "../../common/db/schema";
import { type GetCurrentUserFriendsDtoType } from "./dto/get-current-user-friends.dto";
import { alias } from "drizzle-orm/pg-core";

export class FriendshipReadService {
  /**
   * @description
   * Without join
   */
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

  async getUserFriends({
    userId,
    limit,
    cursor,
  }: GetCurrentUserFriendsDtoType &
    Required<Pick<GetCurrentUserFriendsDtoType, "limit">> & {
      userId: number;
    }) {
    const friendsQuery = await Database.client.query.friendshipsTable.findMany({
      where: (t, { and, eq, or }) =>
        and(
          eq(t.status, "accepted"),
          or(eq(t.requesterId, userId), eq(t.addresseeId, userId)),
          cursor ? lt(t.id, cursor.id) : undefined
        ),
      limit: limit + 1,
      orderBy: (t, { desc }) => desc(t.id),
      with: {
        requester: {
          extras: {
            snippetsCount: sql<string>`(
                select count(*)
                from ${snippetsTable} as s
                inner join friendships as f
                on f.requester_id = s.creator_id
              )`.as("snippets_count"),
          },
          columns: {
            name: true,
            firstName: true,
            lastName: true,
            id: true,
            image: true,
            bio: true,
          },
          with: {
            snippets: {
              limit: 3,
              orderBy: (t, { desc }) => desc(t.updatedAt),
              columns: {
                title: true,
                slug: true,
                language: true,
                id: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
        addressee: {
          extras: {
            snippetsCount: sql<string>`(
                select count(*)
                from ${snippetsTable} as s
                inner join friendships as f
                on f.addressee_id = s.creator_id
              )`.as("snippets_count"),
          },
          columns: {
            name: true,
            firstName: true,
            lastName: true,
            id: true,
            image: true,
            bio: true,
          },
          with: {
            snippets: {
              limit: 3,
              orderBy: (t, { desc }) => desc(t.updatedAt),
              columns: {
                title: true,
                slug: true,
                language: true,
                id: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    const totalQuery = Database.client.$count(
      friendshipsTable,
      and(
        eq(friendshipsTable.status, "accepted"),
        or(
          eq(friendshipsTable.requesterId, userId),
          eq(friendshipsTable.addresseeId, userId)
        )
      )
    );

    const [data, total] = await Promise.all([friendsQuery, totalQuery]);

    const friends = data.map((friendship) => {
      if (friendship.requesterId === userId) {
        const { snippets, ...rest } = friendship.addressee;
        return {
          ...rest,
          recentSnippets: snippets,
          requestSentAt: friendship.createdAt,
          requestStatus: friendship.status,
          requestAcceptedAt: friendship.acceptedAt,
        };
      }
      const { snippets, ...rest } = friendship.requester;
      return {
        ...rest,
        recentSnippets: snippets,
        requestSentAt: friendship.createdAt,
        requestStatus: friendship.status,
        requestAcceptedAt: friendship.acceptedAt,
      };
    });
    return { data: friends, total };
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
    const fi = alias(friendshipsTable, "fi");
    const friendsInboxCountQuery = Database.client
      .select({ count: count() })
      .from(usersTable)
      .innerJoin(
        fi,
        and(
          eq(usersTable.id, fi.requesterId),
          eq(fi.addresseeId, userId),
          eq(fi.status, "pending")
        )
      )
      .where(
        searchString
          ? or(
              like(usersTable.name, `%${searchString}%`),
              like(usersTable.email, `%${searchString}%`)
            )
          : undefined
      );
    let findFriendsInboxQuery = Database.client
      .select({
        id: usersTable.id,
        name: usersTable.name,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        image: usersTable.image,
        bio: usersTable.bio,
        requestSentAt: fi.createdAt,
        requestStatus: fi.status,
        snippetsCount: Database.client.$count(
          snippetsTable,
          eq(snippetsTable.creatorId, usersTable.id)
        ),
      })
      .from(usersTable)
      .innerJoin(
        fi,
        and(
          eq(usersTable.id, fi.requesterId),
          eq(fi.addresseeId, userId),
          eq(fi.status, "pending")
        )
      )
      .where(
        and(
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
      findFriendsInboxQuery,
      friendsInboxCountQuery,
    ]);
    return { data, total: total[0]?.count ?? 0 };
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
    const fi = alias(friendshipsTable, "fi");
    const friendsOutboxCountQuery = Database.client
      .select({ count: count() })
      .from(usersTable)
      .innerJoin(
        fi,
        and(
          eq(usersTable.id, fi.addresseeId),
          eq(fi.requesterId, userId),
          eq(fi.status, "pending")
        )
      )
      .where(
        searchString
          ? or(
              like(usersTable.name, `%${searchString}%`),
              like(usersTable.email, `%${searchString}%`)
            )
          : undefined
      );

    let findFriendsOutboxQuery = Database.client
      .select({
        id: usersTable.id,
        name: usersTable.name,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        image: usersTable.image,
        bio: usersTable.bio,
        requestSentAt: fi.createdAt,
        requestStatus: fi.status,
        snippetsCount: Database.client.$count(
          snippetsTable,
          eq(snippetsTable.creatorId, usersTable.id)
        ),
      })
      .from(usersTable)
      .innerJoin(
        fi,
        and(
          eq(usersTable.id, fi.addresseeId),
          eq(fi.requesterId, userId),
          eq(fi.status, "pending")
        )
      )
      .where(
        and(
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
      findFriendsOutboxQuery,
      friendsOutboxCountQuery,
    ]);
    return { data, total: total[0]?.count ?? 0 };
  }
}
