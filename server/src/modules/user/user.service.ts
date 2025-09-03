import { StatusCodes } from "http-status-codes";
import { HttpException } from "../../common/lib/exception";
import { GetOneDtoType } from "./dto/get-one.dto";
import { User } from "./user.model";
import { SendFriendshipRequestDtoType } from "./dto/send-friendship-request.dto";
import { DeleteUserDtoType } from "./dto/delete-user.dto";
import { CreateUserDtoType } from "./dto/create-user.dto";
import { hash, genSalt } from "bcryptjs";
import { UpdateUserDtoType } from "./dto/update-user.dto";
import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../../config";
import { Schema, Types } from "mongoose";

export class UserService {
  public async create(input: CreateUserDtoType) {
    const { firstName, lastName, name, email, password } = input;
    const foundUser = await User.findOne({ name });

    if (foundUser)
      // Suggest another user name
      throw new HttpException(
        StatusCodes.CONFLICT,
        "User account already exists."
      );

    const hashedPassword = await hash(password, await genSalt(10));

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

  public async update(input: UpdateUserDtoType & { loggedInUserName: string }) {
    const {
      name,
      loggedInUserName,
      data: { password, ...rest },
    } = input;
    if (loggedInUserName !== name) {
      throw new HttpException(StatusCodes.NOT_FOUND, "User not found.");
    }

    let hashedPassword = undefined;
    if (password) {
      hashedPassword = await hash(password, await genSalt(10));
    }

    // TODO: verify email and save it in a placeholder field
    // once the email is verified swap it with the email field

    const updatedUser = await User.findOneAndUpdate(
      { name },
      {
        ...(hashedPassword ? { password: hashedPassword } : {}),
        ...rest,
      },
      {
        new: true,
      }
    ).select("-password");
    const token = jwt.sign(
      {
        id: updatedUser._id,
        name: updatedUser.name,
      },
      JWT_SECRET_KEY
    );
    return { updatedUser, token };
  }

  public async delete({
    name,
    loggedInUserName,
  }: DeleteUserDtoType & { loggedInUserName: string }) {
    if (loggedInUserName !== name) {
      throw new HttpException(StatusCodes.NOT_FOUND, "User not found.");
    }
    const deletedUser = await User.findOneAndDelete({ name });

    // Pull the userId from all other users' friends arrays
    await User.updateMany(
      { friends: deletedUser._id },
      { $pull: { friends: deletedUser._id } }
    );
  }

  public async getCurrentUser(name: string) {
    return await this.getOne({ name });
  }

  public async getOne(input: GetOneDtoType) {
    const foundUser = await User.findOne({ name: input.name })
      .select("-password")
      .populate("collections")
      .populate("friends", "firstName lastName")
      .populate("friendshipInbox", "firstName lastName")
      .populate("friendshipOutbox", "firstName lastName")
      .exec();

    if (!foundUser) {
      throw new HttpException(StatusCodes.NOT_FOUND, "User not found.");
    }

    return foundUser;
  }

  public findOneQueryBuilder(by: { name?: string; id?: string }) {
    return User.findOne({ ...(by.name ? { name: by.name } : { id: by.id }) });
  }

  public async sendFriendshipRequest({
    name,
    friendName,
  }: SendFriendshipRequestDtoType) {
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

    return { updatedFriend, updatedUser };
  }

  public async acceptFriendshipRequest({
    name,
    friendName,
  }: SendFriendshipRequestDtoType) {
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

    return { updatedFriend, updatedUser };
  }

  public async rejectFriendshipRequest({
    name,
    friendName,
  }: SendFriendshipRequestDtoType) {
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
