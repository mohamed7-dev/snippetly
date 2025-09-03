import { Request, Response } from "express";
import { UserService } from "./user.service";
import { StatusCodes } from "http-status-codes";
import { UpdateUserDtoType } from "./dto/update-user.dto";
import { DeleteUserDtoType } from "./dto/delete-user.dto";

export class UserController {
  private readonly UserService: UserService;

  constructor() {
    this.UserService = new UserService();
  }

  public update = async (
    req: Request<
      { name: Pick<UpdateUserDtoType, "name">["name"] },
      {},
      Omit<UpdateUserDtoType, "name">
    >,
    res: Response
  ) => {
    const updatedUser = await this.UserService.update({
      name: req.params.name,
      data: req.body.data,
      loggedInUserName: req.user.name,
    });

    res.status(StatusCodes.OK).json({
      message: "User info has been updated successfully.",
      data: updatedUser,
    });
  };

  public delete = async (
    req: Request<{ name: Pick<DeleteUserDtoType, "name">["name"] }>,
    res: Response
  ) => {
    await this.UserService.delete({
      name: req.params.name,
      loggedInUserName: req.user.name,
    });

    res.status(StatusCodes.OK).json({
      message: "User account has been deleted successfully.",
      data: null,
    });
  };

  public getCurrentUserProfile = async (req: Request, res: Response) => {
    const loggedInUserName = req.user.name;

    const userProfile = await this.UserService.getCurrentUser(loggedInUserName);

    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      data: userProfile,
    });
  };

  public getUserProfile = async (
    req: Request<{ name: string }>,
    res: Response
  ) => {
    const name = req.params.name;

    const userProfile = await this.UserService.getOne({ name });

    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      data: userProfile,
    });
  };

  public sendFriendshipRequest = async (
    req: Request<{ friend_name: string }>,
    res: Response
  ) => {
    const { friend_name } = req.params;
    const result = await this.UserService.sendFriendshipRequest({
      name: req.user.name,
      friendName: friend_name,
    });

    res.status(StatusCodes.OK).json({
      message: "Friendship request has been sent successfully.",
      data: result,
    });
  };

  public acceptFriendshipRequest = async (
    req: Request<{ friend_name: string }>,
    res: Response
  ) => {
    const { friend_name } = req.params;
    const result = await this.UserService.acceptFriendshipRequest({
      name: req.user.name,
      friendName: friend_name,
    });

    res.status(StatusCodes.OK).json({
      message: "Friendship request has been accepted successfully.",
      data: result,
    });
  };

  public rejectFriendshipRequest = async (
    req: Request<{ friend_name: string }>,
    res: Response
  ) => {
    const { friend_name } = req.params;
    const result = await this.UserService.rejectFriendshipRequest({
      name: req.user.name,
      friendName: friend_name,
    });

    res.status(StatusCodes.OK).json({
      message: "Friendship request has been rejected successfully.",
      data: result,
    });
  };
}
