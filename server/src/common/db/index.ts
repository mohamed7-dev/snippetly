import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { DatabaseLogger } from "../logger/utils";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) throw new Error("Missing DATABASE_URL Env Variable.");

export class Database {
  private static db: NeonHttpDatabase<typeof schema> & {
    $client: NeonQueryFunction<false, false>;
  };

  static get client() {
    return this.db;
  }

  static async getSchemas() {
    return await import("./schema");
  }

  static async connect() {
    const sql = neon(DATABASE_URL!);
    const db = drizzle({ client: sql, schema });
    this.db = db;
    DatabaseLogger.logConnection("connect");
  }
}
