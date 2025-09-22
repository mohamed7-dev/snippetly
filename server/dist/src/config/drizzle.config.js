import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
config({
    path: ".env"
});
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("Missing DATABASE_URL ENV Variable and it must be a valid postgres connection string.");
export default defineConfig({
    out: "./src/common/db/migrations",
    schema: "./src/common/db/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: connectionString
    },
    verbose: true
});
