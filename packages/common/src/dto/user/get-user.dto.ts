import { SelectCollectionDto } from "../collections/select-collection.dto";
import { createSuccessResponse, GlobalErrorResponseDto, z } from "../zod";
import {
  CommonUserResDto,
  CommonUserResDtoExample,
  UserActivityExample,
  UserActivityStatsDto,
} from "./common";
import { CreateUserDto } from "./create-user.dto";
// import { SelectFriendshipDto } from "./select-friendship.dto";

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
    stats: UserActivityExample,
  },
  "Fetched successfully"
);

const GetPublicUserProfileSuccessResponseDto =
  GetUserProfileSuccessResponseDto.extend({
    friendshipInfo: z.object({
      isCurrentUserAFriend: z.boolean(),
      // requestStatus: SelectFriendshipDto.shape.status.nullish(),
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

// Get Current User Dashboard Response
export const GetCurrentUserDashboardResponseDto = z.object({
  user: GetUserProfileSuccessResponseDto.shape.profile,
  collections: z.array(
    SelectCollectionDto.pick({
      title: true,
      slug: true,
      color: true,
      createdAt: true,
      updatedAt: true,
    }).extend({ snippetsCount: z.number() })
  ),
  stats: UserActivityStatsDto,
});

export const GetCurrentUserDashboardSuccessResDto = createSuccessResponse(
  GetCurrentUserDashboardResponseDto,
  "GetCurrentUserDashboardSuccessResBody",
  "Get current user dashboard success response body",
  {
    user: { ...CommonUserResDtoExample },
    collections: [
      {
        id: 20,
        title: "Reactjs hooks",
        slug: "reactjs-hooks",
        color: "#eee",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    stats: UserActivityExample,
  },
  "Fetched successfully"
);

export const GetCurrentUserDashboardResDto = z.discriminatedUnion("type", [
  GetCurrentUserDashboardSuccessResDto,
  GlobalErrorResponseDto,
]);

export type GetCurrentUserDashboardResDtoType = z.infer<
  typeof GetCurrentUserDashboardResDto
>;
