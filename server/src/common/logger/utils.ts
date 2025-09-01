import {
  serverLogger,
  databaseLogger,
  performanceLogger
} from './logger';
import {
  PerformanceLogMeta,
  DatabaseLogMeta,
  ServerLogMeta
} from './types';

/**
 * Performance logging utilities
 */
export class PerformanceLogger {
  /**
   * Log API request performance
   */
  static logApiRequest(
    endpoint: string,
    method: string,
    duration: number,
    statusCode: number,
    meta?: Partial<PerformanceLogMeta>
  ) {
    const logData: PerformanceLogMeta = {
      endpoint,
      operation: `${method} ${endpoint}`,
      duration,
      statusCode,
      ...meta
    };

    if (duration > 1000) {
      performanceLogger.warn(
        `Slow API request: ${method} ${endpoint} took ${duration}ms`,
        logData
      );
    } else if (duration > 500) {
      performanceLogger.info(
        `API request: ${method} ${endpoint} took ${duration}ms`,
        logData
      );
    } else {
      performanceLogger.debug(
        `API request: ${method} ${endpoint} took ${duration}ms`,
        logData
      );
    }
  }

  /**
   * Log database query performance
   */
  static logQueryPerformance(
    query: string,
    duration: number,
    affectedRows?: number,
    meta?: Partial<PerformanceLogMeta>
  ) {
    const logData: PerformanceLogMeta = {
      operation: 'Database Query',
      duration,
      ...meta
    };

    if (duration > 2000) {
      performanceLogger.error(
        `Very slow query (${duration}ms): ${query.substring(0, 100)}...`,
        { ...logData, query, affectedRows }
      );
    } else if (duration > 1000) {
      performanceLogger.warn(
        `Slow query (${duration}ms): ${query.substring(0, 100)}...`,
        { ...logData, query, affectedRows }
      );
    } else {
      performanceLogger.debug(
        `Query executed in ${duration}ms`,
        { ...logData, query, affectedRows }
      );
    }
  }

  /**
   * Performance timer utility
   */
  static timer(label: string) {
    const start = Date.now();
    return {
      end: (meta?: Partial<PerformanceLogMeta>) => {
        const duration = Date.now() - start;
        performanceLogger.info(`${label} completed in ${duration}ms`, {
          operation: label,
          duration,
          ...meta
        });
        return duration;
      }
    };
  }
}

/**
 * Database logging utilities
 */
export class DatabaseLogger {
  /**
   * Log successful database operations
   */
  static logOperation(
    operation: DatabaseLogMeta['operation'],
    table: string,
    details?: string,
    meta?: Partial<DatabaseLogMeta>
  ) {
    const logData: DatabaseLogMeta = {
      operation,
      table,
      ...meta
    };

    databaseLogger.info(
      `${operation} operation on ${table}${details ? `: ${details}` : ''}`,
      logData
    );
  }

  /**
   * Log database connection events
   */
  static logConnection(event: 'connect' | 'disconnect' | 'error', details?: string) {
    switch (event) {
      case 'connect':
        databaseLogger.info(`Database connected successfully${details ? `: ${details}` : ''}`);
        break;
      case 'disconnect':
        databaseLogger.info(`Database disconnected${details ? `: ${details}` : ''}`);
        break;
      case 'error':
        databaseLogger.error(`Database connection error${details ? `: ${details}` : ''}`);
        break;
    }
  }

  /**
   * Log transaction events
   */
  static logTransaction(
    event: 'start' | 'commit' | 'rollback',
    transactionId?: string,
    reason?: string
  ) {
    const message = `Transaction ${event}${transactionId ? ` (${transactionId})` : ''}${reason ? `: ${reason}` : ''}`;

    if (event === 'rollback') {
      databaseLogger.warn(message);
    } else {
      databaseLogger.info(message);
    }
  }

  /**
   * Log migration events
   */
  static logMigration(
    event: 'start' | 'complete' | 'error',
    migrationName: string,
    details?: string
  ) {
    const message = `Migration ${migrationName} ${event}${details ? `: ${details}` : ''}`;

    if (event === 'error') {
      databaseLogger.error(message);
    } else {
      databaseLogger.info(message);
    }
  }
}

/**
 * Server logging utilities
 */
export class ServerLogger {
  /**
   * Log server startup events
   */
  static logStartup(port: number, environment: string) {
    serverLogger.info(`🚀 Server started on port ${port} in ${environment} mode`, {
      endpoint: `http://localhost:${port}`,
      statusCode: 200
    });
  }

  /**
   * Log server shutdown events
   */
  static logShutdown(reason?: string) {
    serverLogger.info(`🛑 Server shutting down${reason ? `: ${reason}` : ''}`);
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
      ...meta
    };

    serverLogger.debug(
      `Middleware ${middlewareName} executed for ${method} ${endpoint}${duration ? ` in ${duration}ms` : ''}`,
      logData
    );
  }

  /**
   * Log authentication events
   */
  static logAuth(
    event: 'login' | 'logout' | 'failed_login' | 'token_refresh',
    userId?: string,
    ip?: string,
    userAgent?: string
  ) {
    const logData: ServerLogMeta = {
      ip,
      userAgent
    };

    switch (event) {
      case 'login':
        serverLogger.info(`User login successful${userId ? ` (${userId})` : ''}`, logData);
        break;
      case 'logout':
        serverLogger.info(`User logout${userId ? ` (${userId})` : ''}`, logData);
        break;
      case 'failed_login':
        serverLogger.warn(`Failed login attempt${userId ? ` for ${userId}` : ''}`, logData);
        break;
      case 'token_refresh':
        serverLogger.debug(`Token refresh${userId ? ` for ${userId}` : ''}`, logData);
        break;
    }
  }

  /**
   * Log security events
   */
  static logSecurity(
    event: 'rate_limit' | 'suspicious_activity' | 'blocked_request',
    details: string,
    ip?: string,
    meta?: Partial<ServerLogMeta>
  ) {
    const logData: ServerLogMeta = {
      ip,
      ...meta
    };

    serverLogger.warn(`Security event - ${event}: ${details}`, logData);
  }

  /**
   * Log route registration
   */
  static logRouteRegistration(method: string, path: string, handler: string) {
    serverLogger.debug(`Route registered: ${method.toUpperCase()} ${path} -> ${handler}`);
  }
}

/**
 * Error logging utilities
 */
export class ErrorLogger {
  /**
   * Log unhandled errors with context
   */
  static logUnhandledError(error: Error, context: string, meta?: any) {
    const errorData = {
      context,
      stack: error.stack,
      name: error.name,
      ...meta
    };

    if (context.toLowerCase().includes('database')) {
      databaseLogger.error(`Unhandled error in ${context}: ${error.message}`, errorData);
    } else if (context.toLowerCase().includes('server')) {
      serverLogger.error(`Unhandled error in ${context}: ${error.message}`, errorData);
    } else {
      performanceLogger.error(`Unhandled error in ${context}: ${error.message}`, errorData);
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
      ...meta
    };

    serverLogger.warn(
      `Validation error: ${field} failed ${rule} validation (value: ${JSON.stringify(value)})`,
      logData
    );
  }
}

/**
 * Utility to create execution timers with automatic logging
 */
export function createExecutionTimer(
  operationName: string,
  context: 'server' | 'database' | 'performance' = 'performance'
) {
  const start = Date.now();

  return {
    end: (additionalInfo?: string, meta?: any) => {
      const duration = Date.now() - start;
      const message = `${operationName} completed in ${duration}ms${additionalInfo ? ` - ${additionalInfo}` : ''}`;

      const logData = {
        operation: operationName,
        duration,
        ...meta
      };

      switch (context) {
        case 'server':
          serverLogger.info(message, logData);
          break;
        case 'database':
          databaseLogger.info(message, logData);
          break;
        case 'performance':
        default:
          performanceLogger.info(message, logData);
          break;
      }

      return duration;
    }
  };
}

/**
 * Decorator for timing function execution
 */
export function timed(context: 'server' | 'database' | 'performance' = 'performance') {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const timer = createExecutionTimer(`${target.constructor.name}.${propertyName}`, context);
      try {
        const result = await method.apply(this, args);
        timer.end('Success');
        return result;
      } catch (error) {
        timer.end('Error');
        throw error;
      }
    };
  };
}
