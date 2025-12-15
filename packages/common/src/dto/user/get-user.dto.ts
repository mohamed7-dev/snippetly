import { SelectCollectionDto } from "../collections/select-collection.dto";
import {
  BadRequestErrorResponseDtoType,
  createSuccessResponse,
  GlobalErrorResponseDto,
  RateLimiterErrorResponseDto,
  RateLimiterErrorResponseDtoType,
  SharedErrorResDto,
  SharedErrorResDtoType,
  UnauthorizedErrorResponseDto,
  UnAuthorizedErrorResponseDtoType,
  z,
} from "../zod";
import {
  CommonUserResDto,
  UPLOAD_THING_KEY_EXAMPLE,
  UPLOAD_THING_URL_EXAMPLE,
  UserActivityExample,
  UserActivityStatsDto,
} from "./common";
import { CreateUserDto } from "./create-user.dto";
import { SelectFriendshipDto } from "./select-friendship.dto";

// Get User Request
const GetUserRequest = z.object({
  name: CreateUserDto.shape.name,
});
export const GetUserRequestDto = GetUserRequest.meta({
  id: "GetUserRequestBody",
  description: "Get user request param",
  example: {
    name: "John_doe7",
  } satisfies z.infer<typeof GetUserRequest>,
});
export type GetUserRequestDtoType = z.infer<typeof GetUserRequestDto>;

// Get User Response

const GetUserProfileSuccessResponseDto = z.object({
  profile: CommonUserResDto,
  stats: UserActivityStatsDto,
});

export const GetUserSuccessResponseDto = createSuccessResponse(
  GetUserProfileSuccessResponseDto,
  "GetUserProfileSuccessResponseBody",
  "Get user profile success response body, tailored to the account owner",
  {
    profile: {
      name: "john_doe7",
      firstName: "john",
      lastName: "doe",
      image: UPLOAD_THING_URL_EXAMPLE,
      imageKey: UPLOAD_THING_KEY_EXAMPLE,
      bio: "I'm a full-stack developer",
      email: "test@example.com",
      emailVerifiedAt: new Date().toISOString() as unknown as Date,
      createdAt: new Date().toISOString() as unknown as Date,
      updatedAt: new Date().toISOString() as unknown as Date,
      isPrivate: false,
    },
    stats: UserActivityExample,
  } satisfies z.infer<typeof GetUserProfileSuccessResponseDto>,
  "Fetched successfully"
);

const GetPublicUserProfileSuccessResponseDto =
  GetUserProfileSuccessResponseDto.extend({
    friendshipInfo: z.object({
      isCurrentUserAFriend: z.boolean(),
      requestStatus: SelectFriendshipDto.shape.status.nullable(),
    }),
    profile: GetUserProfileSuccessResponseDto.shape.profile.omit({
      emailVerifiedAt: true,
      updatedAt: true,
      isPrivate: true,
    }),
  });

export const GetPublicUserSuccessResponseDto = createSuccessResponse(
  GetPublicUserProfileSuccessResponseDto,
  "GetPublicUserProfileSuccessResponseBody",
  "Get user profile success response body, tailored to a guest",
  {
    profile: {
      name: "john_doe7",
      firstName: "john",
      lastName: "doe",
      image: UPLOAD_THING_URL_EXAMPLE,
      imageKey: UPLOAD_THING_KEY_EXAMPLE,
      bio: "I'm a full-stack developer",
      email: "test@example.com",
      createdAt: new Date().toISOString() as unknown as Date,
    },
    friendshipInfo: {
      isCurrentUserAFriend: false,
      requestStatus: null,
    },
    stats: UserActivityExample,
  } satisfies z.infer<typeof GetPublicUserProfileSuccessResponseDto>,
  "Fetched successfully"
);

// TODO: find a way to discriminate unions which supports error specific schemas
export const GetPublicUserSuccessResponseBody =
  GetPublicUserSuccessResponseDto.extend({
    type: z.literal("public-success"),
  });

export const GetUserSuccessResponseBody = GetUserSuccessResponseDto.extend({
  type: z.literal("owner-success"),
});
export const GetUserResponseDto = z.discriminatedUnion("type", [
  GetPublicUserSuccessResponseBody,
  GetUserSuccessResponseBody,
  GlobalErrorResponseDto,
]);

export type GetUserResponseDtoType = {
  success:
    | z.infer<typeof GetPublicUserSuccessResponseBody>
    | z.infer<typeof GetUserSuccessResponseBody>;
  error:
    | SharedErrorResDtoType
    | BadRequestErrorResponseDtoType<GetUserRequestDtoType>
    | RateLimiterErrorResponseDtoType;
};

// Get Current User Response <The Same As Owner Response>
export const GetCurrentUserResponseDto = z.discriminatedUnion("status", [
  GetUserSuccessResponseDto,
  RateLimiterErrorResponseDto,
  ...SharedErrorResDto,
  UnauthorizedErrorResponseDto,
]);

export type GetCurrentUserResponseDtoType = {
  success: z.infer<typeof GetUserSuccessResponseDto>;
  error:
    | SharedErrorResDtoType
    | UnAuthorizedErrorResponseDtoType
    | RateLimiterErrorResponseDtoType;
};

// Get Current User Dashboard Response
const GetCurrentUserDashboardResponse = z.object({
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
  GetCurrentUserDashboardResponse,
  "GetCurrentUserDashboardSuccessResBody",
  "Get current user dashboard success response body",
  {
    user: {
      name: "john_doe20",
      firstName: "john",
      lastName: "doe",
      image: UPLOAD_THING_URL_EXAMPLE,
      imageKey: UPLOAD_THING_KEY_EXAMPLE,
      bio: "I'm a full-stack engineer",
      email: "test@example.com",
      emailVerifiedAt: new Date().toISOString() as unknown as Date,
      createdAt: new Date().toISOString() as unknown as Date,
      updatedAt: new Date().toISOString() as unknown as Date,
      isPrivate: false,
    },
    collections: [
      {
        title: "Reactjs hooks",
        slug: "reactjs-hooks",
        color: "#eee",
        createdAt: new Date().toISOString() as unknown as Date,
        updatedAt: new Date().toISOString() as unknown as Date,
        snippetsCount: 10,
      },
    ],
    stats: UserActivityExample,
  } satisfies z.infer<typeof GetCurrentUserDashboardResponse>,
  "Fetched successfully"
);

export const GetCurrentUserDashboardResDto = z.discriminatedUnion("status", [
  GetCurrentUserDashboardSuccessResDto,
  RateLimiterErrorResponseDto,
  ...SharedErrorResDto,
  UnauthorizedErrorResponseDto,
]);

export type GetCurrentUserDashboardResDtoType = {
  success: z.infer<typeof GetCurrentUserDashboardSuccessResDto>;
  error:
    | SharedErrorResDtoType
    | UnAuthorizedErrorResponseDtoType
    | RateLimiterErrorResponseDtoType;
};
