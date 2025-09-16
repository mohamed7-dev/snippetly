import { StatusCodes } from "http-status-codes";
import { HttpException } from "../../common/lib/exception";
import { handleCursorPagination } from "../../common/lib/utils";
import { RequestContext } from "../../common/middlewares/request-context-middleware";
import { NonNullableFields } from "../../common/types/utils";
import { DEFAULT_USERS_PENDING_FRIENDS_LIMIT } from "./constants";
import { GetCurrentUserFriendsDtoType } from "./dto/get-current-user-friends.dto";
import { ManageFriendshipDtoType } from "./dto/manage-friendship.dto";
import { FriendshipReadService } from "./friendship-read.service";
import { UserReadService } from "./user-read.service";
import { FriendshipRepository } from "./friendship.repository";

export class FriendshipService {
  private UserReadService: UserReadService;
  private FriendshipRepository: FriendshipRepository;
  private readonly FriendshipReadService: FriendshipReadService;

  constructor() {
    this.UserReadService = new UserReadService();
    this.FriendshipReadService = new FriendshipReadService();
    this.FriendshipRepository = new FriendshipRepository();
  }

  public async getCurrentUserFriends(
    ctx: NonNullableFields<RequestContext>,
    input: GetCurrentUserFriendsDtoType
  ) {
    const { limit } = input;
    const defaultLimit = limit ?? DEFAULT_USERS_PENDING_FRIENDS_LIMIT;
    const { data, total } = await this.FriendshipReadService.getUserFriends({
      ...input,
      limit: defaultLimit,
      userId: ctx.user.id,
    });

    const { data: items, nextCursor } = handleCursorPagination({
      data,
      limit: defaultLimit,
    });

    return {
      items,
      nextCursor: nextCursor
        ? ({
            id: nextCursor.id,
          } satisfies GetCurrentUserFriendsDtoType["cursor"])
        : null,
      total,
    };
  }

  public async getCurrentUserInbox(
    ctx: NonNullableFields<RequestContext>,
    input: GetCurrentUserFriendsDtoType
  ) {
    const { limit } = input;
    const defaultLimit = limit ?? DEFAULT_USERS_PENDING_FRIENDS_LIMIT;

    const { data, total } = await this.FriendshipReadService.getUserInbox({
      ...input,
      limit: defaultLimit,
      userId: ctx.user.id,
    });

    const { data: items, nextCursor } = handleCursorPagination({
      data,
      limit: defaultLimit,
    });

    return {
      items,
      nextCursor: nextCursor
        ? ({
            id: nextCursor.id,
          } satisfies GetCurrentUserFriendsDtoType["cursor"])
        : null,
      total,
    };
  }

  public async getCurrentUserOutbox(
    ctx: NonNullableFields<RequestContext>,
    input: GetCurrentUserFriendsDtoType
  ) {
    const { limit } = input;
    const defaultLimit = limit ?? DEFAULT_USERS_PENDING_FRIENDS_LIMIT;

    const { data, total } = await this.FriendshipReadService.getUserOutbox({
      ...input,
      limit: defaultLimit,
      userId: ctx.user.id,
    });

    const { data: items, nextCursor } = handleCursorPagination({
      data,
      limit: defaultLimit,
    });

    return {
      items,
      nextCursor: nextCursor
        ? ({
            id: nextCursor.id,
          } satisfies GetCurrentUserFriendsDtoType["cursor"])
        : null,
      total,
    };
  }

  // Done
  public async sendFriendshipRequest(
    ctx: NonNullableFields<RequestContext>,
    input: ManageFriendshipDtoType
  ) {
    const { friend_name: friendName } = input;
    const loggedInUserName = ctx.user.name;

    // Note: name is the logged in user name
    const { friend: foundPotentialFriend, user: loggedInUser } =
      await this.getFriendAndUser({
        friendName,
        name: loggedInUserName,
      });

    if (
      !foundPotentialFriend ||
      !loggedInUser ||
      loggedInUser.id === foundPotentialFriend.id
    ) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Invalid friendship request."
      );
    }

    const foundRequest =
      await this.FriendshipReadService.getFriendshipRequestInfo({
        requesterId: loggedInUser.id,
        addresseeId: foundPotentialFriend.id,
      });

    // if the user already sent a request to the friend
    if (foundRequest) {
      throw new HttpException(
        StatusCodes.CONFLICT,
        `Friendship request has already been sent to the user ${friendName}`
      );
    }

    const [newFriendship] = await this.FriendshipRepository.insertFriendship([
      {
        requesterId: loggedInUser.id,
        addresseeId: foundPotentialFriend.id,
        status: "pending",
      },
    ]);

    return newFriendship;
  }

  // Done
  public async acceptFriendshipRequest(
    ctx: NonNullableFields<RequestContext>,
    input: ManageFriendshipDtoType
  ) {
    const { friend_name: friendName } = input;
    const loggedInUserName = ctx.user.name;
    const { friend: requester, user: addressee } = await this.getFriendAndUser({
      friendName,
      name: loggedInUserName,
    });

    if (!requester || !addressee || addressee.id === requester.id) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Invalid friendship acceptance request."
      );
    }

    const foundRequest =
      await this.FriendshipReadService.getFriendshipRequestInfo({
        requesterId: requester.id,
        addresseeId: addressee.id,
      });

    if (!foundRequest) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        `Invalid friendship acceptance request, ${requester.name} didn't send you a request.`
      );
    }

    const [updatedFriendship] =
      await this.FriendshipRepository.updateFriendship(foundRequest.id, {
        status: "accepted",
      });

    return updatedFriendship;
  }

  // Done
  public async rejectFriendshipRequest(
    ctx: NonNullableFields<RequestContext>,
    input: ManageFriendshipDtoType
  ) {
    const { friend_name: friendName } = input;
    const name = ctx.user.name;

    // Note: name is the logged in user name to whom the request was sent
    const { friend: requester, user: addressee } = await this.getFriendAndUser({
      friendName,
      name,
    });

    if (!addressee || !requester || requester.id === addressee.id) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Invalid friendship rejection request."
      );
    }

    const foundRequest =
      await this.FriendshipReadService.getFriendshipRequestInfo({
        requesterId: requester.id,
        addresseeId: addressee.id,
      });

    if (!foundRequest) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Invalid friendship rejection request."
      );
    }

    // if status is pending, then we need to mark request as rejected
    // may be later on the user accepts again, or to send a notification
    // TODO: set up cron job
    const updatedFriendship = await this.FriendshipRepository.updateFriendship(
      foundRequest.id,
      { status: "rejected" }
    );

    return updatedFriendship;
  }

  public async cancelFriendshipRequest(
    ctx: NonNullableFields<RequestContext>,
    input: ManageFriendshipDtoType
  ) {
    const { friend_name: friendName } = input;
    const name = ctx.user.name;

    // Note: requester is the only one who can cancel the request.
    const { friend: addressee, user: requester } = await this.getFriendAndUser({
      friendName,
      name,
    });

    if (!addressee || !requester || requester.id === addressee.id) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Invalid friendship rejection request."
      );
    }

    const foundRequest =
      await this.FriendshipReadService.getFriendshipRequestInfo({
        requesterId: requester.id,
        addresseeId: addressee.id,
      });

    if (!foundRequest) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Invalid friendship cancellation request."
      );
    }

    // if status is pending, then we need to mark request as rejected
    // may be later on the user accepts again, or to send a notification
    // TODO: set up cron job
    const updatedFriendship = await this.FriendshipRepository.updateFriendship(
      foundRequest.id,
      { status: "rejected" }
    );

    return updatedFriendship;
  }

  private async getFriendAndUser({
    friendName,
    name,
  }: {
    friendName: string;
    name: string;
  }) {
    const user = await this.UserReadService.findOneSlim("name", name);
    const friend = await this.UserReadService.findOneSlim("name", friendName);

    return { user, friend };
  }
}
