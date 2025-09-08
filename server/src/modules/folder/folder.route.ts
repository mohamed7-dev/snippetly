import { Router } from "express";
import { zodValidatorMiddleware } from "../../common/middlewares/zod-validator.middleware";
import { authMiddleware } from "../../common/middlewares/auth.middleware";
import { Route } from "../../common/types/express";
import { FolderController } from "./folder.controller";
import { CreateFolderDto } from "./dto/create-folder.dto";
import { DeleteFolderDto } from "./dto/delete-folder.dto";
import { UpdateFolderDto } from "./dto/update-folder.dto";
import { FindFolderDto, FindFoldersDto } from "./dto/find-folder.dto";
import { ForkFolderDto } from "./dto/fork-folder.dto";

export class CollectionRoute implements Route {
  public path: string = "/folders";
  public router: Router = Router();
  public controller: FolderController = new FolderController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      authMiddleware,
      zodValidatorMiddleware(CreateFolderDto, "Body"),
      this.controller.create
    );
    this.router.delete(
      `${this.path}/:code`,
      authMiddleware,
      zodValidatorMiddleware(DeleteFolderDto, "Params"),
      this.controller.delete
    );
    this.router.put(
      `${this.path}/:code`,
      authMiddleware,
      zodValidatorMiddleware(UpdateFolderDto.pick({ code: true }), "Params"),
      zodValidatorMiddleware(UpdateFolderDto.shape.data, "Body"),
      this.controller.update
    );
    this.router.put(
      `${this.path}/:code/fork`,
      authMiddleware,
      zodValidatorMiddleware(ForkFolderDto, "Params"),
      this.controller.fork
    );
    this.router.get(
      `${this.path}/current`,
      authMiddleware,
      zodValidatorMiddleware(FindFoldersDto.omit({ owner: true }), "Query"),
      this.controller.findCurrentUserFolders
    );
    this.router.get(
      `${this.path}`,
      zodValidatorMiddleware(FindFoldersDto, "Query"),
      this.controller.findFolders as any
    );
    this.router.get(
      `${this.path}/:code`,
      zodValidatorMiddleware(FindFolderDto, "Params"),
      this.controller.findFolder
    );
  }
}
