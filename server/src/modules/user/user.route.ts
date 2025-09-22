import { type Request, Router } from "express";
import { UserController } from "./user.controller.ts";
import { authMiddleware } from "../../common/middlewares/auth.middleware.ts";
import { zodValidatorMiddleware } from "../../common/middlewares/zod-validator.middleware.ts";
import { UpdateUserDto } from "./dto/update-user.dto.ts";
import { type Route } from "../../common/types/express.ts";
import { ManageFriendshipDto } from "./dto/manage-friendship.dto.ts";
import { GetCurrentUserFriendsDto } from "./dto/get-current-user-friends.dto.ts";
import { DiscoverUsersDto } from "./dto/discover-users.dto.ts";
import { GetUserDto } from "./dto/get-user.dto.ts";
import { FriendshipController } from "./friendship.controller.ts";
import multer, { type FileFilterCallback } from "multer";
import path from "path";
import { HttpException } from "../../common/lib/exception.ts";
import { StatusCodes } from "http-status-codes";

export class UserRoute implements Route {
  public path: string = "/users";
  public router: Router = Router();
  public controller: UserController = new UserController();
  public FriendshipController: FriendshipController =
    new FriendshipController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // --- static GET routes (fixed names first) ---
    this.router.get(
      `${this.path}/discover`,
      authMiddleware,
      zodValidatorMiddleware(DiscoverUsersDto, "Query"),
      this.controller.discoverUsers as any
    );
    this.router.get(
      `${this.path}/current`,
      authMiddleware,
      this.controller.getCurrentUserProfile
    );
    this.router.get(
      `${this.path}/current/friends`,
      authMiddleware,
      zodValidatorMiddleware(GetCurrentUserFriendsDto, "Query"),
      this.FriendshipController.getCurrentUserFriends as any
    );
    this.router.get(
      `${this.path}/current/inbox`,
      authMiddleware,
      zodValidatorMiddleware(GetCurrentUserFriendsDto, "Query"),
      this.FriendshipController.getCurrentUserInbox as any
    );
    this.router.get(
      `${this.path}/current/outbox`,
      authMiddleware,
      zodValidatorMiddleware(GetCurrentUserFriendsDto, "Query"),
      this.FriendshipController.getCurrentUserOutbox as any
    );
    this.router.get(
      `${this.path}/current/dashboard`,
      authMiddleware,
      this.controller.getCurrentUserDashboard
    );

    // --- friendship PUT routes (longer param paths first) ---
    this.router.put(
      `${this.path}/add-friend/:friend_name`,
      authMiddleware,
      zodValidatorMiddleware(ManageFriendshipDto, "Params"),
      this.FriendshipController.sendFriendshipRequest
    );
    this.router.put(
      `${this.path}/accept-friend/:friend_name`,
      authMiddleware,
      zodValidatorMiddleware(ManageFriendshipDto, "Params"),
      this.FriendshipController.acceptFriendshipRequest
    );
    this.router.put(
      `${this.path}/reject-friend/:friend_name`,
      authMiddleware,
      zodValidatorMiddleware(ManageFriendshipDto, "Params"),
      this.FriendshipController.rejectFriendshipRequest
    );
    this.router.put(
      `${this.path}/cancel-friend/:friend_name`,
      authMiddleware,
      zodValidatorMiddleware(ManageFriendshipDto, "Params"),
      this.FriendshipController.cancelFriendshipRequest
    );

    // --- user PUT/DELETE (single param) ---
    this.router.put(
      `${this.path}`,
      authMiddleware,
      this.configureMulter().single("image"),
      zodValidatorMiddleware(UpdateUserDto, "Body"),
      this.controller.update
    );
    this.router.delete(`${this.path}`, authMiddleware, this.controller.delete);

    // --- user GET (single param, last catch-all) ---
    this.router.get(
      `${this.path}/:name`,
      zodValidatorMiddleware(GetUserDto, "Params"),
      this.controller.getUserProfile
    );
  }

  private configureMulter() {
    const fileFilter = (
      _req: Request,
      file: Express.Multer.File,
      cb: FileFilterCallback
    ) => {
      const allowedMimes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/svg+xml",
      ];

      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new HttpException(
            StatusCodes.BAD_REQUEST,
            "Invalid file type. Only JPG, JPEG, PNG, and SVG are allowed."
          )
        );
      }
    };
    const storage = multer.diskStorage({
      destination: (_req, _file, cb) => {
        // public is used here to server static assets from vercel
        cb(null, path.join(process.cwd(), "public", "uploads")); // save locally in uploads/
      },
      filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      },
    });
    return multer({
      storage,
      limits: { fileSize: 1 * 1024 * 1024 },
      fileFilter,
    });
  }
}
