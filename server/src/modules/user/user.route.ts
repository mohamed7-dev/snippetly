import { Router } from "express";
import { UserController } from "./user.controller";
import { authMiddleware } from "../../common/middlewares/auth.middleware";
import { zodValidatorMiddleware } from "../../common/middlewares/zod-validator.middleware";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Route } from "../../common/types/express";

export class UserRoute implements Route {
  public path: string = "/users";
  public router: Router = Router();
  public controller: UserController = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.put(
      `${this.path}/:name`,
      authMiddleware,
      zodValidatorMiddleware(UpdateUserDto.omit({ name: true })),
      this.controller.update
    );
    this.router.delete(
      `${this.path}/:name`,
      authMiddleware,
      this.controller.delete
    );
    this.router.put(
      `${this.path}/add-friend/:friend_name`,
      authMiddleware,
      this.controller.sendFriendshipRequest
    );
    this.router.put(
      `${this.path}/accept-friend/:friend_name`,
      authMiddleware,
      this.controller.acceptFriendshipRequest
    );
    this.router.put(
      `${this.path}/reject-friend/:friend_name`,
      authMiddleware,
      this.controller.rejectFriendshipRequest
    );
    this.router.get(
      `${this.path}/current-user`,
      authMiddleware,
      this.controller.getCurrentUserProfile
    );
    this.router.get(`${this.path}:name`, this.controller.getUserProfile);
  }
}
