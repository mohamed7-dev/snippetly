import { Request, Response } from "express";
import { GetCurrentUserFriendsDtoType } from "./dto/get-current-user-friends.dto";
import { FriendshipService } from "./friendship.service";
import { StatusCodes } from "http-status-codes";
import { ManageFriendshipDtoType } from "./dto/manage-friendship.dto";

export class FriendshipController {
  private readonly FriendshipService: FriendshipService;

  constructor() {
    this.FriendshipService = new FriendshipService();
  }

  public getCurrentUserFriends = async (
    req: Request<{}, {}, {}, GetCurrentUserFriendsDtoType>,
    res: Response
  ) => {
    const data = await this.FriendshipService.getCurrentUserFriends(
      req.context,
      req.validatedQuery
    );

    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      ...data,
    });
  };

  public getCurrentUserInbox = async (
    req: Request<{}, {}, {}, GetCurrentUserFriendsDtoType>,
    res: Response
  ) => {
    const data = await this.FriendshipService.getCurrentUserInbox(
      req.context,
      req.validatedQuery
    );

    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      ...data,
    });
  };

  public getCurrentUserOutbox = async (
    req: Request<{}, {}, {}, GetCurrentUserFriendsDtoType>,
    res: Response
  ) => {
    const data = await this.FriendshipService.getCurrentUserOutbox(
      req.context,
      req.validatedQuery
    );

    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      ...data,
    });
  };

  public sendFriendshipRequest = async (
    req: Request<ManageFriendshipDtoType>,
    res: Response
  ) => {
    const data = await this.FriendshipService.sendFriendshipRequest(
      req.context,
      req.params
    );

    res.status(StatusCodes.OK).json({
      message: "Friendship request has been sent successfully.",
      data: data,
    });
  };

  public acceptFriendshipRequest = async (
    req: Request<ManageFriendshipDtoType>,
    res: Response
  ) => {
    const data = await this.FriendshipService.acceptFriendshipRequest(
      req.context,
      req.params
    );

    res.status(StatusCodes.OK).json({
      message: "Friendship request has been accepted successfully.",
      data: data,
    });
  };

  public rejectFriendshipRequest = async (
    req: Request<ManageFriendshipDtoType>,
    res: Response
  ) => {
    const data = await this.FriendshipService.rejectFriendshipRequest(
      req.context,
      req.params
    );

    res.status(StatusCodes.OK).json({
      message: "Friendship request has been rejected successfully.",
      data: data,
    });
  };

  public cancelFriendshipRequest = async (
    req: Request<ManageFriendshipDtoType>,
    res: Response
  ) => {
    const data = await this.FriendshipService.cancelFriendshipRequest(
      req.context,
      req.params
    );

    res.status(StatusCodes.OK).json({
      message: "Friendship request has been cancelled successfully.",
      data: data,
    });
  };
}
