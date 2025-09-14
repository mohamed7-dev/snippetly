import { and, eq } from "drizzle-orm";
import { Database } from "../../common/db";
import {
  friendshipsTable,
  NewFriendship,
  NewUser,
  User,
  usersTable,
} from "../../common/db/schema";

export class UserRepository {
  public async insert(input: NewUser[]) {
    return await Database.client.insert(usersTable).values(input).returning();
  }

  public async update(id: number, input: Partial<User>) {
    return await Database.client
      .update(usersTable)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(usersTable.id, id))
      .returning();
  }

  public async delete(id: number) {
    return await Database.client
      .delete(usersTable)
      .where(eq(usersTable.id, id));
  }

  public async insertFriendship(input: NewFriendship[]) {
    return await Database.client
      .insert(friendshipsTable)
      .values(input)
      .returning();
  }

  public async updateFriendship(
    id: number,
    input: Pick<NewFriendship, "status">
  ) {
    return await Database.client
      .update(friendshipsTable)
      .set({ status: input.status })
      .where(eq(friendshipsTable.id, id))
      .returning();
  }
  public async deleteFriendship(id: number) {
    return await Database.client
      .delete(friendshipsTable)
      .where(eq(friendshipsTable.id, id));
  }
}
