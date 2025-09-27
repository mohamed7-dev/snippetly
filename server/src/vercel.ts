import App from "./app";
import { AuthRoute } from "./modules/auth/auth.route";
import { CollectionRoute } from "./modules/collections/collection.route";
import { HealthRoute } from "./modules/health/health.route";
import { SnippetRoute } from "./modules/snippet/snippet.route";
import { TagRoute } from "./modules/tag/tag.route";
import { UserRoute } from "./modules/user/user.route";

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
  console.error(
    "[Vercel] Failed to connect to database during cold start:",
    err
  );
});

export default application.app;
