import mongoose from "mongoose";
import { DatabaseLogger } from "../logger";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) throw new Error("Missing Mongo_URI Env Variable.");

export async function connectToDatabase() {
  return mongoose
    .connect(MONGO_URI)
    .then(() => {
      DatabaseLogger.logConnection("connect");
    })
    .catch((err) => {
      DatabaseLogger.logConnection("error", err);
      process.exit(1);
    });
}
