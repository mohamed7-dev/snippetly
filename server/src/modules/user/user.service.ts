import { StatusCodes } from "http-status-codes";
import { HttpException } from "../../common/lib/exception.ts";
import type { CreateUserDtoType } from "./dto/create-user.dto.ts";
import type { UpdateUserDtoType } from "./dto/update-user.dto.ts";
import { PasswordHashService } from "../auth/password-hash.service.ts";
import type { UpdateUserPasswordDtoType } from "./dto/update-password.dto.ts";
import { DEFAULT_FIND_USERS_LIMIT } from "./constants.ts";
import { handleCursorPagination } from "../../common/lib/utils.ts";
import { UserReadService } from "./user-read.service.ts";
import { UserRepository } from "./user.repository.ts";
import type { DiscoverUsersDtoType } from "./dto/discover-users.dto.ts";
import type { RequestContext } from "../../common/middlewares/request-context-middleware.ts";
import type { NonNullableFields } from "../../common/types/utils.ts";
import type { GetUserDtoType } from "./dto/get-user.dto.ts";
import type { Friendship, User } from "../../common/db/schema.ts";
import { utapi } from "../../config/uploadthing.ts";

export class UserService {
  private readonly PasswordHashService: PasswordHashService;
  private UserReadService: UserReadService;
  private UserRepository: UserRepository;

  constructor() {
    this.PasswordHashService = new PasswordHashService();
    this.UserReadService = new UserReadService();
    this.UserRepository = new UserRepository();
  }

  public async create(_ctx: RequestContext, input: CreateUserDtoType) {
    const { password, ...rest } = input;
    const foundUser = await this.UserReadService.findOneSlim("name", rest.name);

    if (foundUser) {
      throw new HttpException(
        StatusCodes.CONFLICT,
        "User account already exists."
      );
    }

    const hashedPassword = await this.PasswordHashService.hash(password);

    const [newUser] = await this.UserRepository.insert([
      {
        ...rest,
        password: hashedPassword,
      },
    ]);

    return newUser;
  }

  public async suggestUniqueNames(baseName: string) {
    const suggestions: string[] = [];
    const existingNames = new Set(
      (await this.UserReadService.findManySlim("name", `%${baseName}%`)).map(
        (u) => u.name.toLowerCase()
      )
    );

    // Try appending numbers
    for (let i = 1; suggestions.length < 3 && i <= 50; i++) {
      const candidate = `${baseName}${i}`;
      if (!existingNames.has(candidate.toLowerCase())) {
        suggestions.push(candidate);
      }
    }
    return suggestions;
  }

  public async update(
    ctx: NonNullableFields<RequestContext>,
    input: UpdateUserDtoType
  ) {
    let foundUser = await this.UserReadService.findOneSlim("id", ctx.user.id);

    if (!foundUser || ctx.user.id !== foundUser.id) {
      throw new HttpException(StatusCodes.NOT_FOUND, `User not found.`);
    }
    const { newPassword, currentPassword, ...rest } = input;
    if (newPassword && currentPassword) {
      await this.updatePassword(ctx, {
        currentPassword,
        newPassword,
        email: foundUser.email,
      });
    }

    const [updatedUser] = await this.UserRepository.update(ctx.user.id, {
      ...rest,
      // ...(input.name
      //   ? { oldNames: [...foundUser.oldNames, foundUser.name] }
      //   : {}),
    });

    return updatedUser;
  }

  public async updatePassword(
    ctx: RequestContext,
    input: UpdateUserPasswordDtoType
  ) {
    const loggedInUserEmail = ctx.user?.email;

    if (loggedInUserEmail && loggedInUserEmail !== input.email) {
      // if user is logged in and the input.email is not his email
      // then reject the request.
      throw new HttpException(StatusCodes.NOT_FOUND, "User account not found.");
    }

    const foundUser = await this.UserReadService.findOneSlim(
      "email",
      input.email
    );

    if (!foundUser) {
      throw new HttpException(StatusCodes.NOT_FOUND, "User account not found.");
    }

    if (input.currentPassword) {
      const isValid = await this.PasswordHashService.verify({
        plain: input.currentPassword,
        hashed: foundUser.password,
      });
      if (!isValid) {
        throw new HttpException(
          StatusCodes.NOT_FOUND,
          "User account not found."
        );
      }
    }

    const updatedUser = await this.UserRepository.update(foundUser.id, {
      password: await this.PasswordHashService.hash(input.newPassword),
    });

    return updatedUser;
  }

  public async delete(ctx: NonNullableFields<RequestContext>) {
    const foundUser = await this.UserReadService.findOneSlim("id", ctx.user.id);
    if (!foundUser || ctx.user.id !== foundUser.id) {
      throw new HttpException(StatusCodes.NOT_FOUND, `User account not found.`);
    }

    await Promise.all([
      await this.UserRepository.delete(foundUser.id),
      !!foundUser.imageKey && (await utapi.deleteFiles(foundUser.imageKey)),
    ]);

    return foundUser;
  }

  public async discoverUsers(ctx: RequestContext, input: DiscoverUsersDtoType) {
    const { limit } = input;
    const defaultLimit = limit ?? DEFAULT_FIND_USERS_LIMIT;

    const { data, total } = await this.UserReadService.discoverUsers({
      ...input,
      limit: defaultLimit,
      loggedInUserId: ctx.user?.id,
    });

    // filter out current user from results if logged in
    const filteredItems = ctx.user?.id
      ? data.filter((user) => user.id !== ctx.user?.id)
      : data;

    const { nextCursor, data: items } = handleCursorPagination({
      data: filteredItems,
      limit: defaultLimit,
    });

    return {
      items,
      nextCursor: nextCursor
        ? ({
            snippetsCount: nextCursor.snippetsCount,
            id: nextCursor.id,
          } satisfies DiscoverUsersDtoType["cursor"])
        : null,
      total: data.length < filteredItems.length ? total - 1 : total,
    };
  }

  public async getCurrentUserProfile(ctx: NonNullableFields<RequestContext>) {
    const foundUser = await this.UserReadService.findOneSlim("id", ctx.user.id);
    const data = await this.getUserProfile(ctx, { user: foundUser });

    if (data.profile?.id !== ctx.user.id) {
      throw new HttpException(StatusCodes.NOT_FOUND, "User account not found.");
    }
    return data;
  }

  public async getCurrentUserDashboard(ctx: NonNullableFields<RequestContext>) {
    const foundUser = await this.UserReadService.getUserForDashboard({
      userId: ctx.user.id,
    });

    if (!foundUser) {
      throw new HttpException(StatusCodes.NOT_FOUND, "User not found.");
    }

    const [stats] = await this.UserReadService.getUserActivityStats({
      userId: foundUser.id!,
    });

    return {
      user: foundUser,
      stats,
    };
  }

  public async getUserProfile(
    ctx: RequestContext,
    input: Partial<GetUserDtoType> & { user?: User }
  ) {
    const { name, user } = input;
    const checkUserExists = user ? false : true;

    let foundUser = !checkUserExists ? user : null;

    if (checkUserExists && name) {
      foundUser = await this.UserReadService.findOneSlim("name", name);
      if (!foundUser) {
        // search for that name in old names array
        const foundUserWithOldName =
          await this.UserReadService.findOneByOldNames(name);

        if (!foundUserWithOldName) {
          throw new HttpException(StatusCodes.NOT_FOUND, "User not found.");
        }
        return { redirect: true, name: foundUserWithOldName.name };
      }
    }

    if (!foundUser) {
      throw new HttpException(StatusCodes.NOT_FOUND, "User not found.");
    }

    const isCurrentUserOwner = ctx.user?.id === foundUser.id;
    const userProfile = await this.UserReadService.getUserProfile(
      foundUser.id,
      isCurrentUserOwner,
      ctx.user?.id
    );

    const isCurrentUserAFriend =
      (userProfile?.friendshipsReceived?.length ?? 0) > 0 ||
      (userProfile?.friendshipsRequested?.length ?? 0) > 0;

    let requestStatus = null;
    if (
      (userProfile?.friendshipsRequested?.length ?? 0 > 0) ||
      (userProfile?.friendshipsReceived?.length ?? 0 > 0)
    ) {
      requestStatus =
        userProfile?.friendshipsRequested?.[0]?.status ??
        userProfile?.friendshipsReceived?.[0]?.status;
    }

    if (!userProfile) {
      throw new HttpException(StatusCodes.NOT_FOUND, "User account not found.");
    }

    const [stats] = await this.UserReadService.getUserActivityStats({
      userId: foundUser.id,
    });

    return {
      profile: userProfile,
      friendshipInfo: {
        isCurrentUserAFriend,
        ...(requestStatus && { requestStatus }),
      },
      stats,
    };
  }
}
