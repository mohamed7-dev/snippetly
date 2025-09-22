import { AppLogger } from "./app-logger";
import { LogContext } from "./constants";

/**
 * @description
 * This class is responsible for handling all the logging throughout the application.
 **/
export class Logger {
  private static _logger: AppLogger;

  static get logger(): AppLogger {
    return this._logger;
  }

  /** @internal */
  static useLogger(logger: AppLogger) {
    Logger._logger = logger;
  }

  static info(message: string, context?: LogContext, meta?: object) {
    Logger.logger.info(message, context, meta);
  }
  static debug(message: string, context?: LogContext, meta?: object) {
    Logger.logger.debug(message, context, meta);
  }
  static warn(message: string, context?: LogContext, meta?: object) {
    Logger.logger.warn(message, context, meta);
  }
  static verbose(message: string, context?: LogContext, meta?: object) {
    Logger.logger.verbose(message, context, meta);
  }
  static error(
    message: string,
    context?: LogContext,
    trace?: string,
    meta?: object
  ): void {
    Logger.logger.error(message, context, trace, meta);
  }
}
