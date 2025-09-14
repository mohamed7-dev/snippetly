import { App } from "./app";
import { AuthRoute } from "./modules/auth/auth.route";
import { CollectionRoute } from "./modules/collections/collection.route";
import { SnippetRoute } from "./modules/snippet/snippet.route";
import { TagRoute } from "./modules/tag/tag.route";
import { UserRoute } from "./modules/user/user.route";

const app = new App([
  new AuthRoute(),
  new CollectionRoute(),
  new SnippetRoute(),
  new UserRoute(),
  new TagRoute(),
]);

app.connectToDatabase().then(() => {
  app.listen();
});
