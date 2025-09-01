import { NODE_ENV } from "../../config";

export const isDevelopment = NODE_ENV === "development";
export const isProduction = NODE_ENV === "production";
