import z from "zod";
import { SelectUserDto } from "./select-user.dto";
import { SelectCollectionDto } from "../../collection/dto/select-collection.dto";

// Basic User Info Stripped from all important info
export const UserRes = SelectUserDto.omit({
  password: true,
  refreshTokens: true,
  emailVerificationToken: true,
  emailVerificationExpiresAt: true,
  emailVerifiedAt: true,
});

// Friendship Related Routes
export const FriendshipResponseDto = z.object({
  user: UserRes,
  friend: UserRes,
});

export type FriendshipResponseDto = z.infer<typeof FriendshipResponseDto>;

// Common<Current User, User Profile>
const CommonSchema = z.object({
  friends: z.array(SelectUserDto.pick({ firstName: true, lastName: true })),
  friendshipInbox: z.array(
    SelectUserDto.pick({ firstName: true, lastName: true })
  ),
  friendshipOutbox: z.array(
    SelectUserDto.pick({ firstName: true, lastName: true })
  ),
  collections: z.array(SelectCollectionDto),
});

// Get Current User
export const GetCurrentUserDto = SelectUserDto.omit({
  password: true,
  refreshTokens: true,
}).extend(CommonSchema);

// Get User Profile
export const GetUserProfile = UserRes.extend(CommonSchema);
