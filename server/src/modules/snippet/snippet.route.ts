import { Router } from "express";
import { zodValidatorMiddleware } from "../../common/middlewares/zod-validator.middleware.ts";
import { authMiddleware } from "../../common/middlewares/auth.middleware.ts";
import { SnippetController } from "./snippet.controller.ts";
import { CreateSnippetDto } from "./dto/create-snippet.dto.ts";
import { UpdateSnippetDto } from "./dto/update-snippet.dto.ts";
import { type Route } from "../../common/types/express.ts";
import { DeleteSnippetDto } from "./dto/delete-snippet.dto.ts";
import { GetUserSnippetsDto } from "./dto/get-user-snippets.dto.ts";
import { ForkSnippetDto } from "./dto/fork-snippet.dto.ts";
import { GetSnippetDto } from "./dto/get-snippet.dto.ts";
import { DiscoverSnippetsDto } from "./dto/discover-snippets.dto.ts";
import { GetCollectionSnippetsDto } from "./dto/get-collection-snippets.ts";

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
      zodValidatorMiddleware(CreateSnippetDto, "Body"),
      this.controller.create
    );

    // Collection-based (static prefix wins over :slug)
    this.router.get(
      `${this.path}/collection/:collection`,
      zodValidatorMiddleware(
        GetCollectionSnippetsDto.omit({ collection: true }),
        "Query"
      ),
      zodValidatorMiddleware(
        GetCollectionSnippetsDto.pick({ collection: true }),
        "Params"
      ),
      this.controller.getSnippetsByCollection
    );

    // Discover (must come before :slug)
    this.router.get(
      `${this.path}/discover`,
      zodValidatorMiddleware(DiscoverSnippetsDto, "Query"),
      this.controller.discover
    );

    // User-specific (static "current" must come before :name)
    this.router.get(
      `${this.path}/user/current/friends`,
      authMiddleware,
      zodValidatorMiddleware(
        GetUserSnippetsDto.omit({ creatorName: true }),
        "Query"
      ),
      this.controller.getCurrentUserFriendsSnippets as any
    );

    this.router.get(
      `${this.path}/user/current`,
      authMiddleware,
      zodValidatorMiddleware(
        GetUserSnippetsDto.omit({ creatorName: true }),
        "Query"
      ),
      this.controller.getCurrentUserSnippets as any
    );

    // User by name (friends first, then generic :name)
    this.router.get(
      `${this.path}/user/:name/friends`,
      authMiddleware,
      zodValidatorMiddleware(
        GetUserSnippetsDto.omit({ creatorName: true }),
        "Query"
      ),
      zodValidatorMiddleware(
        GetUserSnippetsDto.pick({ creatorName: true }),
        "Params"
      ),
      this.controller.getUserFriendsSnippets as any
    );

    this.router.get(
      `${this.path}/user/:creatorName`,
      zodValidatorMiddleware(
        GetUserSnippetsDto.omit({ creatorName: true }),
        "Query"
      ),
      zodValidatorMiddleware(
        GetUserSnippetsDto.pick({ creatorName: true }),
        "Params"
      ),
      this.controller.getUserSnippets as any
    );

    // Fork/update/delete (explicit :slug variants before generic :slug GET)
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

    this.router.delete(
      `${this.path}/:slug`,
      authMiddleware,
      zodValidatorMiddleware(DeleteSnippetDto, "Params"),
      this.controller.delete
    );

    // Finally — the most generic :slug GET
    this.router.get(
      `${this.path}/:slug`,
      zodValidatorMiddleware(GetSnippetDto, "Params"),
      this.controller.getSnippet
    );
  }
}
