import { Router } from "express";
import { zodValidatorMiddleware } from "../../common/middlewares/zod-validator.middleware";
import { authMiddleware } from "../../common/middlewares/auth.middleware";
import { SnippetController } from "./snippet.controller";
import { type Route } from "../../common/types/express";
import {
  CreateSnippetRequestDto,
  DeleteSnippetRequestParamDto,
  DiscoverSnippetsRequestQueryDto,
  ForkSnippetRequestBodyDto,
  ForkSnippetRequestParamDto,
  GetCollectionSnippetsRequestParamDto,
  GetCollectionSnippetsRequestQueryDto,
  GetSnippetRequestParamDto,
  GetUserSnippetsRequestParamDto,
  GetUserSnippetsRequestQueryDto,
  UpdateSnippetRequestBodyDto,
  UpdateSnippetRequestParamDto,
} from "@snippetly/common/dto";

export class SnippetRoute implements Route {
  public path: string = "/snippets";
  public router: Router = Router();
  public controller: SnippetController = new SnippetController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Create first (no conflict)
    this.router.post(
      `${this.path}/`,
      authMiddleware,
      zodValidatorMiddleware(CreateSnippetRequestDto, "Body"),
      this.controller.create
    );

    // Collection-based (static prefix wins over :slug)
    this.router.get(
      `${this.path}/collection/:collection`,
      zodValidatorMiddleware(GetCollectionSnippetsRequestQueryDto, "Query"),
      zodValidatorMiddleware(GetCollectionSnippetsRequestParamDto, "Params"),
      this.controller.getSnippetsByCollection
    );

    // Discover (must come before :slug)
    this.router.get(
      `${this.path}/discover`,
      zodValidatorMiddleware(DiscoverSnippetsRequestQueryDto, "Query"),
      this.controller.discover
    );

    // User-specific (static "current" must come before :name)
    this.router.get(
      `${this.path}/user/current/friends`,
      authMiddleware,
      zodValidatorMiddleware(GetUserSnippetsRequestQueryDto, "Query"),
      this.controller.getCurrentUserFriendsSnippets
    );

    this.router.get(
      `${this.path}/user/current`,
      authMiddleware,
      zodValidatorMiddleware(GetUserSnippetsRequestQueryDto, "Query"),
      this.controller.getCurrentUserSnippets
    );

    // User by name (friends first, then generic :name)
    this.router.get(
      `${this.path}/user/:name/friends`,
      authMiddleware,
      zodValidatorMiddleware(GetUserSnippetsRequestQueryDto, "Query"),
      zodValidatorMiddleware(GetUserSnippetsRequestParamDto, "Params"),
      this.controller.getUserFriendsSnippets
    );

    this.router.get(
      `${this.path}/user/:creatorName`,
      zodValidatorMiddleware(GetUserSnippetsRequestQueryDto, "Query"),
      zodValidatorMiddleware(GetUserSnippetsRequestParamDto, "Params"),
      this.controller.getUserSnippets
    );

    // Fork/update/delete (explicit :slug variants before generic :slug GET)
    this.router.put(
      `${this.path}/:slug/fork`,
      authMiddleware,
      zodValidatorMiddleware(ForkSnippetRequestParamDto, "Params"),
      zodValidatorMiddleware(ForkSnippetRequestBodyDto, "Body"),
      this.controller.fork
    );

    this.router.patch(
      `${this.path}/:slug`,
      authMiddleware,
      zodValidatorMiddleware(UpdateSnippetRequestParamDto, "Params"),
      zodValidatorMiddleware(UpdateSnippetRequestBodyDto, "Body"),
      this.controller.update
    );

    this.router.delete(
      `${this.path}/:slug`,
      authMiddleware,
      zodValidatorMiddleware(DeleteSnippetRequestParamDto, "Params"),
      this.controller.delete
    );

    // Finally — the most generic :slug GET
    this.router.get(
      `${this.path}/:slug`,
      zodValidatorMiddleware(GetSnippetRequestParamDto, "Params"),
      this.controller.getSnippet
    );
  }
}
