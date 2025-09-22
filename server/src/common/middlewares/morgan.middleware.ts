import morgan, { type StreamOptions } from "morgan";
import { LOG_FORMAT } from "../../config/index.ts";
import { ServerLogger } from "../logger/index.ts";

const stream: StreamOptions = {
  write: (message: string) =>
    ServerLogger.contextLogger().http(
      message.substring(0, message.lastIndexOf("\n"))
    ),
};

const skip = () => {
  const env = process.env.NODE_ENV;
  return env !== "development";
};

export const morganMiddleware = morgan(LOG_FORMAT, { stream, skip });
