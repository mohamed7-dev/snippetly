import { Request, Response } from "express";
import { UserService } from "./user.service";
import { UpdateUserDtoType } from "./dto/update-user.dto";
import {
  FriendshipResponseDto,
  GetCurrentUserDashboardResDto,
  GetCurrentUserDto,
  GetUserProfile,
  UserRes,
} from "./dto/response.dto";
import { InternalServerError } from "../../common/lib/exception";
import { AuthService } from "../auth/auth.service";
import { FriendshipParamDtoType } from "./dto/friendship.dto";
import { DeleteUserParamDtoType } from "./dto/delete-user.dto";
import { GetOneParamDtoType } from "./dto/get-one.dto";
import { StatusCodes } from "http-status-codes";

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
    const { success, data: parsedData } = UserRes.safeParse(updatedUser);
    if (!success) return this.throwServerError();
    await this.AuthService.logout(req.context, res);
    res.status(StatusCodes.OK).json({
      message: `User info has been updated successfully, you need to log back in to start new session.`,
      data: parsedData,
    });
  };

  public delete = async (
    req: Request<DeleteUserParamDtoType>,
    res: Response
  ) => {
    await this.AuthService.logout(req.context, res).then(async () => {
      return await this.UserService.delete(req.context, req.params);
    });

    res.status(StatusCodes.OK).json({
      message: `User account has been deleted successfully, and session has been ended on the server.`,
      data: null,
    });
  };

  public getCurrentUserProfile = async (req: Request, res: Response) => {
    const foundUser = await this.UserService.getCurrentUser(req.context);
    const { success, data: parsedData } =
      GetCurrentUserDto.safeParse(foundUser);
    if (!success) return this.throwServerError();

    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      data: parsedData,
    });
  };

  public getCurrentUserDashboard = async (req: Request, res: Response) => {
    const dashboardInfo = await this.UserService.getCurrentUserDashboard(
      req.context
    );
    const {
      success,
      data: parsedData,
      error,
    } = GetCurrentUserDashboardResDto.safeParse(dashboardInfo);
    if (!success) return this.throwServerError();

    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      data: parsedData,
    });
  };

  public getUserProfile = async (
    req: Request<GetOneParamDtoType>,
    res: Response
  ) => {
    const foundUser = await this.UserService.getOne(req.context, req.params);

    let parsedData = null;
    if (req.params.name === req.context.user?.name) {
      const { success, data } = GetCurrentUserDto.safeParse(foundUser);
      if (!success) return this.throwServerError();
      parsedData = data;
    } else {
      const { success, data: data } = GetUserProfile.safeParse(foundUser);
      if (!success) return this.throwServerError();
      parsedData = data;
    }

    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      data: parsedData,
    });
  };

  public sendFriendshipRequest = async (
    req: Request<FriendshipParamDtoType>,
    res: Response
  ) => {
    const data = await this.UserService.sendFriendshipRequest(
      req.context,
      req.params
    );

    const { success, data: parsedData } = FriendshipResponseDto.safeParse({
      user: data.updatedUser,
      friend: data.updatedFriend,
    });

    if (!success) return this.throwServerError();
    res.status(StatusCodes.OK).json({
      message: "Friendship request has been sent successfully.",
      data: parsedData,
    });
  };

  public acceptFriendshipRequest = async (
    req: Request<FriendshipParamDtoType>,
    res: Response
  ) => {
    const data = await this.UserService.acceptFriendshipRequest(
      req.context,
      req.params
    );
    const { success, data: parsedData } = FriendshipResponseDto.safeParse({
      user: data.updatedUser,
      friend: data.updatedFriend,
    });
    if (!success) return this.throwServerError();
    res.status(StatusCodes.OK).json({
      message: "Friendship request has been accepted successfully.",
      data: parsedData,
    });
  };

  public rejectFriendshipRequest = async (
    req: Request<FriendshipParamDtoType>,
    res: Response
  ) => {
    const data = await this.UserService.rejectFriendshipRequest(
      req.context,
      req.params
    );
    const { success, data: parsedData } = FriendshipResponseDto.safeParse({
      user: data.updatedUser,
      friend: data.updatedFriend,
    });
    if (!success) return this.throwServerError();

    res.status(StatusCodes.OK).json({
      message: "Friendship request has been rejected successfully.",
      data: parsedData,
    });
  };

  public throwServerError(): never {
    throw new InternalServerError();
  }
}
