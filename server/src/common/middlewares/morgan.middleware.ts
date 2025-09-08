import morgan, { StreamOptions } from "morgan";
import { LOG_FORMAT, NODE_ENV } from "../../config";
import { ServerLogger } from "../logger-alternative";

const stream: StreamOptions = {
  write: (message: string) =>
    ServerLogger.contextLogger().http(
      message.substring(0, message.lastIndexOf("\n"))
    ),
};

const skip = () => {
  const env = NODE_ENV;
  return env !== "development";
};

export const morganMiddleware = morgan(LOG_FORMAT, { stream, skip });
