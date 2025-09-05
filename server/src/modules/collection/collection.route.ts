import { Router } from "express";
import { zodValidatorMiddleware } from "../../common/middlewares/zod-validator.middleware";
import { authMiddleware } from "../../common/middlewares/auth.middleware";
import { CollectionController } from "./collection.controller";
import { CreateCollectionDto } from "./dto/create-collection.dto";
import { UpdateCollectionDto } from "./dto/update-collection.dto";
import { Route } from "../../common/types/express";

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
      zodValidatorMiddleware(CreateCollectionDto),
      this.controller.create
    );
    this.router.delete(
      `${this.path}/:code`,
      authMiddleware,
      this.controller.delete
    );
    this.router.put(
      `${this.path}/:code`,
      authMiddleware,
      zodValidatorMiddleware(UpdateCollectionDto.pick({ data: true })),
      this.controller.update
    );
  }
}
