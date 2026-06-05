import {
  CreateCollectionRequestDto,
  DeleteCollectionRequestParamDto,
  DiscoverCollectionsRequestQueryDto,
  ForkCollectionRequestParamDto,
  GetCollectionRequestParamDto,
  GetUserCollectionsRequestParamDto,
  GetUserCollectionsRequestQueryDto,
  UpdateCollectionRequestBodyDto,
  UpdateCollectionRequestParamDto,
} from "@snippetly/common/dto";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../../common/middlewares/auth.middleware";
import { zodValidatorMiddleware } from "../../common/middlewares/zod-validator.middleware";
import type { Route } from "../../common/types/express";
import { CollectionController } from "./collection.controller";

export class CollectionRoute implements Route {
  public path: string = "/collections";
  public router: Router = Router();
  public controller: CollectionController = new CollectionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const collectionWriteLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 50,
      standardHeaders: true,
      legacyHeaders: false,
    });

    const collectionReadLimiter = rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 120,
      standardHeaders: true,
      legacyHeaders: false,
    });

    // --- create ---
    this.router.post(
      `${this.path}`,
      collectionWriteLimiter,
      authMiddleware,
      zodValidatorMiddleware(CreateCollectionRequestDto, "Body"),
      this.controller.create,
    );

    // --- static GET routes ---
    this.router.get(
      `${this.path}/discover`,
      collectionReadLimiter,
      zodValidatorMiddleware(DiscoverCollectionsRequestQueryDto, "Query"),
      this.controller.discover,
    );
    this.router.get(
      `${this.path}/current`,
      collectionReadLimiter,
      authMiddleware,
      zodValidatorMiddleware(GetUserCollectionsRequestQueryDto, "Query"),
      this.controller.getCurrentUserCollections,
    );

    // --- user collections (more specific than :slug) ---
    this.router.get(
      `${this.path}/user/:creatorName`,
      collectionReadLimiter,
      zodValidatorMiddleware(GetUserCollectionsRequestQueryDto, "Query"),
      zodValidatorMiddleware(GetUserCollectionsRequestParamDto, "Params"),
      this.controller.getUserCollections,
    );

    // --- fork (longer param path, must be before :slug) ---
    this.router.put(
      `${this.path}/:slug/fork`,
      collectionWriteLimiter,
      authMiddleware,
      zodValidatorMiddleware(ForkCollectionRequestParamDto, "Params"),
      this.controller.fork,
    );

    // --- update/delete by slug ---
    this.router.patch(
      `${this.path}/:slug`,
      collectionWriteLimiter,
      authMiddleware,
      zodValidatorMiddleware(UpdateCollectionRequestParamDto, "Params"),
      zodValidatorMiddleware(UpdateCollectionRequestBodyDto, "Body"),
      this.controller.update,
    );
    this.router.delete(
      `${this.path}/:slug`,
      collectionWriteLimiter,
      authMiddleware,
      zodValidatorMiddleware(DeleteCollectionRequestParamDto, "Params"),
      this.controller.delete,
    );

    // --- get single collection (catch-all, must be last) ---
    this.router.get(
      `${this.path}/:slug`,
      collectionReadLimiter,
      zodValidatorMiddleware(GetCollectionRequestParamDto, "Params"),
      this.controller.getCollection,
    );
  }
}
