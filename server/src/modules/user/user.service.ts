import { StatusCodes } from "http-status-codes";
import { HttpException } from "../../common/lib/exception";
import { IUser, User } from "./user.model";
import { CreateUserDtoType } from "./dto/create-user.dto";
import { UpdateUserDtoType } from "./dto/update-user.dto";
import { PasswordHashService } from "../auth/password-hash.service";
import { UpdateUserPasswordDtoType } from "./dto/update-password.dto";
import { FriendshipParamDtoType } from "./dto/friendship.dto";
import { DeleteUserParamDtoType } from "./dto/delete-user.dto";
import { RequestContext } from "../../common/middlewares";
import { GetOneParamDtoType } from "./dto/get-one.dto";
import { RootFilterQuery } from "mongoose";

export class UserService {
  private readonly PasswordHashService: PasswordHashService;
  constructor() {
    this.PasswordHashService = new PasswordHashService();
  }

  public async create(_ctx: RequestContext, input: CreateUserDtoType) {
    const { firstName, lastName, name, email, password } = input;
    const foundUser = await User.findOne({ name });

    if (foundUser) {
      throw new HttpException(
        StatusCodes.CONFLICT,
        "User account already exists."
      );
    }

    const hashedPassword = await this.PasswordHashService.hash(password);

    const newUser = await User.create({
      firstName,
      lastName,
      name,
      email,
      password: hashedPassword,
    });
    delete newUser.password;
    return newUser;
  }

  public async suggestUniqueNames(baseName: string) {
    const suggestions = [];
    const existingNames = new Set(
      (
        await User.find({ name: new RegExp(`^${baseName}`, "i") }).select(
          "name"
        )
      ).map((u) => u.name.toLowerCase())
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

  public async update(ctx: RequestContext, input: UpdateUserDtoType) {
    const { data, name } = input;

    if ("password" in data) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Password can't be updated."
      );
    }

    const loggedInUserName = ctx.user.name;

    if (loggedInUserName !== name) {
      throw new HttpException(StatusCodes.NOT_FOUND, "User not found.");
    }

    const updatedUser = await User.findOneAndUpdate({ name }, data, {
      new: true,
    }).select("-password");

    return updatedUser;
  }

  public async updatePassword(
    ctx: RequestContext,
    input: UpdateUserPasswordDtoType
  ) {
    const email = ctx.user?.email ?? input.email;

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { password: await this.PasswordHashService.hash(input.password) },
      {
        new: true,
      }
    ).select("-password");

    return {
      data: updatedUser,
      message: "Password has been updated successfully",
      status: StatusCodes.OK,
    };
  }

  public async updateUserFolders(
    {
      folderId,
      userId,
      operation,
    }: {
      folderId: string;
      userId: string;
      operation: "Pull" | "Push";
    },
    _ctx: RequestContext
  ) {
    const updatedUser = await User.findOneAndUpdate(
      { id: userId },
      {
        ...(operation === "Push" ? { $addToSet: { folders: folderId } } : null),
        ...(operation === "Pull" ? { $pull: { folders: folderId } } : null),
      },
      { new: true }
    );

    return updatedUser;
  }

  public async delete(ctx: RequestContext, input: DeleteUserParamDtoType) {
    const name = input.name;
    const loggedInUserName = ctx.user.name;

    const foundUser = await this.findOneQueryBuilder({ name });

    if (!foundUser || loggedInUserName !== name) {
      throw new HttpException(StatusCodes.NOT_FOUND, "User not found.");
    }

    const deletedUser = await User.findOneAndDelete({ name });

    // Pull the userId from all other users' friends arrays
    await User.updateMany(
      {
        $or: [
          { friends: deletedUser._id },
          { friendshipInbox: deletedUser._id },
          { friendshipOutbox: deletedUser._id },
        ],
      },
      {
        $pull: {
          friends: deletedUser._id,
          friendshipInbox: deletedUser._id,
          friendshipOutbox: deletedUser._id,
        },
      }
    );
    return foundUser;
  }

  public async getCurrentUser(ctx: RequestContext) {
    const profile = await this.getOne(ctx, { name: ctx.user.name });
    if (profile.id !== ctx.user.id) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You are not allowed to view this profile."
      );
    }
    return profile;
  }

  public async getCurrentUserDashboard(ctx: RequestContext) {
    const foundUser = await User.findOne({ name: ctx.user.name })
      .select("-password")
      .populate({
        path: "folders",
        select: "title code color id",
        match: { limit: 5 },
      })
      .lean();

    if (!foundUser) {
      throw new HttpException(StatusCodes.NOT_FOUND, "User not found.");
    }
    const { SnippetService } = await import("../snippet/snippet.service");
    const SnippetServiceInstance = new SnippetService();
    const { data: snippets, total } =
      await SnippetServiceInstance.getCurrentUserSnippets(ctx, {
        limit: 5,
      });

    const foldersCount = foundUser.folders.length;
    const friendsCount = foundUser.friends.length;
    const friendsInboxCount = foundUser.friendshipInbox.length;
    const friendsOutboxCount = foundUser.friendshipOutbox.length;
    const snippetsCount = total;

    return {
      ...foundUser,
      id: foundUser._id.toString(),
      foldersCount,
      friendsCount,
      friendsInboxCount,
      friendsOutboxCount,
      snippetsCount,
      snippets,
    };
  }

  public async getOne(_ctx: RequestContext, input: GetOneParamDtoType) {
    const foundUser = await User.findOne({ name: input.name })
      .select("-password")
      .populate("folders", "title code color id")
      .populate("friends", "firstName lastName name email id")
      .populate("friendshipInbox", "firstName lastName name email id")
      .populate("friendshipOutbox", "firstName lastName name email id")
      .exec();

    if (!foundUser) {
      throw new HttpException(StatusCodes.NOT_FOUND, "User not found.");
    }

    return foundUser;
  }

  public findOneQueryBuilder(filter: RootFilterQuery<IUser>) {
    return User.findOne(filter);
  }

  public async sendFriendshipRequest(
    ctx: RequestContext,
    input: FriendshipParamDtoType
  ) {
    const { friend_name: friendName } = input;
    const name = ctx.user.name;

    // Note: name is the logged in user name
    const { friend: foundPotentialFriend, user } = await this.getFriendAndUser({
      friendName,
      name,
    });

    if (!foundPotentialFriend || !user) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Invalid friendship request."
      );
    }

    if (
      user.friends.includes(foundPotentialFriend.id) ||
      user.id === foundPotentialFriend.id
    ) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Invalid friendship request."
      );
    }

    if (user.friendshipOutbox.includes(foundPotentialFriend.id)) {
      throw new HttpException(
        StatusCodes.CONFLICT,
        `Friendship request has already been sent to the user ${friendName}`
      );
    }

    // update logged in user's outbox
    const updatedUser = await User.findOneAndUpdate(
      { name: name },
      {
        $addToSet: { friendshipOutbox: foundPotentialFriend._id },
      },
      {
        new: true,
      }
    )
      .select("-password")
      .populate("friendshipInbox", "firstName lastName name email id")
      .populate("friendshipOutbox", "firstName lastName name email id");

    // update friend's inbox
    const updatedFriend = await User.findOneAndUpdate(
      { name: friendName },
      {
        $addToSet: { friendshipInbox: updatedUser._id },
      },
      { new: true }
    )
      .select("-password")
      .populate("friendshipInbox", "firstName lastName name email id")
      .populate("friendshipOutbox", "firstName lastName name email id");

    return { updatedFriend, updatedUser };
  }

  public async acceptFriendshipRequest(
    ctx: RequestContext,
    input: FriendshipParamDtoType
  ) {
    const { friend_name: friendName } = input;
    const name = ctx.user.name;
    // Note: name is the logged in user name to whom the request was sent
    const { friend, user } = await this.getFriendAndUser({ friendName, name });

    if (
      user.id === friend.id ||
      !friend.friendshipOutbox.includes(user.id) ||
      !user.friendshipInbox.includes(friend.id)
    ) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Invalid friendship request."
      );
    }

    // update friend's friends field and outbox field
    const updatedFriend = await User.findOneAndUpdate(
      { name: friendName },
      {
        $pull: { friendshipOutbox: user._id },
        $addToSet: { friends: user._id },
      },
      { new: true }
    )
      .select("-password")
      .populate("friendshipInbox", "firstName lastName name email id")
      .populate("friendshipOutbox", "firstName lastName name email id");

    // update logged in user's friends field and inbox field
    const updatedUser = await User.findOneAndUpdate(
      { name },
      {
        $pull: { friendshipInbox: friend._id },
        $addToSet: { friends: friend._id },
      },
      { new: true }
    )
      .select("-password")
      .populate("friendshipInbox", "firstName lastName name email id")
      .populate("friendshipOutbox", "firstName lastName name email id");

    return { updatedFriend, updatedUser };
  }

  public async rejectFriendshipRequest(
    ctx: RequestContext,
    input: FriendshipParamDtoType
  ) {
    const { friend_name: friendName } = input;
    const name = ctx.user.name;

    // Note: name is the logged in user name to whom the request was sent
    const { friend, user } = await this.getFriendAndUser({ friendName, name });

    if (user.id === friend.id) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Invalid friendship request."
      );
    }

    // if friend is in friends array of the user, then delete it from both sides
    if (user.friends.includes(friend.id)) {
      // update friend's outbox field
      const updatedFriend = await User.findOneAndUpdate(
        { name: friendName },
        {
          $pull: { friends: user._id },
        },
        { new: true }
      ).select("-password");

      // update user's inbox field
      const updatedUser = await User.findOneAndUpdate(
        { name },
        {
          $pull: { friends: friend._id },
        },
        { new: true }
      ).select("-password");

      return {
        data: { updatedFriend, updatedUser },
        message: "Friendship request has been rejected successfully.",
        status: StatusCodes.OK,
      };
    }

    // if friend in not in the friends array of the user, then reject the request
    if (
      !friend.friendshipOutbox.includes(user.id) ||
      !user.friendshipInbox.includes(friend.id)
    ) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Invalid friendship request."
      );
    }

    // update friend's outbox field
    const updatedFriend = await User.findOneAndUpdate(
      { name: friendName },
      {
        $pull: { friendshipOutbox: user._id },
      },
      { new: true }
    )
      .select("-password")
      .populate("friendshipInbox", "firstName lastName name email id")
      .populate("friendshipOutbox", "firstName lastName name email id");

    // update user's inbox field
    const updatedUser = await User.findOneAndUpdate(
      { name },
      {
        $pull: { friendshipInbox: friend._id },
      },
      { new: true }
    )
      .select("-password")
      .populate("friendshipInbox", "firstName lastName name email id")
      .populate("friendshipOutbox", "firstName lastName name email id");

    return { updatedFriend, updatedUser };
  }

  private async getFriendAndUser({
    friendName,
    name,
  }: {
    friendName: string;
    name: string;
  }) {
    const friend = await this.findOneQueryBuilder({
      name: friendName,
    }).select("-password");

    const user = await this.findOneQueryBuilder({
      name,
    }).select("-password");
    return { user, friend };
  }
}
