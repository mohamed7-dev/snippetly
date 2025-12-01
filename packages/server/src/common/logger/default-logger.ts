import pc from "picocolors";
import { type AppLogger, LogLevel } from "./app-logger";
import { DEFAULT_CONTEXT, type LogContext } from "./constants";

/**
 * @description
 * This is the default logger service, it uses the console (stdout) to display the logs.
 */
export class DefaultLogger implements AppLogger {
  private defaultContext: LogContext = DEFAULT_CONTEXT;
  private level: LogLevel = LogLevel.Info;
  private readonly localeTimestampOptions = {
    year: "2-digit",
    hour: "numeric",
    minute: "numeric",
    day: "numeric",
    month: "numeric",
  } as const;

  info(message: string, context?: string, meta?: object): void {
    if (this.level >= LogLevel.Info) {
      const stringifiedMessage = this.ensureString(message);
      this.logMessage(pc.blue("Info"), stringifiedMessage, context, meta);
    }
  }

  warn(message: string, context?: string, meta?: object): void {
    if (this.level >= LogLevel.Warn) {
      const stringifiedMessage = this.ensureString(message);
      this.logMessage(pc.yellow("Warn"), stringifiedMessage, context, meta);
    }
  }
  error(
    message: string,
    context?: string,
    trace?: string,
    meta?: object
  ): void {
    if (this.level >= LogLevel.Error) {
      const stringifiedMessage = this.ensureString(
        message + (trace ? `\n${trace}` : "")
      );
      this.logMessage(pc.red("Error"), stringifiedMessage, context, meta);
    }
  }
  debug(message: string, context?: string, meta?: object): void {
    if (this.level >= LogLevel.Debug) {
      const stringifiedMessage = this.ensureString(message);
      this.logMessage(pc.magenta("Debug"), stringifiedMessage, context, meta);
    }
  }
  verbose(message: string, context?: string, meta?: object): void {
    if (this.level >= LogLevel.Verbose) {
      const stringifiedMessage = this.ensureString(message);
      this.logMessage(pc.magenta("Verbose"), stringifiedMessage, context, meta);
    }
  }

  setDefaultContext(defaultContext: LogContext): void {
    this.defaultContext = defaultContext;
  }

  private logMessage(
    prefix: string,
    message: string,
    context?: string,
    meta?: object
  ) {
    const timestampLog = this.getTimestampLog();
    const contextLog = this.getContextLog(context);
    const metaLog = [pc.gray("Metadata"), "--", this.ensureString(meta!)].join(
      " "
    );

    const messageLog = [
      prefix,
      timestampLog,
      contextLog,
      message,
      meta ? metaLog : "",
      "\n",
    ].join(" ");

    process.stdout.write(messageLog);
  }

  private getTimestampLog() {
    const timestamp = new Date(Date.now()).toLocaleString(
      undefined,
      this.localeTimestampOptions
    );
    return pc.gray(timestamp + " --");
  }
  private getContextLog(context?: string) {
    return pc.cyan(`[${context || this.defaultContext}]`);
  }
  private ensureString(message: string | object | unknown[]): string {
    return typeof message === "string"
      ? message
      : JSON.stringify(message, null, 2);
  }
}
