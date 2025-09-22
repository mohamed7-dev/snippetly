import { eq } from "drizzle-orm";
import { Database } from "../../common/db/index.ts";
import { type NewUser, type User, usersTable } from "../../common/db/schema.ts";

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
}
