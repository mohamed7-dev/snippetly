import { App } from "./app.ts";
import { AuthRoute } from "./modules/auth/auth.route.ts";
import { CollectionRoute } from "./modules/collections/collection.route.ts";
import { HealthRoute } from "./modules/health/health.route.ts";
import { SnippetRoute } from "./modules/snippet/snippet.route.ts";
import { TagRoute } from "./modules/tag/tag.route.ts";
import { UserRoute } from "./modules/user/user.route.ts";

const app = new App([
  new AuthRoute(),
  new CollectionRoute(),
  new SnippetRoute(),
  new UserRoute(),
  new TagRoute(),
  new HealthRoute(),
]);

app.connectToDatabase().then(() => {
  app.listen();
});
