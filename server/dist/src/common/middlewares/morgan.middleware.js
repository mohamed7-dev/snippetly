import morgan from "morgan";
import { LOG_FORMAT } from "../../config/index.js";
import { ServerLogger } from "../logger/index.js";
const stream = {
    write: (message)=>ServerLogger.contextLogger().http(message.substring(0, message.lastIndexOf("\n")))
};
const skip = ()=>{
    const env = process.env.NODE_ENV;
    return env !== "development";
};
export const morganMiddleware = morgan(LOG_FORMAT, {
    stream,
    skip
});
