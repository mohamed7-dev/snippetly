import { type Request, Router } from "express";
import { UserController } from "./user.controller";
import { authMiddleware } from "../../common/middlewares/auth.middleware";
import { zodValidatorMiddleware } from "../../common/middlewares/zod-validator.middleware";
import { UpdateUserDto } from "./dto/update-user.dto";
import { type Route } from "../../common/types/express";
import { ManageFriendshipDto } from "./dto/manage-friendship.dto";
import { GetCurrentUserFriendsDto } from "./dto/get-current-user-friends.dto";
import { DiscoverUsersDto } from "./dto/discover-users.dto";
import { GetUserDto } from "./dto/get-user.dto";
import { FriendshipController } from "./friendship.controller";
import multer, { type FileFilterCallback } from "multer";
import path from "path";
import { HttpException } from "../../common/lib/exception";
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
    // --- user PUT/DELETE ---
    this.router.put(
      `${this.path}`,
      authMiddleware,
      // this.configureMulter().single("image"), // deploying on vercel
      zodValidatorMiddleware(
        UpdateUserDto.omit({
          image: true,
          imageCustomId: true,
          imageKey: true,
        }),
        "Body"
      ),
      this.controller.update
    );
    this.router.delete(`${this.path}`, authMiddleware, this.controller.delete);

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

    // --- user GET (single param, last catch-all) ---
    this.router.get(
      `${this.path}/:name`,
      zodValidatorMiddleware(GetUserDto, "Params"),
      this.controller.getUserProfile
    );
  }

  // This would be used if we are not deploying
  // to vercel since vercel serverless functions doesn't support writing
  // to the file system
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
        cb(null, path.join(__dirname, "..", "..", "..", "public", "uploads")); // save locally in uploads/
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
