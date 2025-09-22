import { LogContextEnum } from "./constants.ts";
import { Logger } from "./logger.ts";
import { type LogMeta } from "./type.ts";

export interface ServerLogMeta extends LogMeta {
  endpoint?: string;
  method?: string;
  statusCode?: number;
  userAgent?: string;
  ip?: string;
}

/**
 * Server Logger
 */
export class ServerLogger {
  static contextLogger() {
    return {
      error: (message: string, trace?: string, meta?: object) =>
        Logger.error(message, LogContextEnum.SERVER, trace, meta),
      warn: (message: string, meta?: object) =>
        Logger.warn(message, LogContextEnum.SERVER, meta),
      info: (message: string, meta?: object) =>
        Logger.info(message, LogContextEnum.SERVER, meta),
      http: (message: string, meta?: any) =>
        Logger.info(message, LogContextEnum.SERVER, meta),
      debug: (message: string, meta?: object) =>
        Logger.debug(message, LogContextEnum.SERVER, meta),
    };
  }

  /**
   * Log server startup events
   */
  static logStartup(port: number, environment: string) {
    Logger.info(
      `🚀 Server started on port ${port} in ${environment} mode`,
      LogContextEnum.SERVER,
      {
        endpoint: `http://localhost:${port}`,
        statusCode: 200,
      }
    );
  }

  /**
   * Log server shutdown events
   */
  static logShutdown(reason?: string) {
    Logger.info(`🛑 Server shutting down${reason ? `: ${reason}` : ""}`);
  }

  /**
   * Log middleware execution
   */
  static logMiddleware(
    middlewareName: string,
    endpoint: string,
    method: string,
    duration?: number,
    meta?: Partial<ServerLogMeta>
  ) {
    const logData: ServerLogMeta = {
      endpoint,
      method,
      ...meta,
    };

    Logger.debug(
      `Middleware ${middlewareName} executed for ${method} ${endpoint}${
        duration ? ` in ${duration}ms` : ""
      }`,
      LogContextEnum.SERVER,
      logData
    );
  }

  /**
   * Log authentication events
   */
  static logAuth(
    event: "login" | "logout" | "failed_login" | "token_refresh",
    userId?: string,
    ip?: string,
    userAgent?: string
  ) {
    const logData: ServerLogMeta = {
      ip,
      userAgent,
    };

    switch (event) {
      case "login":
        Logger.info(
          `User login successful${userId ? ` (${userId})` : ""}`,
          LogContextEnum.SERVER,
          logData
        );
        break;
      case "logout":
        Logger.info(
          `User logout${userId ? ` (${userId})` : ""}`,
          LogContextEnum.SERVER,
          logData
        );
        break;
      case "failed_login":
        Logger.warn(
          `Failed login attempt${userId ? ` for ${userId}` : ""}`,
          LogContextEnum.SERVER,
          logData
        );
        break;
      case "token_refresh":
        Logger.debug(
          `Token refresh${userId ? ` for ${userId}` : ""}`,
          LogContextEnum.SERVER,
          logData
        );
        break;
    }
  }

  /**
   * Log security events
   */
  static logSecurity(
    event: "rate_limit" | "suspicious_activity" | "blocked_request",
    details: string,
    ip?: string,
    meta?: Partial<ServerLogMeta>
  ) {
    const logData: ServerLogMeta = {
      ip,
      ...meta,
    };

    Logger.warn(
      `Security event - ${event}: ${details}`,
      LogContextEnum.SERVER,
      logData
    );
  }

  /**
   * Log route registration
   */
  static logRouteRegistration(method: string, path: string, handler: string) {
    Logger.info(
      `Route registered: ${method.toUpperCase()} ${path} -> ${handler}`
    );
  }
}

export interface DatabaseLogMeta extends LogMeta {
  query?: string;
  queryTime?: number;
  table?: string;
  operation?: "SELECT" | "INSERT" | "UPDATE" | "DELETE" | "CREATE" | "DROP";
  affectedRows?: number;
}

/**
 * Database logging utilities
 */
export class DatabaseLogger {
  static contextLogger() {
    return {
      error: (message: string, trace?: string, meta?: object) =>
        Logger.error(message, LogContextEnum.DATABASE, trace, meta),
      warn: (message: string, meta?: object) =>
        Logger.warn(message, LogContextEnum.DATABASE, meta),
      info: (message: string, meta?: object) =>
        Logger.info(message, LogContextEnum.DATABASE, meta),
      http: (message: string, meta?: object) =>
        Logger.info(message, LogContextEnum.DATABASE, meta),
      debug: (message: string, meta?: object) =>
        Logger.debug(message, LogContextEnum.DATABASE, meta),
    };
  }

  /**
   * Log successful database operations
   */
  static logOperation(
    operation: DatabaseLogMeta["operation"],
    collection: string,
    details?: string,
    meta?: Partial<DatabaseLogMeta>
  ) {
    const logData: DatabaseLogMeta = {
      operation,
      collection,
      ...meta,
    };

    Logger.info(
      `${operation} operation on ${collection}${details ? `: ${details}` : ""}`,
      LogContextEnum.DATABASE,
      logData
    );
  }

  /**
   * Log database connection events
   */
  static logConnection(
    event: "connect" | "disconnect" | "error",
    details?: object,
    trace?: string
  ) {
    switch (event) {
      case "connect":
        Logger.info(
          `Database connected successfully.`,
          LogContextEnum.DATABASE,
          details
        );
        break;
      case "disconnect":
        Logger.info(`Database disconnected.`, LogContextEnum.DATABASE, details);
        break;
      case "error":
        Logger.error(
          `Database connection error.`,
          LogContextEnum.DATABASE,
          trace,
          details
        );
        break;
    }
  }

  /**
   * Log transaction events
   */
  static logTransaction(
    event: "start" | "commit" | "rollback",
    transactionId?: string,
    reason?: string
  ) {
    const message = `Transaction ${event}${
      transactionId ? ` (${transactionId})` : ""
    }${reason ? `: ${reason}` : ""}`;

    if (event === "rollback") {
      Logger.warn(message, LogContextEnum.DATABASE);
    } else {
      Logger.info(message, LogContextEnum.DATABASE);
    }
  }

  /**
   * Log migration events
   */
  static logMigration(
    event: "start" | "complete" | "error",
    migrationName: string,
    details?: string
  ) {
    const message = `Migration ${migrationName} ${event}${
      details ? `: ${details}` : ""
    }`;

    if (event === "error") {
      Logger.error(message, LogContextEnum.DATABASE);
    } else {
      Logger.info(message, LogContextEnum.DATABASE);
    }
  }
}

/**
 * Error logging utilities
 */
export class ErrorLogger {
  /**
   * Log unhandled errors with context
   */
  static logUnhandledError(error: Error, context: LogContextEnum, meta?: any) {
    const errorData = {
      stack: error.stack,
      name: error.name,
    };

    if (context === LogContextEnum.DATABASE) {
      DatabaseLogger.contextLogger().error(
        `Unhandled error in ${context}: ${error.message}`,
        JSON.stringify(errorData),
        errorData
      );
    } else if (context === LogContextEnum.SERVER) {
      ServerLogger.contextLogger().error(
        `Unhandled error in ${context}: ${error.message}`,
        JSON.stringify(errorData),
        meta
      );
    } else {
      // performanceLogger.error(
      //   `Unhandled error in ${context}: ${error.message}`,
      //   errorData
      // );
    }
  }

  /**
   * Log validation errors
   */
  static logValidationError(
    field: string,
    value: any,
    rule: string,
    endpoint?: string,
    meta?: Partial<ServerLogMeta>
  ) {
    const logData: ServerLogMeta = {
      endpoint,
      ...meta,
    };

    ServerLogger.contextLogger().warn(
      `Validation error: ${field} failed ${rule} validation (value: ${JSON.stringify(
        value
      )})`,
      logData
    );
  }
}
