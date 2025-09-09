import { CorsOptions } from "cors";
import { HttpException } from "./exception";
import { StatusCodes } from "http-status-codes";

export const allowedOrigins = ["http://localhost:3000"];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new HttpException(StatusCodes.FORBIDDEN, "Blocked by CORS."));
    }
  },
  optionsSuccessStatus: 200,
};
