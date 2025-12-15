import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import { InternalServerError } from "../../common/lib/exception";
import { AuthService } from "../auth/auth.service";
import { UserService } from "./user.service";

import {
  DeleteUserResponseDto,
  DeleteUserResponseDtoType,
  DiscoverUsersRequestQueryDtoType,
  DiscoverUsersResponseDto,
  DiscoverUsersResponseDtoType,
  GetCurrentUserDashboardResDto,
  GetCurrentUserDashboardResDtoType,
  GetCurrentUserResponseDto,
  GetCurrentUserResponseDtoType,
  GetUserRequestDtoType,
  GetUserResponseDto,
  GetUserResponseDtoType,
  UpdateUserRequestDtoType,
  UpdateUserResponseDto,
  UpdateUserResponseDtoType,
} from "@snippetly/common/dto";

export class UserController {
  private readonly UserService: UserService;
  private readonly AuthService: AuthService;

  constructor() {
    this.UserService = new UserService();
    this.AuthService = new AuthService();
  }

  public update = async (
    req: Request<
      object,
      object,
      Omit<UpdateUserRequestDtoType, "image" | "imageKey">
    >,
    res: Response
  ) => {
    const result = await this.UserService.update(req.context, {
      ...req.body,
      // image: req.file ? `${APP_URL}/uploads/${req.file.filename}` : undefined, // deploying on vercel, uploadthing is used
    });

    const rawResponse = {
      status: StatusCodes.OK,
      message: `User info has been updated successfully.`,
      data: result,
      type: "success",
    } satisfies UpdateUserResponseDtoType["success"];

    const { success, data: parsedData } =
      UpdateUserResponseDto.safeParse(rawResponse);

    if (!success) {
      throw new InternalServerError();
    }
    // i don't know if i am going to log the user out or not
    res.status(parsedData.status).json(parsedData);
  };

  public delete = async (req: Request, res: Response) => {
    await this.AuthService.logout(req.context, res).then(async () => {
      await this.UserService.delete(req.context);
    });

    const rawResponse = {
      status: StatusCodes.OK,
      message: `User account has been deleted successfully, and session has been ended on the server.`,
      data: null,
      type: "success",
    } satisfies DeleteUserResponseDtoType["success"];

    const { success, data: parsedData } =
      DeleteUserResponseDto.safeParse(rawResponse);

    if (!success) {
      throw new InternalServerError();
    }

    res.status(parsedData.status).json(parsedData);
  };

  public discoverUsers = async (
    req: Request<object, object, object, DiscoverUsersRequestQueryDtoType>,
    res: Response
  ) => {
    const result = await this.UserService.discoverUsers(
      req.context,
      req.validatedQuery
    );

    const rawResponse = {
      status: StatusCodes.OK,
      message: "Fetched successfully.",
      data: result,
      type: "success",
    } satisfies DiscoverUsersResponseDtoType["success"];

    const { success, data: parsedData } =
      DiscoverUsersResponseDto.safeParse(rawResponse);

    if (!success) {
      throw new InternalServerError();
    }

    res.status(parsedData.status).json(parsedData);
  };

  public getCurrentUserDashboard = async (req: Request, res: Response) => {
    const result = await this.UserService.getCurrentUserDashboard(req.context);
    const rawResponse = {
      status: StatusCodes.OK,
      message: "Fetched successfully.",
      data: {
        user: result.user,
        collections: result.user.collections,
        stats: result.stats,
      },
      type: "success",
    } satisfies GetCurrentUserDashboardResDtoType["success"];

    const { success, data: parsedData } =
      GetCurrentUserDashboardResDto.safeParse(rawResponse);

    if (!success) {
      throw new InternalServerError();
    }
    res.status(parsedData.status).json(parsedData);
  };

  public getCurrentUserProfile = async (req: Request, res: Response) => {
    const result = await this.UserService.getCurrentUserProfile(req.context);
    if ("profile" in result && result.profile) {
      const rawResponse = {
        status: StatusCodes.OK,
        message: "Fetched successfully",
        data: result,
        type: "success",
      } satisfies GetCurrentUserResponseDtoType["success"];

      const { success, data: parsedData } =
        GetCurrentUserResponseDto.safeParse(rawResponse);
      if (!success) {
        throw new InternalServerError();
      }
      res.status(parsedData.status).json(parsedData);
    }
  };

  public getUserProfile = async (
    req: Request<GetUserRequestDtoType>,
    res: Response
  ) => {
    const result = await this.UserService.getUserProfile(
      req.context,
      req.params
    );

    if ("redirect" in result) {
      res.redirect(StatusCodes.TEMPORARY_REDIRECT, `/users/${result.name}`);
    } else {
      const isOwner = result.profile?.id === req.context.user?.id;
      const rawResponse = {
        status: StatusCodes.OK,
        message: "Fetched successfully",
        data: result,
        type: isOwner ? "owner-success" : "public-success",
      } satisfies GetUserResponseDtoType["success"];

      const {
        success,
        data: parsedData,
        error,
      } = GetUserResponseDto.safeParse({
        ...rawResponse,
      });
      if (!success) {
        throw new InternalServerError();
      }

      res.status(parsedData.status).json(parsedData);
    }
  };
}
