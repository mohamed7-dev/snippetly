import { createUploadthing, type FileRouter } from "uploadthing/express";
import { HttpException } from "../../common/lib/exception.ts";
import { StatusCodes } from "http-status-codes";
import { UserRepository } from "../user/user.repository.ts";

export class UploadRouter {
  private f = createUploadthing();
  private router: FileRouter;

  constructor() {
    this.router = this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router = {
      ["upload-avatar"]: this.f({
        image: {
          maxFileSize: "1MB",
          maxFileCount: 1,
        },
      })
        .middleware(async ({ req }) => {
          if (!req.context.user) {
            throw new HttpException(
              StatusCodes.UNAUTHORIZED,
              "You are not allowed to perform this action."
            );
          }
          return { user: req.context.user };
        })
        .onUploadComplete(async ({ metadata, file }) => {
          const userRepository = new UserRepository();
          if (metadata.user) {
            await userRepository.update(metadata.user.id, {
              image: file.ufsUrl,
              imageCustomId: file.customId,
              imageKey: file.key,
            });
          }
        }),
    };
    return this.router;
  }

  /**
   * Returns the configured upload router
   */
  public getRouter(): FileRouter {
    return this.router;
  }
}

export const uploadRouter = new UploadRouter().getRouter();

export type OurFileRouter = typeof uploadRouter;
