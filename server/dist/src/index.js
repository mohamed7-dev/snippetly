import { App } from "./app.js";
import { AuthRoute } from "./modules/auth/auth.route.js";
import { CollectionRoute } from "./modules/collections/collection.route.js";
import { HealthRoute } from "./modules/health/health.route.js";
import { SnippetRoute } from "./modules/snippet/snippet.route.js";
import { TagRoute } from "./modules/tag/tag.route.js";
import { UserRoute } from "./modules/user/user.route.js";
const app = new App([
    new AuthRoute(),
    new CollectionRoute(),
    new SnippetRoute(),
    new UserRoute(),
    new TagRoute(),
    new HealthRoute()
]);
app.connectToDatabase().then(()=>{
    app.listen();
});
