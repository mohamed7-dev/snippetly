import { serial, timestamp } from "drizzle-orm/pg-core";
export const baseTable = {
    id: serial("id").primaryKey().notNull(),
    createdAt: timestamp("created_at", {
        mode: "date"
    }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", {
        mode: "date"
    }).defaultNow().notNull()
};
