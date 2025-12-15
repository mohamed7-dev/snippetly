import { type AppLogger, LogLevel } from "./app-logger";
import { type LogContext } from "./constants";

/**
 * Dummy logger for testing — does not print anything.
 */
export class DummyLogger implements AppLogger {
  private defaultContext: LogContext = "DEFAULT";
  private level: LogLevel = LogLevel.Verbose;

  info(message: string, context?: string, meta?: object): void {
    // no-op
  }

  warn(message: string, context?: string, meta?: object): void {
    // no-op
  }

  error(
    message: string,
    context?: string,
    trace?: string,
    meta?: object
  ): void {
    // no-op
  }

  debug(message: string, context?: string, meta?: object): void {
    // no-op
  }

  verbose(message: string, context?: string, meta?: object): void {
    // no-op
  }

  setDefaultContext(defaultContext: LogContext): void {
    this.defaultContext = defaultContext;
  }
}
