import { App } from "./app";
import { AuthRoute } from "./modules/auth/auth.route";

const app = new App([new AuthRoute()]);

app.connectToDatabase().then(() => {
  app.listen();
});
