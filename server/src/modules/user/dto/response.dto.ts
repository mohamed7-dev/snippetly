import z from "zod";
import { SelectUserDto } from "./select-user.dto";
import { SelectFolderDto } from "../../folder/dto/select-folder.dto";

// Common<Current User, User Profile, Friendship>
const CommonSchema = z.object({
  friends: z.array(
    SelectUserDto.pick({
      firstName: true,
      lastName: true,
      name: true,
      email: true,
    })
  ),
  friendshipInbox: z.array(
    SelectUserDto.pick({
      firstName: true,
      lastName: true,
      name: true,
      email: true,
    })
  ),
  friendshipOutbox: z.array(
    SelectUserDto.pick({
      firstName: true,
      lastName: true,
      name: true,
      email: true,
    })
  ),
  folders: z.array(SelectFolderDto.pick({ title: true, code: true })),
});

// Basic User Info Stripped from all important info
export const UserRes = SelectUserDto.omit({
  password: true,
  refreshTokens: true,
  emailVerificationToken: true,
  emailVerificationExpiresAt: true,
  emailVerifiedAt: true,
}).extend(
  CommonSchema.pick({ friendshipInbox: true, friendshipOutbox: true }).shape
);

// Friendship Related Routes
export const FriendshipResponseDto = z.object({
  user: UserRes,
  friend: UserRes,
});

export type FriendshipResponseDto = z.infer<typeof FriendshipResponseDto>;

// Get Current User
export const GetCurrentUserDto = SelectUserDto.omit({
  password: true,
  refreshTokens: true,
}).extend(CommonSchema.shape);

// Get User Profile
export const GetUserProfile = UserRes.extend(CommonSchema.shape);
