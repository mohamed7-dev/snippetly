import "dotenv/config";
import express, { Application, Request } from "express";
import { NODE_ENV, PORT } from "./config";
import cors from "cors";
import { morganMiddleware } from "./common/middlewares/morgan.middleware";
import ErrorMiddleWare from "./common/middlewares/error.middleware";
import expressListRoutes from "express-list-routes";
import { Route } from "./common/types/express";
import { DefaultLogger } from "./common/logger/default-logger";
import { Logger, ServerLogger } from "./common/logger";
import { requestContextMiddleware } from "./common/middlewares/request-context-middleware";
import cookieParser from "cookie-parser";
import { corsOptions } from "./common/lib/cors";
import { provideCredentialsMiddleware } from "./common/middlewares/provide-credentials.middleware";
import { Database } from "./common/db";
import { multerErrorMiddleware } from "./common/middlewares/multer-error-middleware";
import path from "path";

export class App {
  public app: Application;
  public port: string | number;

  constructor(routes: Route[]) {
    this.app = express();
    this.port = PORT;
    Logger.useLogger(new DefaultLogger());
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
    this.listRoutes();
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      ServerLogger.logStartup(Number(this.port), NODE_ENV);
    });
  }

  private initializeMiddlewares(): void {
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.use("/uploads", express.static(path.join(__dirname, "uploads")));
    // must run before CORS, to set allow origin header
    this.app.use(provideCredentialsMiddleware);
    this.app.use(cors<Request>(corsOptions));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(morganMiddleware);
    this.app.use(requestContextMiddleware);
  }

  private initializeRoutes(routes: Route[]): void {
    routes.forEach((route) => {
      this.app.use("/api/v1", route.router);
    });
  }

  private initializeErrorHandling() {
    this.app.use(multerErrorMiddleware);
    this.app.use(ErrorMiddleWare.handleErrors);
  }

  public async connectToDatabase() {
    await Database.connect();
  }

  private listRoutes() {
    expressListRoutes(this.app, {
      logger: (method, space, path) =>
        ServerLogger.logRouteRegistration(method.trim(), path, "RouteHandler"),
    });
  }
}
