import { Router } from "express";
import { TagController } from "./tag.controller.ts";

export class TagRoute {
  private readonly basePath = "/tags";
  public router: Router = Router();
  private readonly TagController = new TagController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.basePath}/popular`,
      this.TagController.getPopularTags
    );
  }
}
