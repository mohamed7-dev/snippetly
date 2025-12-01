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
import * as schema from "./schema";
import { DatabaseLogger } from "../logger/utils";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) throw new Error("Missing DATABASE_URL Env Variable.");

type NeonDb = NeonHttpDatabase<typeof schema> & {
  $client?: NeonQueryFunction<false, false>;
};

type AnyDb = NeonDb | NodePgDatabase<typeof schema>;

function isNeonUrl(url: string): boolean {
  return url.includes("neon.tech") || url.startsWith("postgresql://neon");
}

export class Database {
  private static db: AnyDb;

  static get client() {
    return this.db;
  }

  static async getSchemas() {
    return await import("./schema");
  }

  static async connect() {
    const url = DATABASE_URL!;

    if (isNeonUrl(url)) {
      const sql = neon(url);
      const db = drizzleNeon({ client: sql, schema }) as NeonDb;
      db.$client = sql;
      this.db = db;
      DatabaseLogger.logConnection("connect");
      return;
    }

    const pool = new Pool({ connectionString: url });
    const db = drizzlePg(pool, { schema }) as AnyDb;
    this.db = db;
    DatabaseLogger.logConnection("connect");
  }
}
