import { App } from "./app.ts";
import { AuthRoute } from "./modules/auth/auth.route.ts";
import { CollectionRoute } from "./modules/collections/collection.route.ts";
import { HealthRoute } from "./modules/health/health.route.ts";
import { SnippetRoute } from "./modules/snippet/snippet.route.ts";
import { TagRoute } from "./modules/tag/tag.route.ts";
import { UserRoute } from "./modules/user/user.route.ts";

// Create the app without calling listen().
const application = new App([
  new AuthRoute(),
  new CollectionRoute(),
  new SnippetRoute(),
  new UserRoute(),
  new TagRoute(),
  new HealthRoute(),
]);

// Initialize DB connection once per lambda cold start
// (Subsequent invocations in the same container reuse the connection)
application.connectToDatabase().catch((err) => {
  console.error("Failed to connect to database during cold start:", err);
});

// For Vercel's @vercel/node, exporting the Express app (a request listener)
// as the default export allows the platform to invoke it per request.
export default application.app;
