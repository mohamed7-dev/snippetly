import morgan, { StreamOptions } from "morgan";
import { serverLogger } from "../logger";
import { LOG_FORMAT, NODE_ENV } from "../../config";

const stream: StreamOptions = {
  write: (message: string) =>
    serverLogger.http(message.substring(0, message.lastIndexOf("\n"))),
};

const skip = () => {
  const env = NODE_ENV || "development";
  return env !== "development";
};

export const morganMiddleware = morgan(LOG_FORMAT, { stream, skip });
