import { StatusCodes } from "http-status-codes";
import { HttpException } from "../../common/lib/exception";
import { IUser, User } from "./user.model";
import { CreateUserDtoType } from "./dto/create-user.dto";
import { UpdateUserDtoType } from "./dto/update-user.dto";
import { ValueOrElement } from "../../common/types/utils";
import { PasswordHashService } from "../auth/password-hash.service";
import { Request } from "express";
import { AuthService } from "../auth/auth.service";
import { UpdateUserPasswordDtoType } from "./dto/update-password.dto";
import { Types } from "mongoose";

export class UserService {
  private readonly PasswordHashService: PasswordHashService;
  private readonly AuthService: AuthService;
  constructor() {
    this.PasswordHashService = new PasswordHashService();
    this.AuthService = new AuthService();
  }

  public async create(input: CreateUserDtoType) {
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

  public async update(req: Request<{ name: string }, {}, UpdateUserDtoType>) {
    const data = req.body;
    const name = req.params.name;

    if ("password" in data) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Password can't be updated."
      );
    }
    const loggedInUserName = req.user.name;

    if (loggedInUserName !== name) {
      throw new HttpException(StatusCodes.NOT_FOUND, "User not found.");
    }

    const updatedUser = await User.findOneAndUpdate({ name }, data, {
      new: true,
    }).select("-password");

    return {
      data: updatedUser,
      status: StatusCodes.OK,
      message: "User info has been updated successfully",
    };
  }

  public async updatePassword(req: Request<{}, {}, UpdateUserPasswordDtoType>) {
    const loggedInUserName = req.user.name;

    const updatedUser = await User.findOneAndUpdate(
      { name: loggedInUserName },
      { password: await this.PasswordHashService.hash(req.body.password) },
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

  public async updateUserCollections({
    collectionId,
    userId,
    operation,
  }: {
    collectionId: string;
    userId: string;
    operation: "Pull" | "Push";
  }) {
    const updatedUser = await User.findOneAndUpdate(
      { id: userId },
      {
        ...(operation === "Push"
          ? { $addToSet: { collections: collectionId } }
          : null),
        ...(operation === "Pull"
          ? { $pull: { collections: collectionId } }
          : null),
      },
      { new: true }
    );

    return {
      data: updatedUser,
      message: "User collections have been updated successfully.",
      status: StatusCodes.OK,
    };
  }

  public async delete(req: Request<{ name: string }>) {
    const name = req.params.name;
    const loggedInUserName = req.user.name;
    if (loggedInUserName !== name) {
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
    return {
      status: StatusCodes.OK,
      message: "User account has been deleted successfully",
      data: null,
    };
  }

  public async getCurrentUser(req: Request) {
    req.params.name = req.user.name;
    const profile = await this.getOne(req as Request<{ name: string }>);
    if (profile.data.id !== req.user.id) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You are not allowed to view this profile."
      );
    }
    return profile;
  }

  public async getOne(req: Request<{ name: string }>) {
    const foundUser = await User.findOne({ name: req.params.name })
      .select("-password")
      .populate("collections")
      .populate("friends", "firstName lastName name _id")
      .populate("friendshipInbox", "firstName lastName name _id")
      .populate("friendshipOutbox", "firstName lastName name _id")
      .exec();

    if (!foundUser) {
      throw new HttpException(StatusCodes.NOT_FOUND, "User not found.");
    }

    return {
      data: foundUser,
      message: "Fetched successfully.",
      status: StatusCodes.OK,
    };
  }

  public findOneQueryBuilder<T extends keyof IUser>(filter: {
    [K in T]: ValueOrElement<IUser[K]>;
  }) {
    return User.findOne(filter);
  }

  public async sendFriendshipRequest(req: Request<{ friend_name: string }>) {
    const { friend_name: friendName } = req.params;
    const name = req.user.name;
    // Note: name is the logged in user name
    const { friend: foundPotentialFriend, user } = await this.getFriendAndUser({
      friendName,
      name,
    });

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
        `Friendship request has been sent to the user ${friendName}`
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
    ).select("-password");

    // update friend's inbox
    const updatedFriend = await User.findOneAndUpdate(
      { name: friendName },
      {
        $addToSet: { friendshipInbox: updatedUser._id },
      },
      { new: true }
    ).select("-password");

    return {
      data: { updatedFriend, updatedUser },
      message: "Friendship request has been sent successfully.",
      status: StatusCodes.OK,
    };
  }

  public async acceptFriendshipRequest(req: Request<{ friend_name: string }>) {
    const { friend_name: friendName } = req.params;
    const name = req.user.name;
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
    ).select("-password");

    // update logged in user's friends field and inbox field
    const updatedUser = await User.findOneAndUpdate(
      { name },
      {
        $pull: { friendshipInbox: friend._id },
        $addToSet: { friends: friend._id },
      },
      { new: true }
    ).select("-password");

    return {
      data: { updatedFriend, updatedUser },
      message: "Friendship request has been accepted successfully.",
      status: StatusCodes.OK,
    };
  }

  public async rejectFriendshipRequest(req: Request<{ friend_name: string }>) {
    const { friend_name: friendName } = req.params;
    const name = req.user.name;

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

      return { updatedFriend, updatedUser };
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
    ).select("-password");

    // update user's inbox field
    const updatedUser = await User.findOneAndUpdate(
      { name },
      {
        $pull: { friendshipInbox: friend._id },
      },
      { new: true }
    ).select("-password");

    return {
      data: { updatedFriend, updatedUser },
      message: "Friendship request has been rejected successfully.",
      status: StatusCodes.OK,
    };
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
