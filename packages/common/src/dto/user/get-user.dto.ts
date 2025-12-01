import { createSuccessResponse, GlobalErrorResponseDto, z } from "../zod";
import {
  CommonUserResDto,
  CommonUserResDtoExample,
  UserActivityStatsDto,
} from "./common";
import { CreateUserDto } from "./create-user.dto";
import { SelectFriendshipDto } from "./select-friendship.dto";

// Get User Request

export const GetUserRequestDto = z
  .object({
    name: CreateUserDto.shape.name,
  })
  .meta({
    id: "GetUserRequestBody",
    description: "Get user request param",
    example: {
      name: "John_doe7",
    },
  });
export type GetUserRequestDtoType = z.infer<typeof GetUserRequestDto>;

// Get User Response

const GetUserProfileSuccessResponseDto = z.object({
  profile: CommonUserResDto,
  stats: UserActivityStatsDto,
});

export const GetUserSuccessResponseDto = createSuccessResponse(
  GetUserProfileSuccessResponseDto.extend({
    type: z.literal("owner-success"),
  }),
  "GetUserProfileSuccessResponseBody",
  "Get user profile success response body, tailored to the account owner",
  {
    ...CommonUserResDtoExample,
  },
  "Fetched successfully"
);

const GetPublicUserProfileSuccessResponseDto =
  GetUserProfileSuccessResponseDto.extend({
    friendshipInfo: z.object({
      isCurrentUserAFriend: z.boolean(),
      requestStatus: SelectFriendshipDto.shape.status.nullish(),
    }),
    profile: GetUserProfileSuccessResponseDto.shape.profile.omit({
      emailVerifiedAt: true,
      updatedAt: true,
      isPrivate: true,
    }),
  });

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { emailVerifiedAt, updatedAt, isPrivate, ...publicUserResDtoExample } =
  CommonUserResDtoExample;
export const GetPublicUserSuccessResponseDto = createSuccessResponse(
  GetPublicUserProfileSuccessResponseDto.extend({
    type: z.literal("public-success"),
  }),
  "GetPublicUserProfileSuccessResponseBody",
  "Get user profile success response body, tailored to a guest",
  {
    ...publicUserResDtoExample,
  },
  "Fetched successfully"
);

export const GetUserResponseDto = z.discriminatedUnion("type", [
  GetUserSuccessResponseDto,
  GetPublicUserSuccessResponseDto,
  GlobalErrorResponseDto,
]);

export type GetUserResponseDtoType = z.infer<typeof GetUserResponseDto>;

// Get Current User Response <The Same As Owner Response>
export const GetCurrentUserResponseDto = z.discriminatedUnion("type", [
  GetUserSuccessResponseDto,
  GlobalErrorResponseDto,
]);

export type GetCurrentUserResponseDtoType = z.infer<
  typeof GetCurrentUserResponseDto
>;
