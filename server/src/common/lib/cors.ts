import { type CorsOptions } from "cors";
import { HttpException } from "./exception.ts";
import { StatusCodes } from "http-status-codes";
import { CLIENTS_URLS } from "../../config/index.ts";

export const allowedOrigins = [CLIENTS_URLS.react, CLIENTS_URLS.react2];
export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if ((origin && allowedOrigins.indexOf(origin) !== -1) || !origin) {
      callback(null, true);
    } else {
      callback(new HttpException(StatusCodes.FORBIDDEN, "Blocked by CORS."));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  optionsSuccessStatus: 200,
};
