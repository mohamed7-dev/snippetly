import type { Request, Response } from "express";
import { FriendshipService } from "./friendship.service";
import { StatusCodes } from "http-status-codes";
import { InternalServerError } from "../../common/lib/exception";
import {
  AcceptFriendshipRequestResDto,
  ManageFriendshipRequestParamDtoType,
  RejectFriendshipRequestResDto,
  SendFriendshipRequestResDto,
  GetCurrentUserFriendsRequestQueryDtoType,
  GetCurrentUserFriendsResDto,
  GetCurrentUserInboxResDto,
  GetCurrentUserOutboxResDto,
} from "@snippetly/common/dto";

export class FriendshipController {
  private readonly FriendshipService: FriendshipService;

  constructor() {
    this.FriendshipService = new FriendshipService();
  }

  public getCurrentUserFriends = async (
    req: Request<
      object,
      object,
      object,
      GetCurrentUserFriendsRequestQueryDtoType
    >,
    res: Response
  ) => {
    const result = await this.FriendshipService.getCurrentUserFriends(
      req.context,
      req.validatedQuery
    );
    const rawResponse = {
      status: StatusCodes.OK,
      message: "Fetched successfully.",
      type: "success" as const,
      data: result,
    };
    const { data: parsedData, success } =
      GetCurrentUserFriendsResDto.safeParse(rawResponse);

    if (!success) {
      throw new InternalServerError();
    }
    res.status(parsedData.status).json(parsedData);
  };

  public getCurrentUserInbox = async (
    req: Request<
      object,
      object,
      object,
      GetCurrentUserFriendsRequestQueryDtoType
    >,
    res: Response
  ) => {
    const result = await this.FriendshipService.getCurrentUserInbox(
      req.context,
      req.validatedQuery
    );
    const rawResponse = {
      status: StatusCodes.OK,
      message: "Fetched successfully.",
      type: "success" as const,
      data: result,
    };
    const { data: parsedData, success } =
      GetCurrentUserInboxResDto.safeParse(rawResponse);

    if (!success) {
      throw new InternalServerError();
    }
    res.status(parsedData.status).json(parsedData);
  };

  public getCurrentUserOutbox = async (
    req: Request<
      object,
      object,
      object,
      GetCurrentUserFriendsRequestQueryDtoType
    >,
    res: Response
  ) => {
    const result = await this.FriendshipService.getCurrentUserOutbox(
      req.context,
      req.validatedQuery
    );
    const rawResponse = {
      status: StatusCodes.OK,
      message: "Fetched successfully.",
      type: "success" as const,
      data: result,
    };
    const { data: parsedData, success } =
      GetCurrentUserOutboxResDto.safeParse(rawResponse);

    if (!success) {
      throw new InternalServerError();
    }

    res.status(parsedData.status).json(parsedData);
  };

  public sendFriendshipRequest = async (
    req: Request<ManageFriendshipRequestParamDtoType>,
    res: Response
  ) => {
    const result = await this.FriendshipService.sendFriendshipRequest(
      req.context,
      req.params
    );
    if ("redirect" in result && result.redirect) {
      res.redirect(
        StatusCodes.TEMPORARY_REDIRECT,
        `/users/add-friend/${result.name}`
      );
    }
    const rawResponse = {
      type: "success",
      message: "Friendship request has been sent successfully.",
      status: StatusCodes.OK,
      data: result,
    };
    const { success, data: parsedData } =
      SendFriendshipRequestResDto.safeParse(rawResponse);
    if (!success) {
      throw new InternalServerError();
    }

    res.status(parsedData.status).json(parsedData);
  };

  public acceptFriendshipRequest = async (
    req: Request<ManageFriendshipRequestParamDtoType>,
    res: Response
  ) => {
    const result = await this.FriendshipService.acceptFriendshipRequest(
      req.context,
      req.params
    );
    if ("redirect" in result && result.redirect) {
      res.redirect(
        StatusCodes.TEMPORARY_REDIRECT,
        `/users/accept-friend/${result.name}`
      );
    }
    const rawResponse = {
      type: "success",
      message: "Friendship request has been accepted successfully.",
      status: StatusCodes.OK,
      data: result,
    };
    const { success, data: parsedData } =
      AcceptFriendshipRequestResDto.safeParse(rawResponse);

    if (!success) {
      throw new InternalServerError();
    }

    res.status(parsedData.status).json(parsedData);
  };

  public rejectFriendshipRequest = async (
    req: Request<ManageFriendshipRequestParamDtoType>,
    res: Response
  ) => {
    const result = await this.FriendshipService.rejectFriendshipRequest(
      req.context,
      req.params
    );
    if ("redirect" in result && result.redirect) {
      res.redirect(
        StatusCodes.TEMPORARY_REDIRECT,
        `/users/reject-friend/${result.name}`
      );
    }
    const rawResponse = {
      type: "success",
      message: "Friendship request has been rejected successfully.",
      status: StatusCodes.OK,
      data: result,
    };
    const { success, data: parsedData } =
      RejectFriendshipRequestResDto.safeParse(rawResponse);

    if (!success) {
      throw new InternalServerError();
    }

    res.status(parsedData.status).json(parsedData);
  };

  public cancelFriendshipRequest = async (
    req: Request<ManageFriendshipRequestParamDtoType>,
    res: Response
  ) => {
    const result = await this.FriendshipService.cancelFriendshipRequest(
      req.context,
      req.params
    );
    if ("redirect" in result && result.redirect) {
      res.redirect(
        StatusCodes.TEMPORARY_REDIRECT,
        `/users/cancel-friend/${result.name}`
      );
    }
    const rawResponse = {
      type: "success",
      message: "Friendship request has been cancelled successfully.",
      status: StatusCodes.OK,
      data: result,
    };
    const { success, data: parsedData } =
      RejectFriendshipRequestResDto.safeParse(rawResponse);

    if (!success) {
      throw new InternalServerError();
    }

    res.status(parsedData.status).json(parsedData);
  };
}
