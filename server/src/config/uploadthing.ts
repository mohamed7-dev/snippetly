import { UTApi } from "uploadthing/server";
import { HttpException } from "../common/lib/exception.ts";
import { StatusCodes } from "http-status-codes";

const token = process.env.UPLOADTHING_TOKEN;

if (!token) {
  throw new HttpException(
    StatusCodes.INTERNAL_SERVER_ERROR,
    "Server is misconfigured make sure all env variables exist before running the server."
  );
}

export const utapi = new UTApi({
  token,
});
