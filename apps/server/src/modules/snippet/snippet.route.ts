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
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../../common/middlewares/auth.middleware";
import { zodValidatorMiddleware } from "../../common/middlewares/zod-validator.middleware";
import { type Route } from "../../common/types/express";
import { SnippetController } from "./snippet.controller";

export class SnippetRoute implements Route {
  public path: string = "/snippets";
  public router: Router = Router();
  public controller: SnippetController = new SnippetController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const snippetWriteLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 50,
      standardHeaders: true,
      legacyHeaders: false,
    });

    const snippetReadLimiter = rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 120,
      standardHeaders: true,
      legacyHeaders: false,
    });

    // Create first (no conflict)
    this.router.post(
      `${this.path}/`,
      snippetWriteLimiter,
      authMiddleware,
      zodValidatorMiddleware(CreateSnippetRequestDto, "Body"),
      this.controller.create,
    );

    // Collection-based (static prefix wins over :slug)
    this.router.get(
      `${this.path}/collection/:collection`,
      snippetReadLimiter,
      zodValidatorMiddleware(GetCollectionSnippetsRequestQueryDto, "Query"),
      zodValidatorMiddleware(GetCollectionSnippetsRequestParamDto, "Params"),
      this.controller.getSnippetsByCollection,
    );

    // Discover (must come before :slug)
    this.router.get(
      `${this.path}/discover`,
      snippetReadLimiter,
      zodValidatorMiddleware(DiscoverSnippetsRequestQueryDto, "Query"),
      this.controller.discover,
    );

    // User-specific (static "current" must come before :name)
    this.router.get(
      `${this.path}/user/current/friends`,
      snippetReadLimiter,
      authMiddleware,
      zodValidatorMiddleware(GetUserSnippetsRequestQueryDto, "Query"),
      this.controller.getCurrentUserFriendsSnippets,
    );

    this.router.get(
      `${this.path}/user/current`,
      snippetReadLimiter,
      authMiddleware,
      zodValidatorMiddleware(GetUserSnippetsRequestQueryDto, "Query"),
      this.controller.getCurrentUserSnippets,
    );

    // User by name (friends first, then generic :name)
    this.router.get(
      `${this.path}/user/:name/friends`,
      snippetReadLimiter,
      authMiddleware,
      zodValidatorMiddleware(GetUserSnippetsRequestQueryDto, "Query"),
      zodValidatorMiddleware(GetUserSnippetsRequestParamDto, "Params"),
      this.controller.getUserFriendsSnippets,
    );

    this.router.get(
      `${this.path}/user/:creatorName`,
      snippetReadLimiter,
      zodValidatorMiddleware(GetUserSnippetsRequestQueryDto, "Query"),
      zodValidatorMiddleware(GetUserSnippetsRequestParamDto, "Params"),
      this.controller.getUserSnippets,
    );

    // Fork/update/delete (explicit :slug variants before generic :slug GET)
    this.router.put(
      `${this.path}/:slug/fork`,
      snippetWriteLimiter,
      authMiddleware,
      zodValidatorMiddleware(ForkSnippetRequestParamDto, "Params"),
      zodValidatorMiddleware(ForkSnippetRequestBodyDto, "Body"),
      this.controller.fork,
    );

    this.router.patch(
      `${this.path}/:slug`,
      snippetWriteLimiter,
      authMiddleware,
      zodValidatorMiddleware(UpdateSnippetRequestParamDto, "Params"),
      zodValidatorMiddleware(UpdateSnippetRequestBodyDto, "Body"),
      this.controller.update,
    );

    this.router.delete(
      `${this.path}/:slug`,
      snippetWriteLimiter,
      authMiddleware,
      zodValidatorMiddleware(DeleteSnippetRequestParamDto, "Params"),
      this.controller.delete,
    );

    // Finally — the most generic :slug GET
    this.router.get(
      `${this.path}/:slug`,
      snippetReadLimiter,
      zodValidatorMiddleware(GetSnippetRequestParamDto, "Params"),
      this.controller.getSnippet,
    );
  }
}
