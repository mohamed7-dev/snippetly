/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { afterAll, beforeAll } from "vitest";
import { Database } from "../src/common/db";
import { Logger } from "../src/common/logger";
import { DummyLogger } from "../src/common/logger/dummy-logger";

let container: StartedPostgreSqlContainer;

beforeAll(async () => {
  // ⚡ Mock logger
  Logger.useLogger(new DummyLogger());
  container = await new PostgreSqlContainer("postgres:16-alpine")
    .withDatabase("testdb")
    .withUsername("testuser")
    .withPassword("testpass")
    .start();
  // ⚡ Set DATABASE_URL for your Database class
  process.env.DATABASE_URL = container.getConnectionUri();
  // ⚡ Connect your Database class
  await Database.connect();

  // Run migrations against test DB
  await migrate(Database.client as any, {
    migrationsFolder: "./src/common/db/migrations",
  });
});

afterAll(async () => {
  // Close database connections properly
  try {
    const client = Database.client as any;
    if (client?.$pool) await client.$pool.end();
  } catch (e) {
    console.warn("Error closing PG pool:", e);
  }

  // Tiny delay to make sure all is closed
  await new Promise((resolve) => setTimeout(resolve, 50));
});
