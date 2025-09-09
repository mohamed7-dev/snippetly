import { Router } from "express";
import { zodValidatorMiddleware } from "../../common/middlewares/zod-validator.middleware";
import { authMiddleware } from "../../common/middlewares/auth.middleware";
import { SnippetController } from "./snippet.controller";
import { CreateSnippetDto } from "./dto/create-snippet.dto";
import { UpdateSnippetDto } from "./dto/update-snippet.dto";
import { Route } from "../../common/types/express";
import { DeleteSnippetDto } from "./dto/delete-snippet.dto";
import { GetUserSnippetsDto } from "./dto/get-user-snippets.dto";
import { ForkSnippetDto } from "./dto/fork-snippet.dto";
import { GetSnippetDto } from "./dto/get-snippet.dto";

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
      zodValidatorMiddleware(CreateSnippetDto, "Body"),
      this.controller.create
    );
    this.router.delete(
      `${this.path}/:slug`,
      authMiddleware,
      zodValidatorMiddleware(DeleteSnippetDto, "Params"),
      this.controller.delete
    );
    this.router.put(
      `${this.path}/:slug/fork`,
      authMiddleware,
      zodValidatorMiddleware(ForkSnippetDto.pick({ slug: true }), "Params"),
      zodValidatorMiddleware(ForkSnippetDto.omit({ slug: true }), "Body"),
      this.controller.fork
    );
    this.router.put(
      `${this.path}/:slug`,
      authMiddleware,
      zodValidatorMiddleware(UpdateSnippetDto.pick({ slug: true }), "Params"),
      zodValidatorMiddleware(UpdateSnippetDto.shape.data, "Body"),
      this.controller.update
    );
    this.router.get(
      `${this.path}/:slug`,
      zodValidatorMiddleware(GetSnippetDto, "Params"),
      this.controller.getSnippet
    );
    this.router.get(
      `${this.path}/user/current`,
      authMiddleware,
      zodValidatorMiddleware(GetUserSnippetsDto.omit({ name: true }), "Query"),
      this.controller.getCurrentUserSnippets
    );
    this.router.get(
      `${this.path}/user/:name/friends`,
      authMiddleware,
      zodValidatorMiddleware(GetUserSnippetsDto.omit({ name: true }), "Query"),
      zodValidatorMiddleware(GetUserSnippetsDto.pick({ name: true }), "Params"),
      this.controller.getUserFriendsSnippets as any
    );
    this.router.get(
      `${this.path}/user/:name`,
      zodValidatorMiddleware(GetUserSnippetsDto.omit({ name: true }), "Query"),
      zodValidatorMiddleware(GetUserSnippetsDto.pick({ name: true }), "Params"),
      this.controller.getUserSnippets as any
    );
  }
}
