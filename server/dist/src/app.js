import "dotenv/config";
import express from "express";
import { PORT } from "./config/index.js";
import cors from "cors";
import { morganMiddleware } from "./common/middlewares/morgan.middleware.js";
import ErrorMiddleWare from "./common/middlewares/error.middleware.js";
import { DefaultLogger } from "./common/logger/default-logger.js";
import { Logger } from "./common/logger/index.js";
import { ServerLogger } from "./common/logger/index.js";
import { requestContextMiddleware } from "./common/middlewares/request-context-middleware.js";
import cookieParser from "cookie-parser";
import { corsOptions } from "./common/lib/cors.js";
import { provideCredentialsMiddleware } from "./common/middlewares/provide-credentials.middleware.js";
import { Database } from "./common/db/index.js";
import { multerErrorMiddleware } from "./common/middlewares/multer-error-middleware.js";
import path from "path";
import { notFoundErrorMiddleware } from "./common/middlewares/not-found-error-middleware.js";
import { StatusCodes } from "http-status-codes";
import { __dirname } from "./common/lib/utils.js";
import { createRouteHandler } from "uploadthing/express";
import { uploadRouter } from "./modules/upload/upload.service.js";
export class App {
  app;
  server;
  port;
  constructor(routes) {
    this.app = express();
    this.port = PORT;
    this.server = null;
    Logger.useLogger(new DefaultLogger());
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
    this.listRoutes();
  }
  listen() {
    this.server = this.app.listen(this.port, () => {
      ServerLogger.logStartup(Number(this.port), process.env.NODE_ENV);
    });
    this.handleShutdown();
  }
  initializeMiddlewares() {
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.use(
      "/uploads",
      express.static(path.join(__dirname, "..", "public", "uploads"))
    );
    // must run before CORS, to set allow origin header
    this.app.use(provideCredentialsMiddleware);
    this.app.use(cors(corsOptions));
    this.app.use(
      express.urlencoded({
        extended: true,
      })
    );
    this.app.use(morganMiddleware);
    this.app.use(requestContextMiddleware);
  }
  initializeRoutes(routes) {
    this.app.get("/", (_req, res) =>
      res.status(StatusCodes.OK).json({
        message:
          "API is running, we are happy that you are exploring our application.",
      })
    );
    this.app.use(
      "/api/v1/upload",
      createRouteHandler({
        router: uploadRouter,
      })
    );
    routes.forEach((route) => {
      this.app.use("/api/v1", route.router);
    });
  }
  initializeErrorHandling() {
    this.app.use((req, res, next) =>
      notFoundErrorMiddleware(req, res, next, this.app)
    );
    this.app.use(multerErrorMiddleware);
    this.app.use(ErrorMiddleWare.handleErrors);
  }
  async connectToDatabase() {
    await Database.connect();
  }
  listRoutes() {
    const routes = [];
    const processStack = (stack, prefix = "") => {
      stack.forEach((layer) => {
        if (layer.route) {
          // Route registered directly
          const path = prefix + layer.route.path;
          const methods = Object.keys(layer.route.methods).map((m) =>
            m.toUpperCase()
          );
          methods.forEach((method) =>
            routes.push({
              method,
              path,
            })
          );
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
  handleShutdown() {
    const shutdown = (signal) => {
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
