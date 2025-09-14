import { Router } from "express";
import { UserController } from "./user.controller";
import { authMiddleware } from "../../common/middlewares/auth.middleware";
import { zodValidatorMiddleware } from "../../common/middlewares/zod-validator.middleware";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Route } from "../../common/types/express";
import { DeleteUserDto } from "./dto/delete-user.dto";
import { ManageFriendshipDto } from "./dto/manage-friendship.dto";
import { GetCurrentUserFriendsDto } from "./dto/get-current-user-friends.dto";
import { DiscoverUsersDto } from "./dto/discover-users.dto";
import { GetUserDto } from "./dto/get-user.dto";

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
      zodValidatorMiddleware(DeleteUserDto, "Params"),
      this.controller.delete
    );
    this.router.put(
      `${this.path}/add-friend/:friend_name`,
      authMiddleware,
      zodValidatorMiddleware(ManageFriendshipDto, "Params"),
      this.controller.sendFriendshipRequest
    );
    this.router.put(
      `${this.path}/accept-friend/:friend_name`,
      authMiddleware,
      zodValidatorMiddleware(ManageFriendshipDto, "Params"),
      this.controller.acceptFriendshipRequest
    );
    this.router.put(
      `${this.path}/reject-friend/:friend_name`,
      authMiddleware,
      zodValidatorMiddleware(ManageFriendshipDto, "Params"),
      this.controller.rejectFriendshipRequest
    );
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
      this.controller.getCurrentUserFriends as any
    );
    this.router.get(
      `${this.path}/current/inbox`,
      authMiddleware,
      zodValidatorMiddleware(GetCurrentUserFriendsDto, "Query"),
      this.controller.getCurrentUserInbox as any
    );
    this.router.get(
      `${this.path}/current/outbox`,
      authMiddleware,
      zodValidatorMiddleware(GetCurrentUserFriendsDto, "Query"),
      this.controller.getCurrentUserOutbox as any
    );
    this.router.get(
      `${this.path}/current/dashboard`,
      authMiddleware,
      this.controller.getCurrentUserDashboard
    );
    this.router.get(
      `${this.path}/:name`,
      zodValidatorMiddleware(GetUserDto, "Params"),
      this.controller.getUserProfile
    );
  }
}
