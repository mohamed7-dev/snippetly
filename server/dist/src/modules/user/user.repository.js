import { eq } from "drizzle-orm";
import { Database } from "../../common/db/index.js";
import { usersTable } from "../../common/db/schema.js";
export class UserRepository {
    async insert(input) {
        return await Database.client.insert(usersTable).values(input).returning();
    }
    async update(id, input) {
        return await Database.client.update(usersTable).set({
            ...input,
            updatedAt: new Date()
        }).where(eq(usersTable.id, id)).returning();
    }
    async delete(id) {
        return await Database.client.delete(usersTable).where(eq(usersTable.id, id));
    }
}
