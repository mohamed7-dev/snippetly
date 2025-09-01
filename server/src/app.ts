import "dotenv/config";
import express, { Application, Request } from "express";
import { ServerLogger } from "./common/logger";
import { PORT } from "./config";
import cors from "cors";
import { morganMiddleware } from "./common/middlewares/morgan.middleware";
import ErrorMiddleWare from "./common/middlewares/error.middleware";
import expressListRoutes from "express-list-routes";
import { Route } from "./common/lib/types";
import { connectToDatabase } from "./common/lib/db";

export class App {
  public app: Application;
  public port: string | number;

  constructor(routes: Route[]) {
    this.app = express();
    this.port = PORT || 8000;
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
    this.listRoutes();
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      ServerLogger.logStartup(
        Number(this.port),
        process.env.NODE_ENV || "development"
      );
    });
  }

  private initializeMiddlewares(): void {
    this.app.use(express.json());
    this.app.use(cors<Request>());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(morganMiddleware);
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
