import { App } from "./app";
import { AuthRoute } from "./modules/auth/auth.route";
import { CollectionRoute } from "./modules/collection/collection.route";
import { SnippetRoute } from "./modules/snippet/snippet.route";
import { UserRoute } from "./modules/user/user.route";

const app = new App([
  new AuthRoute(),
  new CollectionRoute(),
  new SnippetRoute(),
  new UserRoute(),
]);

app.connectToDatabase().then(() => {
  app.listen();
});
