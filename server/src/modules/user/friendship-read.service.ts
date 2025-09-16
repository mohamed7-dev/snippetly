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
import { Database } from "../../common/db";
import {
  Friendship,
  friendshipsTable,
  snippetsTable,
  usersTable,
} from "../../common/db/schema";
import { GetCurrentUserFriendsDtoType } from "./dto/get-current-user-friends.dto";
import { alias } from "drizzle-orm/pg-core";

export class FriendshipReadService {
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
    query: searchString,
  }: GetCurrentUserFriendsDtoType &
    Required<Pick<GetCurrentUserFriendsDtoType, "limit">> & {
      userId: number;
    }) {
    // Alias friendships table
    const f = alias(friendshipsTable, "f");

    // Subquery: recent 3 snippets for each friend (as JSON array)
    const recentSnippets = sql<string[]>`(
        SELECT json_agg(row_to_json(sn))
        FROM (
          SELECT st.id, st.title, st.slug, st.code, st.language, st.created_at, st.updated_at
          FROM ${snippetsTable} st
          WHERE st.creator_id = ${usersTable.id}
          ORDER BY st.created_at DESC
          LIMIT 3
        ) sn
    )`;

    // Snippets count
    const snippetsCount = sql<number>`(
        SELECT COUNT(*)
        FROM ${snippetsTable} s
        WHERE s.creator_id = ${usersTable.id}
    )`;

    // Query for friends
    const query = Database.client
      .select({
        id: usersTable.id,
        name: usersTable.name,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        image: usersTable.image,
        bio: usersTable.bio,
        requestSentAt: f.createdAt, // <-- from friendships table
        recentSnippets,
        snippetsCount,
      })
      .from(usersTable)
      .innerJoin(
        f,
        and(
          eq(f.status, "accepted"),
          or(
            and(eq(f.requesterId, userId), eq(usersTable.id, f.addresseeId)),
            and(eq(f.addresseeId, userId), eq(usersTable.id, f.requesterId))
          )
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

    // Total count (friends matching filters)
    const totalQuery = Database.client
      .select({ count: count() })
      .from(usersTable)
      .innerJoin(
        f,
        and(
          eq(f.status, "accepted"),
          or(
            and(eq(f.requesterId, userId), eq(usersTable.id, f.addresseeId)),
            and(eq(f.addresseeId, userId), eq(usersTable.id, f.requesterId))
          )
        )
      )
      .where(
        and(
          searchString
            ? or(
                like(usersTable.name, `%${searchString}%`),
                like(usersTable.email, `%${searchString}%`)
              )
            : undefined
        )
      );

    const [data, total] = await Promise.all([query, totalQuery]);

    return { data, total: total[0]?.count ?? 0 };
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
