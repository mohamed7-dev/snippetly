import { Request, Response } from "express";
import { UserService } from "./user.service";
import { UpdateUserDtoType } from "./dto/update-user.dto";
import {
  FriendshipResponseDto,
  GetCurrentUserDto,
  GetUserProfile,
  UserRes,
} from "./dto/response.dto";
import { HttpException } from "../../common/lib/exception";
import { StatusCodes } from "http-status-codes";
import { AuthService } from "../auth/auth.service";

export class UserController {
  private readonly UserService: UserService;
  private readonly AuthService: AuthService;

  constructor() {
    this.UserService = new UserService();
    this.AuthService = new AuthService();
  }

  public update = async (
    req: Request<{ name: string }, {}, UpdateUserDtoType>,
    res: Response
  ) => {
    const { data, status, message } = await this.UserService.update(req);
    const { success, data: parsedData } = UserRes.safeParse(data);
    if (!success) return this.throwServerError();
    await this.AuthService.logout(req, res);
    res.status(status).json({
      message: `${message}, you need to log back in to start new session.`,
      data: parsedData,
    });
  };

  public delete = async (req: Request<{ name: string }>, res: Response) => {
    const { status, message, data } = await this.UserService.delete(req);
    await this.AuthService.logout(req, res);
    res.status(status).json({
      message: `${message}, you need to log back in to start new session.`,
      data,
    });
  };

  public getCurrentUserProfile = async (req: Request, res: Response) => {
    const { data, message, status } = await this.UserService.getCurrentUser(
      req
    );
    const { success, data: parsedData } = GetCurrentUserDto.safeParse(data);
    if (!success) return this.throwServerError();

    res.status(status).json({
      message,
      data: parsedData,
    });
  };

  public getUserProfile = async (
    req: Request<{ name: string }>,
    res: Response
  ) => {
    const {
      data: profileData,
      message,
      status,
    } = await this.UserService.getOne(req);
    let parsedData;
    if (req.params.name === req.user.name) {
      const { success, data } = GetCurrentUserDto.safeParse(profileData);
      if (!success) return this.throwServerError();
      parsedData = data;
    } else {
      const { success, data: data } = GetUserProfile.safeParse(profileData);
      if (!success) return this.throwServerError();
      parsedData = data;
    }
    res.status(status).json({
      message,
      data: parsedData,
    });
  };

  public sendFriendshipRequest = async (
    req: Request<{ friend_name: string }>,
    res: Response
  ) => {
    const { data, message, status } =
      await this.UserService.sendFriendshipRequest(req);
    const { success, data: parsedData } = FriendshipResponseDto.safeParse({
      user: data.updatedUser,
      friend: data.updatedFriend,
    });
    if (!success) return this.throwServerError();
    res.status(status).json({
      message,
      data: parsedData,
    });
  };

  public acceptFriendshipRequest = async (
    req: Request<{ friend_name: string }>,
    res: Response
  ) => {
    const { status, message, data } =
      await this.UserService.acceptFriendshipRequest(req);
    const { success, data: parsedData } = FriendshipResponseDto.safeParse({
      user: data.updatedUser,
      friend: data.updatedFriend,
    });
    if (!success) return this.throwServerError();
    res.status(status).json({
      message,
      data: parsedData,
    });
  };

  public rejectFriendshipRequest = async (
    req: Request<{ friend_name: string }>,
    res: Response
  ) => {
    const { status, message, data } =
      await this.UserService.rejectFriendshipRequest(req);
    const { success, data: parsedData } = FriendshipResponseDto.safeParse({
      user: data.updatedUser,
      friend: data.updatedFriend,
    });
    if (!success) return this.throwServerError();

    res.status(status).json({
      message,
      data: parsedData,
    });
  };

  public throwServerError(): never {
    throw new HttpException(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Oops, Something went wrong."
    );
  }
}
