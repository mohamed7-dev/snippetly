import { isDevelopment } from "../common/lib/utils";

export const APP_NAME = "Snippetly";
export const APP_URL = process.env.BASE_URL || "http://localhost:3000";
export const LOG_DIR = process.env.LOG_DIR || "logs";
export const PORT = process.env.PORT || 3010;
export const NODE_ENV = process.env.NODE_ENV || "development";
export const LOG_FORMAT = process.env.LOG_FORMAT || "dev";
export const ACCESS_JWTOKEN_SECRET = process.env.ACCESS_JWTOKEN_SECRET;
export const REFRESH_JWTOKEN_SECRET = process.env.REFRESH_JWTOKEN_SECRET;

// TODO: modify later on
export const JWT_ACCESS_EXPIRES = isDevelopment ? "1d" : "30min";
export const JWT_REFRESH_EXPIRES = isDevelopment ? "1d" : "30d";
