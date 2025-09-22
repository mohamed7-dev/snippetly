import pc from "picocolors";
import fs from "fs";
import path from "path";
import { LogLevel } from "./app-logger.js";
import { DEFAULT_CONTEXT } from "./constants.js";
/**
 * @description
 * This is the default logger service used if not changed by the user config settings, it uses
 * the console (stdout) to display the logs.
 */ export class DefaultLogger {
  defaultContext = DEFAULT_CONTEXT;
  level = LogLevel.Info;
  localeTimestampOptions = {
    year: "2-digit",
    hour: "numeric",
    minute: "numeric",
    day: "numeric",
    month: "numeric",
  };
  static fileStream = null;
  // log files functionality is not useful on vercel so i decided to leave
  // it here, but not using it
  static isProduction = false;
  static currentLogDate = null;
  constructor() {
    if (DefaultLogger.isProduction) {
      this.rotateLogFileIfNeeded();
      // Ensure file stream is closed on process exit
      process.on("exit", () => {
        DefaultLogger.fileStream?.end();
      });
      process.on("SIGINT", () => {
        DefaultLogger.fileStream?.end();
        process.exit();
      });
    }
  }
  rotateLogFileIfNeeded() {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    if (DefaultLogger.currentLogDate !== today) {
      // Close previous stream if open
      if (DefaultLogger.fileStream) {
        DefaultLogger.fileStream.end();
      }
      const logDir =
        process.env.LOG_PATH || path.resolve(process.cwd(), "logs");
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, {
          recursive: true,
        });
      }
      const logFile = path.join(logDir, `app-${today}.log`);
      DefaultLogger.fileStream = fs.createWriteStream(logFile, {
        flags: "a",
      });
      DefaultLogger.currentLogDate = today;
    }
  }
  info(message, context, meta) {
    if (this.level >= LogLevel.Info) {
      const stringifiedMessage = this.ensureString(message);
      this.logMessage(pc.blue("Info"), stringifiedMessage, context, meta);
    }
  }
  warn(message, context, meta) {
    if (this.level >= LogLevel.Warn) {
      const stringifiedMessage = this.ensureString(message);
      this.logMessage(pc.yellow("Warn"), stringifiedMessage, context, meta);
    }
  }
  error(message, context, trace, meta) {
    if (this.level >= LogLevel.Error) {
      const stringifiedMessage = this.ensureString(
        message + (trace ? `\n${trace}` : "")
      );
      this.logMessage(pc.red("Error"), stringifiedMessage, context, meta);
    }
  }
  debug(message, context, meta) {
    if (this.level >= LogLevel.Debug) {
      const stringifiedMessage = this.ensureString(message);
      this.logMessage(pc.magenta("Debug"), stringifiedMessage, context, meta);
    }
  }
  verbose(message, context, meta) {
    if (this.level >= LogLevel.Verbose) {
      const stringifiedMessage = this.ensureString(message);
      this.logMessage(pc.magenta("Verbose"), stringifiedMessage, context, meta);
    }
  }
  setDefaultContext(defaultContext) {
    this.defaultContext = defaultContext;
  }
  logMessage(prefix, message, context, meta) {
    const timestampLog = this.getTimestampLog();
    const contextLog = this.getContextLog(context);
    const metaLog = [pc.gray("Metadata"), "--", this.ensureString(meta)].join(
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
    // in production, log to files as well not only stdout
    if (DefaultLogger.isProduction) {
      this.rotateLogFileIfNeeded();
      if (DefaultLogger.fileStream) {
        // Remove color codes for file logs
        const plainPrefix = prefix.replace(/\x1b\[[0-9;]*m/g, "");
        const plainContextLog = contextLog.replace(/\x1b\[[0-9;]*m/g, "");
        const plainTimestampLog = timestampLog.replace(/\x1b\[[0-9;]*m/g, "");
        const fileMessage = [
          plainPrefix,
          plainTimestampLog,
          plainContextLog,
          message,
          "\n",
        ].join(" ");
        DefaultLogger.fileStream.write(fileMessage);
      }
    }
  }
  getTimestampLog() {
    const timestamp = new Date(Date.now()).toLocaleString(
      undefined,
      this.localeTimestampOptions
    );
    return pc.gray(timestamp + " --");
  }
  getContextLog(context) {
    return pc.cyan(`[${context || this.defaultContext}]`);
  }
  ensureString(message) {
    return typeof message === "string"
      ? message
      : JSON.stringify(message, null, 2);
  }
}
