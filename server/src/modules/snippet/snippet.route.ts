import { Router } from "express";
import { zodValidatorMiddleware } from "../../common/middlewares/zod-validator.middleware";
import { authMiddleware } from "../../common/middlewares/auth.middleware";
import { SnippetController } from "./snippet.controller";
import { CreateSnippetDto } from "./dto/create-snippet.dto";
import { UpdateSnippetDto } from "./dto/update-snippet.dto";
import { Route } from "../../common/types/express";

export class SnippetRoute implements Route {
  public path: string = "/snippets";
  public router: Router = Router();
  public controller: SnippetController = new SnippetController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/`,
      authMiddleware,
      zodValidatorMiddleware(CreateSnippetDto),
      this.controller.create
    );
    this.router.delete(
      `${this.path}/:slug`,
      authMiddleware,
      this.controller.delete
    );
    this.router.put(
      `${this.path}/:slug`,
      authMiddleware,
      zodValidatorMiddleware(UpdateSnippetDto.omit({ slug: true })),
      this.controller.update
    );
    this.router.get(
      `${this.path}/:name/friends`,
      authMiddleware,
      this.controller.getUserFriendsSnippets
    );
    this.router.get(`${this.path}/:name`, this.controller.getUserSnippets);
  }
}
