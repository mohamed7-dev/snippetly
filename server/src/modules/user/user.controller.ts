import type { Request, Response } from "express";
import { UserService } from "./user.service.ts";
import type { UpdateUserDtoType } from "./dto/update-user.dto.ts";
import { InternalServerError } from "../../common/lib/exception.ts";
import { AuthService } from "../auth/auth.service.ts";
import { StatusCodes } from "http-status-codes";
import type { GetUserDtoType } from "./dto/get-user.dto.ts";
import type { DiscoverUsersDtoType } from "./dto/discover-users.dto.ts";
import {
  GetCurrentUserProfileResDto,
  GetPublicUserProfileResDto,
  GetUserProfileResDto,
  UpdateUserResDto,
  GetCurrentUserDashboardDto,
  DiscoverUsersDto,
} from "./dto/user-response.dto.ts";
import { APP_URL } from "../../config/index.ts";

export class UserController {
  private readonly UserService: UserService;
  private readonly AuthService: AuthService;

  constructor() {
    this.UserService = new UserService();
    this.AuthService = new AuthService();
  }

  public update = async (
    req: Request<{}, {}, UpdateUserDtoType>,
    res: Response
  ) => {
    const updatedUser = await this.UserService.update(req.context, {
      ...req.body,
      image: req.file ? `${APP_URL}/uploads/${req.file.filename}` : undefined,
    });

    const { success, data: parsedData } =
      UpdateUserResDto.safeParse(updatedUser);
    if (!success) {
      throw new InternalServerError();
    }
    // i don't know if i am going to log the user out or not
    res.status(StatusCodes.OK).json({
      message: `User info has been updated successfully.`,
      data: parsedData,
    });
  };

  public delete = async (req: Request, res: Response) => {
    await this.AuthService.logout(req.context, res).then(async () => {
      await this.UserService.delete(req.context);
    });

    res.status(StatusCodes.OK).json({
      message: `User account has been deleted successfully, and session has been ended on the server.`,
      data: null,
    });
  };

  public getCurrentUserProfile = async (req: Request, res: Response) => {
    const foundUser = await this.UserService.getCurrentUserProfile(req.context);
    const { success, data: parsedData } =
      GetCurrentUserProfileResDto.safeParse(foundUser);
    if (!success) {
      throw new InternalServerError();
    }
    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      data: parsedData,
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

  public getUserProfile = async (
    req: Request<GetUserDtoType>,
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
      let parsedData = null;
      if (isOwner) {
        // use owner dto
        const { success, data } = GetUserProfileResDto.safeParse(result);
        if (!success) {
          throw new InternalServerError();
        }
        parsedData = data;
      } else {
        // use public dto
        const { success, data } = GetPublicUserProfileResDto.safeParse(result);
        if (!success) {
          throw new InternalServerError();
        }
        parsedData = data;
      }
      res.status(StatusCodes.OK).json({
        message: "Fetched successfully.",
        data: parsedData,
      });
    }
  };
}
