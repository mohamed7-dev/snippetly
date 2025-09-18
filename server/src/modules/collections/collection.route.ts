import { Router } from "express";
import { zodValidatorMiddleware } from "../../common/middlewares/zod-validator.middleware";
import { authMiddleware } from "../../common/middlewares/auth.middleware";
import { Route } from "../../common/types/express";
import { CollectionController } from "./collection.controller";
import { CreateCollectionDto } from "./dto/create-collection.dto";
import {
  DiscoverCollectionsDto,
  FindCollectionDto,
  FindCollectionsDto,
} from "./dto/find-collection.dto";
import { DeleteCollectionDto } from "./dto/delete-collection.dto";
import { UpdateCollectionDto } from "./dto/update-collection.dto";
import { ForkCollectionDto } from "./dto/fork-collection.dto";

export class CollectionRoute implements Route {
  public path: string = "/collections";
  public router: Router = Router();
  public controller: CollectionController = new CollectionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // --- create ---
    this.router.post(
      `${this.path}`,
      authMiddleware,
      zodValidatorMiddleware(CreateCollectionDto, "Body"),
      this.controller.create
    );

    // --- static GET routes ---
    this.router.get(
      `${this.path}/discover`,
      zodValidatorMiddleware(DiscoverCollectionsDto, "Query"),
      this.controller.discover
    );
    this.router.get(
      `${this.path}/current`,
      authMiddleware,
      zodValidatorMiddleware(
        FindCollectionsDto.omit({ creatorName: true }),
        "Query"
      ),
      this.controller.getCurrentUserCollections
    );

    // --- user collections (more specific than :slug) ---
    this.router.get(
      `${this.path}/user/:creatorName`,
      zodValidatorMiddleware(
        FindCollectionsDto.omit({ creatorName: true }),
        "Query"
      ),
      zodValidatorMiddleware(
        FindCollectionsDto.pick({ creatorName: true }),
        "Params"
      ),
      this.controller.getUserCollections as any
    );

    // --- fork (longer param path, must be before :slug) ---
    this.router.put(
      `${this.path}/:slug/fork`,
      authMiddleware,
      zodValidatorMiddleware(ForkCollectionDto, "Params"),
      this.controller.fork
    );

    // --- update/delete by slug ---
    this.router.put(
      `${this.path}/:slug`,
      authMiddleware,
      zodValidatorMiddleware(
        UpdateCollectionDto.pick({ slug: true }),
        "Params"
      ),
      zodValidatorMiddleware(UpdateCollectionDto.shape.data, "Body"),
      this.controller.update
    );
    this.router.delete(
      `${this.path}/:slug`,
      authMiddleware,
      zodValidatorMiddleware(DeleteCollectionDto, "Params"),
      this.controller.delete
    );

    // --- get single collection (catch-all, must be last) ---
    this.router.get(
      `${this.path}/:slug`,
      zodValidatorMiddleware(FindCollectionDto, "Params"),
      this.controller.getCollection
    );
  }
}
