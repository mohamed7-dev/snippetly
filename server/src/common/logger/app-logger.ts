import { type LogContext } from "./constants.ts";

/**
 * @description
 * The AppLogger interface defines the shape of the logger service.
 *
 * @docsCategory Logger
 */
export interface AppLogger {
  info(message: string, context?: LogContext, meta?: object): void;
  warn(message: string, context?: LogContext, meta?: object): void;
  verbose(message: string, context?: LogContext, meta?: object): void;
  debug(message: string, context?: LogContext, meta?: object): void;
  error(
    message: string,
    context?: LogContext,
    trace?: string,
    meta?: object
  ): void;
  setDefaultContext?(defaultContext: string): void;
}

/**
 * @description
 * An enum of valid logging levels.
 *
 * @docsCategory Logger
 */
export enum LogLevel {
  /**
   * @description
   * Log Errors only. These are usually indicative of some potentially
   * serious issue, so should be acted upon.
   */
  Error = 0,
  /**
   * @description
   * Warnings indicate that some situation may require investigation
   * and handling. But not as serious as an Error.
   */
  Warn = 1,
  /**
   * @description
   * Logs general information such as startup messages.
   */
  Info = 2,
  /**
   * @description
   * Logs additional information
   */
  Verbose = 3,
  /**
   * @description
   * Logs detailed info useful in debug scenarios, including stack traces for
   * all errors. In production this would probably generate too much noise.
   */
  Debug = 4,
}
