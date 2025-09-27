import { App } from "../src/app.ts";
import { AuthRoute } from "../src/modules/auth/auth.route.ts";
import { CollectionRoute } from "../src/modules/collections/collection.route.ts";
import { HealthRoute } from "../src/modules/health/health.route.ts";
import { SnippetRoute } from "../src/modules/snippet/snippet.route.ts";
import { TagRoute } from "../src/modules/tag/tag.route.ts";
import { UserRoute } from "../src/modules/user/user.route.ts";

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
application.connectToDatabase().catch((err) => {
  console.error("[Vercel] Failed to connect to database during cold start:", err);
});

export default application.app;
