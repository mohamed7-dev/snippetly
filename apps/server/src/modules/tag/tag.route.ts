import { Router } from "express";
import rateLimit from "express-rate-limit";
import { TagController } from "./tag.controller";

export class TagRoute {
  private readonly basePath = "/tags";
  public router: Router = Router();
  private readonly TagController = new TagController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const tagReadLimiter = rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 120,
      standardHeaders: true,
      legacyHeaders: false,
    });

    this.router.get(
      `${this.basePath}/popular`,
      tagReadLimiter,
      this.TagController.getPopularTags,
    );
  }
}
