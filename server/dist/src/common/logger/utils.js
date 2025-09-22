import { LogContextEnum } from "./constants.js";
import { Logger } from "./logger.js";
/**
 * Server Logger
 */ export class ServerLogger {
    static contextLogger() {
        return {
            error: (message, trace, meta)=>Logger.error(message, LogContextEnum.SERVER, trace, meta),
            warn: (message, meta)=>Logger.warn(message, LogContextEnum.SERVER, meta),
            info: (message, meta)=>Logger.info(message, LogContextEnum.SERVER, meta),
            http: (message, meta)=>Logger.info(message, LogContextEnum.SERVER, meta),
            debug: (message, meta)=>Logger.debug(message, LogContextEnum.SERVER, meta)
        };
    }
    /**
   * Log server startup events
   */ static logStartup(port, environment) {
        Logger.info(`🚀 Server started on port ${port} in ${environment} mode`, LogContextEnum.SERVER, {
            endpoint: `http://localhost:${port}`,
            statusCode: 200
        });
    }
    /**
   * Log server shutdown events
   */ static logShutdown(reason) {
        Logger.info(`🛑 Server shutting down${reason ? `: ${reason}` : ""}`);
    }
    /**
   * Log middleware execution
   */ static logMiddleware(middlewareName, endpoint, method, duration, meta) {
        const logData = {
            endpoint,
            method,
            ...meta
        };
        Logger.debug(`Middleware ${middlewareName} executed for ${method} ${endpoint}${duration ? ` in ${duration}ms` : ""}`, LogContextEnum.SERVER, logData);
    }
    /**
   * Log authentication events
   */ static logAuth(event, userId, ip, userAgent) {
        const logData = {
            ip,
            userAgent
        };
        switch(event){
            case "login":
                Logger.info(`User login successful${userId ? ` (${userId})` : ""}`, LogContextEnum.SERVER, logData);
                break;
            case "logout":
                Logger.info(`User logout${userId ? ` (${userId})` : ""}`, LogContextEnum.SERVER, logData);
                break;
            case "failed_login":
                Logger.warn(`Failed login attempt${userId ? ` for ${userId}` : ""}`, LogContextEnum.SERVER, logData);
                break;
            case "token_refresh":
                Logger.debug(`Token refresh${userId ? ` for ${userId}` : ""}`, LogContextEnum.SERVER, logData);
                break;
        }
    }
    /**
   * Log security events
   */ static logSecurity(event, details, ip, meta) {
        const logData = {
            ip,
            ...meta
        };
        Logger.warn(`Security event - ${event}: ${details}`, LogContextEnum.SERVER, logData);
    }
    /**
   * Log route registration
   */ static logRouteRegistration(method, path, handler) {
        Logger.info(`Route registered: ${method.toUpperCase()} ${path} -> ${handler}`);
    }
}
/**
 * Database logging utilities
 */ export class DatabaseLogger {
    static contextLogger() {
        return {
            error: (message, trace, meta)=>Logger.error(message, LogContextEnum.DATABASE, trace, meta),
            warn: (message, meta)=>Logger.warn(message, LogContextEnum.DATABASE, meta),
            info: (message, meta)=>Logger.info(message, LogContextEnum.DATABASE, meta),
            http: (message, meta)=>Logger.info(message, LogContextEnum.DATABASE, meta),
            debug: (message, meta)=>Logger.debug(message, LogContextEnum.DATABASE, meta)
        };
    }
    /**
   * Log successful database operations
   */ static logOperation(operation, collection, details, meta) {
        const logData = {
            operation,
            collection,
            ...meta
        };
        Logger.info(`${operation} operation on ${collection}${details ? `: ${details}` : ""}`, LogContextEnum.DATABASE, logData);
    }
    /**
   * Log database connection events
   */ static logConnection(event, details, trace) {
        switch(event){
            case "connect":
                Logger.info(`Database connected successfully.`, LogContextEnum.DATABASE, details);
                break;
            case "disconnect":
                Logger.info(`Database disconnected.`, LogContextEnum.DATABASE, details);
                break;
            case "error":
                Logger.error(`Database connection error.`, LogContextEnum.DATABASE, trace, details);
                break;
        }
    }
    /**
   * Log transaction events
   */ static logTransaction(event, transactionId, reason) {
        const message = `Transaction ${event}${transactionId ? ` (${transactionId})` : ""}${reason ? `: ${reason}` : ""}`;
        if (event === "rollback") {
            Logger.warn(message, LogContextEnum.DATABASE);
        } else {
            Logger.info(message, LogContextEnum.DATABASE);
        }
    }
    /**
   * Log migration events
   */ static logMigration(event, migrationName, details) {
        const message = `Migration ${migrationName} ${event}${details ? `: ${details}` : ""}`;
        if (event === "error") {
            Logger.error(message, LogContextEnum.DATABASE);
        } else {
            Logger.info(message, LogContextEnum.DATABASE);
        }
    }
}
/**
 * Error logging utilities
 */ export class ErrorLogger {
    /**
   * Log unhandled errors with context
   */ static logUnhandledError(error, context, meta) {
        const errorData = {
            stack: error.stack,
            name: error.name
        };
        if (context === LogContextEnum.DATABASE) {
            DatabaseLogger.contextLogger().error(`Unhandled error in ${context}: ${error.message}`, JSON.stringify(errorData), errorData);
        } else if (context === LogContextEnum.SERVER) {
            ServerLogger.contextLogger().error(`Unhandled error in ${context}: ${error.message}`, JSON.stringify(errorData), meta);
        } else {
        // performanceLogger.error(
        //   `Unhandled error in ${context}: ${error.message}`,
        //   errorData
        // );
        }
    }
    /**
   * Log validation errors
   */ static logValidationError(field, value, rule, endpoint, meta) {
        const logData = {
            endpoint,
            ...meta
        };
        ServerLogger.contextLogger().warn(`Validation error: ${field} failed ${rule} validation (value: ${JSON.stringify(value)})`, logData);
    }
}
