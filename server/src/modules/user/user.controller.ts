import { Request, Response } from "express";
import { UserService } from "./user.service";
import { UpdateUserDtoType } from "./dto/update-user.dto";
import { InternalServerError } from "../../common/lib/exception";
import { AuthService } from "../auth/auth.service";
import { StatusCodes } from "http-status-codes";
import { DeleteUserDtoType } from "./dto/delete-user.dto";
import { GetCurrentUserFriendsDtoType } from "./dto/get-current-user-friends.dto";
import { GetUserDtoType } from "./dto/get-user.dto";
import { ManageFriendshipDtoType } from "./dto/manage-friendship.dto";
import { DiscoverUsersDtoType } from "./dto/discover-users.dto";

export class UserController {
  private readonly UserService: UserService;
  private readonly AuthService: AuthService;

  constructor() {
    this.UserService = new UserService();
    this.AuthService = new AuthService();
  }

  public update = async (
    req: Request<
      Pick<UpdateUserDtoType, "name">,
      {},
      UpdateUserDtoType["data"]
    >,
    res: Response
  ) => {
    const updatedUser = await this.UserService.update(req.context, {
      data: req.body,
      name: req.params.name,
    });
    // i don't know if i am going to log the user out or not
    res.status(StatusCodes.OK).json({
      message: `User info has been updated successfully.`,
      data: updatedUser,
    });
  };

  public delete = async (req: Request<DeleteUserDtoType>, res: Response) => {
    await this.AuthService.logout(req.context, res).then(async () => {
      return await this.UserService.delete(req.context, req.params);
    });

    res.status(StatusCodes.OK).json({
      message: `User account has been deleted successfully, and session has been ended on the server.`,
      data: null,
    });
  };

  public getCurrentUserProfile = async (req: Request, res: Response) => {
    const foundUser = await this.UserService.getCurrentUserProfile(req.context);
    // delete the isCurrentUserFriend field
    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      data: foundUser,
    });
  };

  public discoverUsers = async (
    req: Request<{}, {}, {}, DiscoverUsersDtoType>,
    res: Response
  ) => {
    const data = await this.UserService.discoverUsers(
      req.context,
      req.validatedQuery as DiscoverUsersDtoType
    );

    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      ...data,
    });
  };

  public getCurrentUserDashboard = async (req: Request, res: Response) => {
    const dashboardInfo = await this.UserService.getCurrentUserDashboard(
      req.context
    );

    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      data: dashboardInfo.user,
      stats: dashboardInfo.stats,
    });
  };

  public getUserProfile = async (
    req: Request<GetUserDtoType>,
    res: Response
  ) => {
    const userProfileData = await this.UserService.getUserProfile(
      req.context,
      req.params
    );

    const isOwner = userProfileData.profile.id === req.context.user?.id;
    let parsedData = null;
    if (isOwner) {
      // use owner dto
    } else {
      // use public dto
    }

    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      data: {
        ...userProfileData.profile,
        isCurrentUserAFriend: userProfileData.isCurrentUserAFriend,
      },
      stats: userProfileData.stats,
    });
  };

  public throwServerError(): never {
    throw new InternalServerError();
  }
}
