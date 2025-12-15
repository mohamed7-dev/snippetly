import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import {
  drizzle as drizzleNeon,
  NeonHttpDatabase,
} from "drizzle-orm/neon-http";
import {
  drizzle as drizzlePg,
  type NodePgDatabase,
} from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { DatabaseLogger } from "../logger/utils";
import * as schema from "./schema";

type NeonDb = NeonHttpDatabase<typeof schema> & {
  $client?: NeonQueryFunction<false, false>;
};

type AnyDb = NeonDb | NodePgDatabase<typeof schema>;

function isNeonUrl(url: string): boolean {
  return url.includes("neon.tech") || url.startsWith("postgresql://neon");
}

export class Database {
  private static db: AnyDb | null = null;

  static get client() {
    if (!this.db) {
      throw new Error(
        "Database not initialized. Call Database.connect() first."
      );
    }
    return this.db;
  }

  static async getSchemas() {
    return await import("./schema");
  }

  static async connect() {
    if (this.db) return this.db;
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("Missing DATABASE_URL Env Variable.");

    if (isNeonUrl(url)) {
      const sql = neon(url);
      const db = drizzleNeon({ client: sql, schema }) as NeonDb;
      db.$client = sql;
      this.db = db;
      DatabaseLogger.logConnection("connect");
      return;
    }
    const pool = new Pool({ connectionString: url });

    await pool.query("SELECT 1"); // test connection

    this.db = drizzlePg(pool, { schema }) as AnyDb;
    DatabaseLogger.logConnection("connect");
  }
}
