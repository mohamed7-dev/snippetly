import type { Request, Response } from "express";
import type { GetCurrentUserFriendsDtoType } from "./dto/get-current-user-friends.dto.ts";
import { FriendshipService } from "./friendship.service.ts";
import { StatusCodes } from "http-status-codes";
import type { ManageFriendshipDtoType } from "./dto/manage-friendship.dto.ts";
import {
  AcceptRequestResDto,
  CancelRequestResDto,
  GetUserFriendsResDto,
  GetUserInboxResDto,
  GetUserOutboxResDto,
  RejectRequestResDto,
  SendRequestResDto,
} from "./dto/friendship-response.dto.ts";
import { InternalServerError } from "../../common/lib/exception.ts";

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
    const { data: parsedData, success } = GetUserFriendsResDto.safeParse(
      data.items
    );
    if (!success) {
      throw new InternalServerError();
    }
    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      ...data,
      items: parsedData,
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
    const { data: parsedData, success } = GetUserInboxResDto.safeParse(
      data.items
    );

    if (!success) {
      throw new InternalServerError();
    }

    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      ...data,
      items: parsedData,
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
    const { data: parsedData, success } = GetUserOutboxResDto.safeParse(
      data.items
    );

    if (!success) {
      throw new InternalServerError();
    }

    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      ...data,
      items: parsedData,
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
    if ("redirect" in data && data.redirect) {
      res.redirect(
        StatusCodes.TEMPORARY_REDIRECT,
        `/users/add-friend/${data.name}`
      );
    }
    const { success, data: parsedData } = SendRequestResDto.safeParse(data);
    if (!success) {
      throw new InternalServerError();
    }

    res.status(StatusCodes.OK).json({
      message: "Friendship request has been sent successfully.",
      data: parsedData,
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
    if ("redirect" in data && data.redirect) {
      res.redirect(
        StatusCodes.TEMPORARY_REDIRECT,
        `/users/accept-friend/${data.name}`
      );
    }
    const { success, data: parsedData } = AcceptRequestResDto.safeParse(data);

    if (!success) {
      throw new InternalServerError();
    }

    res.status(StatusCodes.OK).json({
      message: "Friendship request has been accepted successfully.",
      data: parsedData,
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
    if ("redirect" in data && data.redirect) {
      res.redirect(
        StatusCodes.TEMPORARY_REDIRECT,
        `/users/reject-friend/${data.name}`
      );
    }
    const { success, data: parsedData } = RejectRequestResDto.safeParse(data);

    if (!success) {
      throw new InternalServerError();
    }

    res.status(StatusCodes.OK).json({
      message: "Friendship request has been rejected successfully.",
      data: parsedData,
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
    if ("redirect" in data && data.redirect) {
      res.redirect(
        StatusCodes.TEMPORARY_REDIRECT,
        `/users/cancel-friend/${data.name}`
      );
    }
    const { success, data: parsedData } = CancelRequestResDto.safeParse(data);

    if (!success) {
      throw new InternalServerError();
    }

    res.status(StatusCodes.OK).json({
      message: "Friendship request has been cancelled successfully.",
      data: parsedData,
    });
  };
}
