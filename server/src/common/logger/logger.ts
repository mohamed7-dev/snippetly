import { existsSync, mkdirSync } from "fs";
import winston from "winston";
import { LOG_DIR } from "../../config/index";
import path from "path";
import { isDevelopment } from "../lib/utils";
import { LogContext } from "./types";
import DailyRotateFile, {
  DailyRotateFileTransportOptions,
} from "winston-daily-rotate-file";

const dir: string = path.join(process.cwd(), LOG_DIR!);

if (!existsSync(dir)) {
  try {
    mkdirSync(dir, { recursive: true });
  } catch (error) {
    console.error(`Failed to create log directory: ${error}`);
    process.exit(1);
  }
}

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = isDevelopment ? "debug" : "warn";

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

// Context colors for console output
const contextColors = {
  SERVER: "\x1b[36m", // Cyan
  DATABASE: "\x1b[33m", // Yellow
  PERFORMANCE: "\x1b[35m", // Magenta
  RESET: "\x1b[0m", // Reset
};

// Console format with context colors
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.prettyPrint({ depth: 5 }),
  winston.format.printf((info) => {
    const context = info.context
      ? `${contextColors[info.context as keyof typeof contextColors] || ""}[${info.context}]${contextColors.RESET} `
      : "";
    return `${info.timestamp} ${context}[${info.level}]: ${info.message}`;
  }),
);

// File format without colors
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.prettyPrint({ depth: 5 }),
  winston.format.printf((info) => {
    const context = info.context ? `[${info.context}] ` : "";
    return `${info.timestamp} ${context}[${info.level}]: ${info.message}`;
  }),
);

// Custom transport class that filters by context
class ContextFilteredFileTransport extends DailyRotateFile {
  private allowedContext?: string;

  constructor(
    options: DailyRotateFileTransportOptions & {
      allowedContext?: string;
    },
  ) {
    super(options);
    this.allowedContext = options.allowedContext;
  }

  log(info: any, callback: () => void) {
    // If no context filter is set, allow all logs
    if (!this.allowedContext) {
      return super.log(info, callback);
    }

    // Only log if the context matches
    if (info.context === this.allowedContext) {
      return super.log(info, callback);
    }

    // Skip this log entry
    setImmediate(callback);
    return true;
  }
}

// Shared console transport
const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
});

// All logs go to all.log
const contextlessLogTransport = new ContextFilteredFileTransport({
  dirname: path.join(dir, "all"),
  filename: "%DATE%_all.log",
  format: fileFormat,
  datePattern: "YYYY-MM-DD-HH",
  maxSize: "2m",
  maxFiles: "14d",
});

// Error level logs go to error.log
const errorLogTransport = new ContextFilteredFileTransport({
  dirname: path.join(dir, "errors"),
  filename: "%DATE%_error.log",
  level: "error",
  format: fileFormat,
  datePattern: "YYYY-MM-DD-HH",
  maxSize: "2m",
  maxFiles: "14d",
});

// Context-specific transports
const serverLogTransport = new ContextFilteredFileTransport({
  dirname: path.join(dir, "server"),
  filename: "%DATE%_server.log",
  allowedContext: "SERVER",
  format: fileFormat,
  datePattern: "YYYY-MM-DD-HH",
  maxSize: "2m",
  maxFiles: "14d",
});

const databaseLogTransport = new ContextFilteredFileTransport({
  dirname: path.join(dir, "database"),
  filename: "%DATE%_database.log",
  format: fileFormat,
  allowedContext: "DATABASE",
  datePattern: "YYYY-MM-DD-HH",
  maxSize: "2m",
  maxFiles: "14d",
});

const performanceLogTransport = new ContextFilteredFileTransport({
  dirname: path.join(dir, "performance"),
  filename: "%DATE%performance.log",
  format: fileFormat,
  allowedContext: "PERFORMANCE",
  datePattern: "YYYY-MM-DD-HH",
  maxSize: "2m",
  maxFiles: "1d",
});

// Base logger that writes to all transports
const baseLogger = winston.createLogger({
  level,
  levels,
  transports: [
    consoleTransport,
    contextlessLogTransport,
    errorLogTransport,
    serverLogTransport,
    databaseLogTransport,
    performanceLogTransport,
  ],
});

// Create contextual loggers that add context metadata
const createContextLogger = (context: LogContext) => {
  return {
    error: (message: string, meta?: any) =>
      baseLogger.error(message, { context, ...meta }),
    warn: (message: string, meta?: any) =>
      baseLogger.warn(message, { context, ...meta }),
    info: (message: string, meta?: any) =>
      baseLogger.info(message, { context, ...meta }),
    http: (message: string, meta?: any) =>
      baseLogger.http(message, { context, ...meta }),
    debug: (message: string, meta?: any) =>
      baseLogger.debug(message, { context, ...meta }),
  };
};

// Context-specific loggers
const serverLogger = createContextLogger("SERVER");
const databaseLogger = createContextLogger("DATABASE");
const performanceLogger = createContextLogger("PERFORMANCE");

// Default logger (backwards compatibility) - no context, so won't appear in context-specific files
const logger = {
  error: (message: string, meta?: any) => baseLogger.error(message, meta),
  warn: (message: string, meta?: any) => baseLogger.warn(message, meta),
  info: (message: string, meta?: any) => baseLogger.info(message, meta),
  http: (message: string, meta?: any) => baseLogger.http(message, meta),
  debug: (message: string, meta?: any) => baseLogger.debug(message, meta),
};

export { logger, serverLogger, databaseLogger, performanceLogger };
