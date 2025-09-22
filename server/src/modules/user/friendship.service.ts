import { StatusCodes } from "http-status-codes";
import { HttpException } from "../../common/lib/exception.ts";
import { handleCursorPagination } from "../../common/lib/utils.ts";
import type { RequestContext } from "../../common/middlewares/request-context-middleware.ts";
import type { NonNullableFields } from "../../common/types/utils.ts";
import { DEFAULT_USERS_PENDING_FRIENDS_LIMIT } from "./constants.ts";
import type { GetCurrentUserFriendsDtoType } from "./dto/get-current-user-friends.dto.ts";
import type { ManageFriendshipDtoType } from "./dto/manage-friendship.dto.ts";
import { FriendshipReadService } from "./friendship-read.service.ts";
import { UserReadService } from "./user-read.service.ts";
import { FriendshipRepository } from "./friendship.repository.ts";

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

  public async sendFriendshipRequest(
    ctx: NonNullableFields<RequestContext>,
    input: ManageFriendshipDtoType
  ) {
    const { friend_name: friendName } = input;

    const { friend: addressee, user: requester } = await this.getFriendAndUser({
      friendName,
      loggedInUserId: ctx.user.id,
    });

    if (addressee && "redirect" in addressee) {
      return addressee;
    }

    if (!addressee || !requester || requester.id === addressee.id) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Invalid friendship request."
      );
    }

    const foundRequest =
      await this.FriendshipReadService.getFriendshipRequestInfo({
        requesterId: requester.id,
        addresseeId: addressee.id,
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
        requesterId: requester.id,
        addresseeId: addressee.id,
        status: "pending",
      },
    ]);

    return newFriendship;
  }

  public async acceptFriendshipRequest(
    ctx: NonNullableFields<RequestContext>,
    input: ManageFriendshipDtoType
  ) {
    const { friend_name: friendName } = input;
    const { friend: requester, user: addressee } = await this.getFriendAndUser({
      friendName,
      loggedInUserId: ctx.user.id,
    });

    if (addressee && "redirect" in addressee) {
      return addressee;
    }

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
        acceptedAt: new Date(),
      });

    return updatedFriendship;
  }

  public async rejectFriendshipRequest(
    ctx: NonNullableFields<RequestContext>,
    input: ManageFriendshipDtoType
  ) {
    const { friend_name: friendName } = input;

    const { friend: requester, user: addressee } = await this.getFriendAndUser({
      friendName,
      loggedInUserId: ctx.user.id,
    });
    if (addressee && "redirect" in addressee) {
      return addressee;
    }

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
    const [updatedFriendship] =
      await this.FriendshipRepository.updateFriendship(foundRequest.id, {
        status: "rejected",
        rejectedAt: new Date(),
      });

    return updatedFriendship;
  }

  public async cancelFriendshipRequest(
    ctx: NonNullableFields<RequestContext>,
    input: ManageFriendshipDtoType
  ) {
    const { friend_name: friendName } = input;

    const { friend: addressee, user: requester } = await this.getFriendAndUser({
      friendName,
      loggedInUserId: ctx.user.id,
    });
    if (addressee && "redirect" in addressee) {
      return addressee;
    }

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
    const [updatedFriendship] =
      await this.FriendshipRepository.updateFriendship(foundRequest.id, {
        status: "cancelled",
        cancelledAt: new Date(),
      });

    return updatedFriendship;
  }

  private async getFriendAndUser({
    friendName,
    loggedInUserId,
  }: {
    friendName: string;
    loggedInUserId: number;
  }) {
    const user = await this.UserReadService.findOneSlim("id", loggedInUserId);
    if (!user) {
      throw new HttpException(StatusCodes.NOT_FOUND, "User not found.");
    }
    const friend = await this.UserReadService.findOneSlim("name", friendName);
    if (!friend) {
      const foundUserWithOldName = await this.UserReadService.findOneByOldNames(
        friendName
      );
      if (!foundUserWithOldName) {
        throw new HttpException(StatusCodes.NOT_FOUND, "Friend not found.");
      }
      return { friend: { redirect: true, name: foundUserWithOldName.name } };
    }
    return { user, friend };
  }
}
