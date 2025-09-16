import { StatusCodes } from "http-status-codes";
import { HttpException } from "../../common/lib/exception";
import { CreateUserDtoType } from "./dto/create-user.dto";
import { UpdateUserDtoType } from "./dto/update-user.dto";
import { PasswordHashService } from "../auth/password-hash.service";
import { UpdateUserPasswordDtoType } from "./dto/update-password.dto";
import { DEFAULT_FIND_USERS_LIMIT } from "./constants";
import { handleCursorPagination } from "../../common/lib/utils";
import { UserReadService } from "./user-read.service";
import { UserRepository } from "./user.repository";
import { DeleteUserDtoType } from "./dto/delete-user.dto";
import { DiscoverUsersDtoType } from "./dto/discover-users.dto";
import { RequestContext } from "../../common/middlewares/request-context-middleware";
import { NonNullableFields } from "../../common/types/utils";
import { GetUserDtoType } from "./dto/get-user.dto";

export class UserService {
  private readonly PasswordHashService: PasswordHashService;
  private UserReadService: UserReadService;
  private UserRepository: UserRepository;

  constructor() {
    this.PasswordHashService = new PasswordHashService();
    this.UserReadService = new UserReadService();
    this.UserRepository = new UserRepository();
  }

  // Done
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

  // Done
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

  // Done
  public async update(
    ctx: NonNullableFields<RequestContext>,
    input: UpdateUserDtoType
  ) {
    const { data, name } = input;

    if ("password" in data) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Password can't be updated."
      );
    }

    const foundUser = await this.UserReadService.findOneSlim("name", name);

    if (!foundUser || ctx.user.id !== foundUser.id) {
      throw new HttpException(
        StatusCodes.NOT_FOUND,
        `User with name ${name} is not found`
      );
    }

    const [updatedUser] = await this.UserRepository.update(ctx.user.id, data);

    return updatedUser;
  }

  // Done
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

    const updatedUser = await this.UserRepository.update(foundUser.id, {
      password: await this.PasswordHashService.hash(input.password),
    });

    return updatedUser;
  }

  // Done
  public async delete(
    ctx: NonNullableFields<RequestContext>,
    input: DeleteUserDtoType
  ) {
    const name = input.name;

    const foundUser = await this.UserReadService.findOneSlim("name", name);

    if (!foundUser || ctx.user.id !== foundUser.id) {
      throw new HttpException(
        StatusCodes.NOT_FOUND,
        `User with name ${name} is not found`
      );
    }

    await this.UserRepository.delete(foundUser.id);

    return foundUser;
  }

  // Done
  public async discoverUsers(ctx: RequestContext, input: DiscoverUsersDtoType) {
    const { limit } = input;
    const defaultLimit = limit ?? DEFAULT_FIND_USERS_LIMIT;

    const { data, total } = await this.UserReadService.discoverUsers({
      ...input,
      limit: defaultLimit,
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

  // Done
  public async getCurrentUserProfile(ctx: NonNullableFields<RequestContext>) {
    const data = await this.getUserProfile(ctx, { name: ctx.user.name });
    if (data.profile.id !== ctx.user.id) {
      throw new HttpException(StatusCodes.NOT_FOUND, "User account not found.");
    }
    return data;
  }

  // Done
  public async getCurrentUserDashboard(ctx: NonNullableFields<RequestContext>) {
    const [foundUser] = await this.UserReadService.getUserForDashboard({
      userId: ctx.user.id,
    });

    if (!foundUser) {
      throw new HttpException(StatusCodes.NOT_FOUND, "User not found.");
    }

    const [stats] = await this.UserReadService.getUserActivityStats({
      userId: foundUser.id,
    });

    return {
      user: foundUser,
      stats,
    };
  }

  // Done
  public async getUserProfile(ctx: RequestContext, input: GetUserDtoType) {
    const { name } = input;
    const foundUser = await this.UserReadService.findOneSlim("name", name);
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

    if (!userProfile) {
      throw new HttpException(StatusCodes.NOT_FOUND, "User account not found.");
    }

    const [stats] = await this.UserReadService.getUserActivityStats({
      userId: foundUser.id,
    });

    return { profile: userProfile, isCurrentUserAFriend, stats };
  }
}
