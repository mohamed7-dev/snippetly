import { Router } from "express";
import { zodValidatorMiddleware } from "../../common/middlewares/zod-validator.middleware";
import { authMiddleware } from "../../common/middlewares/auth.middleware";
import type { Route } from "../../common/types/express";
import { CollectionController } from "./collection.controller";
import {
  CreateCollectionRequestDto,
  DeleteCollectionRequestParamDto,
  DiscoverCollectionsRequestQueryDto,
  ForkCollectionRequestParamDto,
  GetCollectionRequestParamDto,
  UpdateCollectionRequestBodyDto,
  UpdateCollectionRequestParamDto,
  GetUserCollectionsRequestParamDto,
  GetUserCollectionsRequestQueryDto,
} from "@snippetly/common/dto";

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
      zodValidatorMiddleware(CreateCollectionRequestDto, "Body"),
      this.controller.create
    );

    // --- static GET routes ---
    this.router.get(
      `${this.path}/discover`,
      zodValidatorMiddleware(DiscoverCollectionsRequestQueryDto, "Query"),
      this.controller.discover
    );
    this.router.get(
      `${this.path}/current`,
      authMiddleware,
      zodValidatorMiddleware(GetUserCollectionsRequestQueryDto, "Query"),
      this.controller.getCurrentUserCollections
    );

    // --- user collections (more specific than :slug) ---
    this.router.get(
      `${this.path}/user/:creatorName`,
      zodValidatorMiddleware(GetUserCollectionsRequestQueryDto, "Query"),
      zodValidatorMiddleware(GetUserCollectionsRequestParamDto, "Params"),
      this.controller.getUserCollections
    );

    // --- fork (longer param path, must be before :slug) ---
    this.router.put(
      `${this.path}/:slug/fork`,
      authMiddleware,
      zodValidatorMiddleware(ForkCollectionRequestParamDto, "Params"),
      this.controller.fork
    );

    // --- update/delete by slug ---
    this.router.put(
      `${this.path}/:slug`,
      authMiddleware,
      zodValidatorMiddleware(UpdateCollectionRequestParamDto, "Params"),
      zodValidatorMiddleware(UpdateCollectionRequestBodyDto, "Body"),
      this.controller.update
    );
    this.router.delete(
      `${this.path}/:slug`,
      authMiddleware,
      zodValidatorMiddleware(DeleteCollectionRequestParamDto, "Params"),
      this.controller.delete
    );

    // --- get single collection (catch-all, must be last) ---
    this.router.get(
      `${this.path}/:slug`,
      zodValidatorMiddleware(GetCollectionRequestParamDto, "Params"),
      this.controller.getCollection
    );
  }
}
