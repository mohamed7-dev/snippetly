import "dotenv/config";
import express, { Application, Request } from "express";
import { NODE_ENV, PORT } from "./config";
import cors from "cors";
import { morganMiddleware } from "./common/middlewares/morgan.middleware";
import ErrorMiddleWare from "./common/middlewares/error.middleware";
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
import { notFoundErrorMiddleware } from "./common/middlewares/not-found-error-middleware";
import { Server } from "http";

export class App {
  public app: Application;
  private server: null | Server;
  public port: string | number;

  constructor(routes: Route[]) {
    this.app = express();
    this.port = PORT;
    this.server = null;
    Logger.useLogger(new DefaultLogger());
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
    this.listRoutes();
  }

  public listen(): void {
    this.server = this.app.listen(this.port, () => {
      ServerLogger.logStartup(Number(this.port), NODE_ENV);
    });
    this.handleShutdown();
  }

  private initializeMiddlewares(): void {
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.use(
      "/uploads",
      express.static(path.join(__dirname, "..", "public", "uploads"))
    );
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
    this.app.use((req, res, next) =>
      notFoundErrorMiddleware(req, res, next, this.app)
    );
    this.app.use(multerErrorMiddleware);
    this.app.use(ErrorMiddleWare.handleErrors);
  }

  public async connectToDatabase() {
    await Database.connect();
  }

  private listRoutes(): void {
    const routes: { method: string; path: string }[] = [];

    const processStack = (stack: any, prefix = "") => {
      stack.forEach((layer: any) => {
        if (layer.route) {
          // Route registered directly
          const path = prefix + layer.route.path;
          const methods = Object.keys(layer.route.methods).map((m) =>
            m.toUpperCase()
          );
          methods.forEach((method) => routes.push({ method, path }));
        } else if (layer.name === "router" && layer.handle.stack) {
          // Nested router
          const newPrefix =
            prefix +
            (layer.regexp?.source
              .replace("^\\", "")
              .replace("\\/?(?=\\/|$)", "")
              .replace(/\\\//g, "/") || "");
          processStack(layer.handle.stack, newPrefix);
        }
      });
    };
    processStack(this.app.router.stack);

    // Log them
    routes.forEach((r) => {
      ServerLogger.logRouteRegistration(
        r.method.padEnd(6),
        r.path,
        "RouteHandler"
      );
    });
  }

  private handleShutdown() {
    const shutdown = (signal: "SIGINT" | "SIGTERM") => {
      ServerLogger.logShutdown(
        `Received ${signal}, shutting down gracefully...`
      );

      if (this.server) {
        this.server.close(() => {
          ServerLogger.logShutdown("Closed out remaining connections");
          process.exit(0);
        });

        // Force shutdown after 10s
        setTimeout(() => {
          ServerLogger.logShutdown("Forcing shutdown...");
          process.exit(1);
        }, 10_000).unref();
      }
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  }
}
