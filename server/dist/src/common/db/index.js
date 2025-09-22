import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.js";
import { DatabaseLogger } from "../logger/utils.js";
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("Missing DATABASE_URL Env Variable.");
export class Database {
  static db;
  static get client() {
    return this.db;
  }
  static async getSchemas() {
    return await import("./schema");
  }
  static async connect() {
    const sql = neon(DATABASE_URL);
    const db = drizzle({
      client: sql,
      schema,
    });
    this.db = db;
    DatabaseLogger.logConnection("connect");
  }
}
