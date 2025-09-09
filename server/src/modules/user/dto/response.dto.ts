import z from "zod";
import { SelectUserDto } from "./select-user.dto";
import { SelectFolderDto } from "../../folder/dto/select-folder.dto";
import { SelectSnippetDto } from "../../snippet/dto/select-snippet.dto";
import { GetUserSnippetsResponseDto } from "../../snippet/dto/response.dto";

// Common<Current User, User Profile, Friendship>
const CommonSchema = z.object({
  friends: z.array(
    SelectUserDto.pick({
      firstName: true,
      lastName: true,
      name: true,
      email: true,
      id: true,
    })
  ),
  friendshipInbox: z.array(
    SelectUserDto.pick({
      firstName: true,
      lastName: true,
      name: true,
      email: true,
      id: true,
    })
  ),
  friendshipOutbox: z.array(
    SelectUserDto.pick({
      firstName: true,
      lastName: true,
      name: true,
      email: true,
      id: true,
    })
  ),
  folders: z.array(
    SelectFolderDto.pick({ title: true, code: true, id: true, color: true })
  ),
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

// Get Current User Dashboard
export const GetCurrentUserDashboardResDto = UserRes.omit({
  friendshipInbox: true,
  friends: true,
  friendshipOutbox: true,
}).extend({
  foldersCount: z.number(),
  friendsCount: z.number(),
  friendsInboxCount: z.number(),
  friendsOutboxCount: z.number(),
  snippetsCount: z.number(),
  snippets: GetUserSnippetsResponseDto,
});
export type GetCurrentUserDashboardResDtoType = z.infer<
  typeof GetCurrentUserDashboardResDto
>;
