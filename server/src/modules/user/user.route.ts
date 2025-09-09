import { Router } from "express";
import { UserController } from "./user.controller";
import { authMiddleware } from "../../common/middlewares/auth.middleware";
import { zodValidatorMiddleware } from "../../common/middlewares/zod-validator.middleware";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Route } from "../../common/types/express";
import { DeleteUserParamDto } from "./dto/delete-user.dto";
import { GetOneParamDto } from "./dto/get-one.dto";
import { FriendshipParamDto } from "./dto/friendship.dto";

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
      zodValidatorMiddleware(UpdateUserDto.shape.data, "Body"),
      zodValidatorMiddleware(UpdateUserDto.pick({ name: true }), "Params"),
      this.controller.update
    );
    this.router.delete(
      `${this.path}/:name`,
      authMiddleware,
      zodValidatorMiddleware(DeleteUserParamDto, "Params"),
      this.controller.delete
    );
    this.router.put(
      `${this.path}/add-friend/:friend_name`,
      authMiddleware,
      zodValidatorMiddleware(FriendshipParamDto, "Params"),
      this.controller.sendFriendshipRequest
    );
    this.router.put(
      `${this.path}/accept-friend/:friend_name`,
      authMiddleware,
      zodValidatorMiddleware(FriendshipParamDto, "Params"),
      this.controller.acceptFriendshipRequest
    );
    this.router.put(
      `${this.path}/reject-friend/:friend_name`,
      authMiddleware,
      zodValidatorMiddleware(FriendshipParamDto, "Params"),
      this.controller.rejectFriendshipRequest
    );
    this.router.get(
      `${this.path}/current`,
      authMiddleware,
      this.controller.getCurrentUserProfile
    );
    this.router.get(
      `${this.path}/current/dashboard`,
      authMiddleware,
      this.controller.getCurrentUserDashboard
    );
    this.router.get(
      `${this.path}/:name`,
      zodValidatorMiddleware(GetOneParamDto, "Params"),
      this.controller.getUserProfile
    );
  }
}
