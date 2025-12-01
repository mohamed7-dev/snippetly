import { type Request, type Response } from "express";
import { UserService } from "./user.service";
import { InternalServerError } from "../../common/lib/exception";
import { AuthService } from "../auth/auth.service";
import { StatusCodes } from "http-status-codes";

import {
  UpdateUserRequestDtoType,
  UpdateUserResponseDto,
  DeleteUserResponseDto,
  GetUserRequestDtoType,
  GetUserResponseDto,
  GetCurrentUserResponseDto,
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
      Omit<UpdateUserRequestDtoType, "image" | "imageCustomId" | "imageKey">
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
      type: "success" as const,
    };
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
      type: "success" as const,
    };

    const { success, data: parsedData } =
      DeleteUserResponseDto.safeParse(rawResponse);

    if (!success) {
      throw new InternalServerError();
    }

    res.status(parsedData.status).json(parsedData);
  };

  public discoverUsers = async (
    req: Request<{}, {}, {}, DiscoverUsersDtoType>,
    res: Response
  ) => {
    const data = await this.UserService.discoverUsers(
      req.context,
      req.validatedQuery as DiscoverUsersDtoType
    );
    const { success, data: parsedData } = DiscoverUsersDto.safeParse(
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

  public getCurrentUserDashboard = async (req: Request, res: Response) => {
    const dashboardInfo = await this.UserService.getCurrentUserDashboard(
      req.context
    );
    const { success, data: parsedData } = GetCurrentUserDashboardDto.safeParse({
      user: dashboardInfo.user,
      collections: dashboardInfo.user.collections,
      stats: dashboardInfo.stats,
    });
    if (!success) {
      throw new InternalServerError();
    }
    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      data: {
        profile: parsedData.user,
        recentCollections: parsedData.collections,
        stats: parsedData.stats,
      },
    });
  };

  public getCurrentUserProfile = async (req: Request, res: Response) => {
    const result = await this.UserService.getCurrentUserProfile(req.context);
    const rawResponse = {
      status: StatusCodes.OK,
      message: "Fetched successfully",
      data: result,
      type: "owner-success",
    };
    const { success, data: parsedData } =
      GetCurrentUserResponseDto.safeParse(rawResponse);

    if (!success) {
      throw new InternalServerError();
    }
    res.status(parsedData.status).json(parsedData);
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
      };
      // use owner dto
      const { success, data: parsedData } = GetUserResponseDto.safeParse({
        ...rawResponse,
        type: isOwner ? "owner-success" : "public-success",
      });

      if (!success) {
        throw new InternalServerError();
      }

      res.status(parsedData.status).json(parsedData);
    }
  };
}
