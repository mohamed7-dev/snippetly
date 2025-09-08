import "dotenv/config";
import express, { Application, Request } from "express";
import { NODE_ENV, PORT } from "./config";
import cors from "cors";
import { morganMiddleware } from "./common/middlewares/morgan.middleware";
import ErrorMiddleWare from "./common/middlewares/error.middleware";
import expressListRoutes from "express-list-routes";
import { connectToDatabase } from "./common/lib/db";
import { Route } from "./common/types/express";
import { DefaultLogger } from "./common/logger-alternative/default-logger";
import { Logger, ServerLogger } from "./common/logger-alternative";
import { requestContextMiddleware } from "./common/middlewares/request-context-middleware";
import cookieParser from "cookie-parser";

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
    this.app.use(cors<Request>());
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
    this.app.use(ErrorMiddleWare.handleErrors);
  }

  public async connectToDatabase() {
    await connectToDatabase();
  }

  private listRoutes() {
    expressListRoutes(this.app, {
      logger: (method, space, path) =>
        ServerLogger.logRouteRegistration(method.trim(), path, "RouteHandler"),
    });
  }
}
