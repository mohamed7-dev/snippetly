import { eq } from "drizzle-orm";
import { Database } from "../../common/db/index.js";
import { friendshipsTable } from "../../common/db/schema.js";
export class FriendshipRepository {
    async insertFriendship(input) {
        return await Database.client.insert(friendshipsTable).values(input).returning();
    }
    async updateFriendship(id, input) {
        return await Database.client.update(friendshipsTable).set({
            ...input,
            updatedAt: new Date()
        }).where(eq(friendshipsTable.id, id)).returning();
    }
    async deleteFriendship(id) {
        return await Database.client.delete(friendshipsTable).where(eq(friendshipsTable.id, id));
    }
}
