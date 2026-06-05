import {
  AcceptFriendshipRequestResDto,
  AcceptFriendshipRequestResDtoType,
  CancelFriendshipRequestResDto,
  CancelFriendshipRequestResDtoType,
  GetCurrentUserFriendsRequestQueryDtoType,
  GetCurrentUserFriendsResDto,
  GetCurrentUserFriendsResDtoType,
  GetCurrentUserInboxResDto,
  GetCurrentUserInboxResDtoType,
  GetCurrentUserOutboxResDto,
  GetCurrentUserOutboxResDtoType,
  ManageFriendshipRequestParamDtoType,
  RejectFriendshipRequestResDto,
  RejectFriendshipRequestResDtoType,
  SendFriendshipRequestResDto,
  SendFriendshipRequestResDtoType,
} from "@snippetly/common/dto";
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { InternalServerError } from "../../common/lib/exception";
import { FriendshipService } from "./friendship.service";

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
      type: "success",
      data: result,
    } satisfies GetCurrentUserFriendsResDtoType["success"];

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
    } satisfies GetCurrentUserInboxResDtoType["success"];

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
    } satisfies GetCurrentUserOutboxResDtoType["success"];
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
    if (!("redirect" in result)) {
      const rawResponse = {
        type: "success",
        message: "Friendship request has been sent successfully.",
        status: StatusCodes.OK,
        data: result,
      } satisfies SendFriendshipRequestResDtoType["success"];
      const { success, data: parsedData } =
        SendFriendshipRequestResDto.safeParse(rawResponse);
      if (!success) {
        throw new InternalServerError();
      }

      res.status(parsedData.status).json(parsedData);
    }
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
    if (!("redirect" in result)) {
      const rawResponse = {
        type: "success",
        message: "Friendship request has been accepted successfully.",
        status: StatusCodes.OK,
        data: result,
      } satisfies AcceptFriendshipRequestResDtoType["success"];
      const { success, data: parsedData } =
        AcceptFriendshipRequestResDto.safeParse(rawResponse);

      if (!success) {
        throw new InternalServerError();
      }

      res.status(parsedData.status).json(parsedData);
    }
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
    if (!("redirect" in result)) {
      const rawResponse = {
        type: "success",
        message: "Friendship request has been rejected successfully.",
        status: StatusCodes.OK,
        data: result,
      } satisfies RejectFriendshipRequestResDtoType["success"];
      const { success, data: parsedData } =
        RejectFriendshipRequestResDto.safeParse(rawResponse);

      if (!success) {
        throw new InternalServerError();
      }

      res.status(parsedData.status).json(parsedData);
    }
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

    if (!("redirect" in result)) {
      const rawResponse = {
        type: "success",
        message: "Friendship request has been cancelled successfully.",
        status: StatusCodes.OK,
        data: result,
      } satisfies CancelFriendshipRequestResDtoType["success"];
      const { success, data: parsedData } =
        CancelFriendshipRequestResDto.safeParse(rawResponse);

      if (!success) {
        throw new InternalServerError();
      }

      res.status(parsedData.status).json(parsedData);
    }
  };
}
