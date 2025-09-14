import { Router } from "express";
import { zodValidatorMiddleware } from "../../common/middlewares/zod-validator.middleware";
import { authMiddleware } from "../../common/middlewares/auth.middleware";
import { Route } from "../../common/types/express";
import { CollectionController } from "./collection.controller";
import { DeleteFolderDto } from "./dto/delete-collection.dto";
import { UpdateFolderDto } from "./dto/update-collection.dto";
import { ForkFolderDto } from "./dto/fork-collection.dto";
import { CreateCollectionDto } from "./dto/create-collection.dto";
import {
  DiscoverCollectionsDto,
  FindCollectionDto,
  FindCollectionsDto,
} from "./dto/find-collection.dto";

export class CollectionRoute implements Route {
  public path: string = "/collections";
  public router: Router = Router();
  public controller: CollectionController = new CollectionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      authMiddleware,
      zodValidatorMiddleware(CreateCollectionDto, "Body"),
      this.controller.create
    );
    this.router.delete(
      `${this.path}/:slug`,
      authMiddleware,
      zodValidatorMiddleware(DeleteFolderDto, "Params"),
      this.controller.delete
    );
    this.router.put(
      `${this.path}/:slug`,
      authMiddleware,
      zodValidatorMiddleware(UpdateFolderDto.pick({ slug: true }), "Params"),
      zodValidatorMiddleware(UpdateFolderDto.shape.data, "Body"),
      this.controller.update
    );
    this.router.put(
      `${this.path}/:slug/fork`,
      authMiddleware,
      zodValidatorMiddleware(ForkFolderDto, "Params"),
      this.controller.fork
    );
    this.router.get(
      `${this.path}/discover`,
      zodValidatorMiddleware(DiscoverCollectionsDto, "Query"),
      this.controller.discover
    );
    this.router.get(
      `${this.path}/current`,
      authMiddleware,
      zodValidatorMiddleware(
        FindCollectionsDto.omit({ creator: true }),
        "Query"
      ),
      this.controller.getCurrentUserCollections
    );
    this.router.get(
      `${this.path}`,
      zodValidatorMiddleware(
        FindCollectionsDto.omit({ creator: true }),
        "Query"
      ),
      zodValidatorMiddleware(
        FindCollectionsDto.pick({ creator: true }),
        "Params"
      ),
      this.controller.getUserCollections as any
    );
    this.router.get(
      `${this.path}/:slug`,
      zodValidatorMiddleware(FindCollectionDto, "Params"),
      this.controller.getCollection
    );
  }
}
