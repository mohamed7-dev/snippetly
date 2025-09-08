import { AppLogger } from "./app-logger";
import { LogContext } from "./constants";

/**
 * @description
 * This class is responsible for handling all the logging throughout the application.
 **/
export class Logger {
  private static _instance: typeof Logger = Logger;
  private static _logger: AppLogger;

  static get logger(): AppLogger {
    return this._logger;
  }

  private get instance(): typeof Logger {
    return Logger._instance;
  }

  /** @internal */
  static useLogger(logger: AppLogger) {
    Logger._logger = logger;
  }

  // /**
  //  * @internal
  //  */
  // log(message: any, context?: string) {
  //   this.instance.info(message as string, context);
  // }
  // /**
  //  * @internal
  //  */
  // debug(message: any, context?: string) {
  //   this.instance.debug(message as string, context);
  // }
  // /**
  //  * @internal
  //  */
  // verbose(message: any, context?: string) {
  //   this.instance.verbose(message as string, context);
  // }
  // /**
  //  * @internal
  //  */
  // warn(message: any, context?: string) {
  //   this.instance.warn(message as string, context);
  // }
  // /**
  //  * @internal
  //  */
  // error(message: any, trace?: string, context?: string) {
  //   if (message instanceof Error) {
  //     const err = message;
  //     this.instance.error(err.message, err.stack, context);
  //   } else {
  //     this.instance.error(message as string, trace, context);
  //   }
  // }

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
