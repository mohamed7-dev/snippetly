import { StatusCodes } from "http-status-codes";
import { HttpException } from "../common/lib/exception.ts";
import { isDevelopment } from "../common/lib/utils.ts";

export const APP_NAME = "Snippetly";
export const APP_URL = process.env.BASE_URL || "http://localhost:3010";
export const PORT = process.env.PORT || 3010;

export const CLIENTS_URLS = {
  react: process.env.REACT_CLIENT_APP_URL,
  react2: process.env.REACT_CLIENT_APP_URL_2,
  reactEmailVerification: process.env.REACT_EMAIL_VERIFICATION_URL,
  reactPasswordReset: process.env.REACT_PASSWORD_RESET_URL,
};

// LOGS
export const LOG_DIR = process.env.LOG_DIR || "logs";
export const LOG_FORMAT = process.env.LOG_FORMAT || "dev";

// JWT
export const ACCESS_JWTOKEN_SECRET = process.env.ACCESS_JWTOKEN_SECRET!;
export const REFRESH_JWTOKEN_SECRET = process.env.REFRESH_JWTOKEN_SECRET!;
if (!ACCESS_JWTOKEN_SECRET || !REFRESH_JWTOKEN_SECRET) {
  throw new HttpException(
    StatusCodes.INTERNAL_SERVER_ERROR,
    "Missing ACCESS_JWTOKEN_SECRET or REFRESH_JWTOKEN_SECRET Env Variables."
  );
}
export const JWT_ACCESS_EXPIRES = isDevelopment
  ? 7 * 24 * 60 * 60 * 1000 // 7 days
  : 15 * 60 * 1000; // 15 minutes;
export const JWT_REFRESH_EXPIRES = isDevelopment
  ? 7 * 24 * 60 * 60 * 1000 // 7 days
  : 7 * 24 * 60 * 60 * 1000; // 7 days;
export const JWT_REFRESH_REMEMBER_EXPIRES = isDevelopment
  ? 30 * 24 * 60 * 60 * 1000 // 7 days
  : 30 * 24 * 60 * 60 * 1000; // 30 days;
