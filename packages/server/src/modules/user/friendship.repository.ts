import { eq } from "drizzle-orm";
import { Database } from "../../common/db/index";
import { friendshipsTable, type NewFriendship } from "../../common/db/schema";

export class FriendshipRepository {
  public async insertFriendship(input: NewFriendship[]) {
    return await Database.client
      .insert(friendshipsTable)
      .values(input)
      .returning();
  }

  public async updateFriendship(id: number, input: Partial<NewFriendship>) {
    return await Database.client
      .update(friendshipsTable)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(friendshipsTable.id, id))
      .returning();
  }
  public async deleteFriendship(id: number) {
    return await Database.client
      .delete(friendshipsTable)
      .where(eq(friendshipsTable.id, id));
  }
}
