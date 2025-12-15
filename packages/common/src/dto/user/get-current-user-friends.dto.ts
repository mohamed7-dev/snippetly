import { SelectSnippetDto } from "../snippets/select-snippet.dto";
import {
  BadRequestErrorResponseDto,
  BadRequestErrorResponseDtoType,
  baseModelSchema,
  createSuccessResponse,
  LIMIT_SCHEMA,
  RateLimiterErrorResponseDto,
  RateLimiterErrorResponseDtoType,
  SharedErrorResDto,
  SharedErrorResDtoType,
  UnauthorizedErrorResponseDto,
  UnAuthorizedErrorResponseDtoType,
  z,
} from "../zod";
import { UPLOAD_THING_URL_EXAMPLE } from "./common";
import { SelectFriendshipDto } from "./select-friendship.dto";
import { SelectUserDto } from "./select-user.dto";

const GetCurrentUserFriendsRequestQuery = z.object({
  limit: LIMIT_SCHEMA,
  cursor: baseModelSchema.pick({ id: true }).optional(),
  query: z.string().nonempty().optional(),
});

// Get User's Inbox/Outbox/Friends Request
export const GetCurrentUserFriendsRequestQueryDto =
  GetCurrentUserFriendsRequestQuery.meta({
    id: "GetCurrentUserFriendsRequestQuery",
    description: "Get current user friends request query param",
    example: {
      limit: 20,
      cursor: { id: 100 },
      query: "john | doe | john_doe7",
    } satisfies z.infer<typeof GetCurrentUserFriendsRequestQuery>,
  });

export type GetCurrentUserFriendsRequestQueryDtoType = z.infer<
  typeof GetCurrentUserFriendsRequestQueryDto
>;

// Shared
const CommonFriendDto = SelectUserDto.pick({
  firstName: true,
  lastName: true,
  name: true,
  image: true,
  bio: true,
}).extend({
  requestSentAt: z.date(),
  requestStatus: SelectFriendshipDto.shape.status,
  snippetsCount: z.number(),
});

// Get Current User Friends Response
const GetCurrentUserFriendsSuccessRes = z.array(
  CommonFriendDto.extend({
    requestAcceptedAt: z.date(),
    recentSnippets: z.array(
      SelectSnippetDto.pick({
        title: true,
        slug: true,
        language: true,
        createdAt: true,
      })
    ),
  })
);

const GetCurrentUserFriendsSuccessResBody = z.object({
  items: GetCurrentUserFriendsSuccessRes,
  total: z.number(),
  nextCursor: GetCurrentUserFriendsRequestQueryDto.shape.cursor,
});
export const GetCurrentUserFriendsSuccessResDto = createSuccessResponse(
  GetCurrentUserFriendsSuccessResBody,
  "GetUserFriendsSuccessResBody",
  "Get user friends success response body",
  {
    total: 2,
    nextCursor: undefined,
    items: [
      {
        firstName: "ahmed",
        lastName: "ali",
        name: "ahmedA70",
        image: UPLOAD_THING_URL_EXAMPLE,
        bio: "I'm a front-end developer",
        requestSentAt: new Date().toISOString() as unknown as Date,
        requestStatus: "accepted",
        snippetsCount: 10,
        requestAcceptedAt: new Date().toISOString() as unknown as Date,
        recentSnippets: [
          {
            title: "Closure in js",
            slug: "closure-in-js",
            language: "javascript",
            createdAt: new Date().toISOString() as unknown as Date,
          },
          {
            title: "usePresence hook",
            slug: "use-presence-hook",
            language: "javascript",
            createdAt: new Date().toISOString() as unknown as Date,
          },
        ],
      },
      {
        firstName: "john",
        lastName: "doe",
        name: "john_doe7",
        image: UPLOAD_THING_URL_EXAMPLE,
        bio: "I'm a full-stack developer",
        requestSentAt: new Date().toISOString() as unknown as Date,
        snippetsCount: 50,
        requestStatus: "accepted",
        requestAcceptedAt: new Date().toISOString() as unknown as Date,
        recentSnippets: [
          {
            title: "nestjs IOC container",
            slug: "nestjs-ioc-container",
            language: "javascript",
            createdAt: new Date().toISOString() as unknown as Date,
          },
        ],
      },
    ],
  } satisfies z.infer<typeof GetCurrentUserFriendsSuccessResBody>,
  "Fetched successfully"
);

export const GetCurrentUserFriendsResDto = z.discriminatedUnion("status", [
  GetCurrentUserFriendsSuccessResDto,
  UnauthorizedErrorResponseDto,
  BadRequestErrorResponseDto,
  RateLimiterErrorResponseDto,
  ...SharedErrorResDto,
]);

export type GetCurrentUserFriendsResDtoType = {
  success: z.infer<typeof GetCurrentUserFriendsSuccessResDto>;
  error:
    | SharedErrorResDtoType
    | UnAuthorizedErrorResponseDtoType
    | BadRequestErrorResponseDtoType<GetCurrentUserFriendsRequestQueryDtoType>
    | RateLimiterErrorResponseDtoType;
};

// Get User Inbox Response
const GetCurrentUserInboxOutboxSuccessRes = z.array(CommonFriendDto); // shared

const GetCurrentUserInboxSuccessResBody = z.object({
  items: GetCurrentUserInboxOutboxSuccessRes,
  total: z.number(),
  nextCursor: GetCurrentUserFriendsRequestQueryDto.shape.cursor,
});
export const GetCurrentUserInboxSuccessResDto = createSuccessResponse(
  GetCurrentUserInboxSuccessResBody,
  "GetUserInboxSuccessResBody",
  "Response body of the friendship requests sent to the current user",
  {
    total: 10,
    nextCursor: { id: 298 },
    items: [
      {
        firstName: "omar",
        lastName: "mohamed",
        name: "omar-mohamed70",
        image: UPLOAD_THING_URL_EXAMPLE,
        bio: "I'm a data analyst",
        requestSentAt: new Date().toISOString() as unknown as Date,
        requestStatus: "pending",
        snippetsCount: 10,
      },
      {
        firstName: "ahmed",
        lastName: "mohamed",
        name: "ahmed_mo",
        image: UPLOAD_THING_URL_EXAMPLE,
        bio: "I'm a Dev-Ops engineer",
        requestSentAt: new Date().toISOString() as unknown as Date,
        snippetsCount: 50,
        requestStatus: "pending",
      },
    ],
  } satisfies z.infer<typeof GetCurrentUserInboxSuccessResBody>,

  "Fetched successfully"
);

export const GetCurrentUserInboxResDto = z.discriminatedUnion("status", [
  GetCurrentUserInboxSuccessResDto,
  UnauthorizedErrorResponseDto,
  BadRequestErrorResponseDto,
  RateLimiterErrorResponseDto,
  ...SharedErrorResDto,
]);
export type GetCurrentUserInboxResDtoType = {
  success: z.infer<typeof GetCurrentUserInboxSuccessResDto>;
  error:
    | SharedErrorResDtoType
    | UnAuthorizedErrorResponseDtoType
    | BadRequestErrorResponseDtoType<GetCurrentUserFriendsRequestQueryDtoType>
    | RateLimiterErrorResponseDtoType;
};

// Get User Outbox Response
export const GetCurrentUserOutboxSuccessResDto = createSuccessResponse(
  GetCurrentUserInboxSuccessResBody,
  "GetUserOutboxSuccessResBody",
  "Response body of the friendship requests sent by the current user",
  {
    total: 2,
    nextCursor: undefined,
    items: [
      {
        firstName: "john",
        lastName: "smith",
        name: "john-smith7",
        image: UPLOAD_THING_URL_EXAMPLE,
        bio: "I'm a full-Stack developer",
        requestSentAt: new Date().toISOString() as unknown as Date,
        requestStatus: "pending",
        snippetsCount: 10,
      },
      {
        firstName: "jenna",
        lastName: "smith",
        name: "jenna",
        image: UPLOAD_THING_URL_EXAMPLE,
        bio: "I'm a network engineer",
        requestSentAt: new Date().toISOString() as unknown as Date,
        snippetsCount: 50,
        requestStatus: "rejected",
      },
    ],
  } satisfies z.infer<typeof GetCurrentUserInboxSuccessResBody>,
  "Fetched successfully"
);
export const GetCurrentUserOutboxResDto = z.discriminatedUnion("status", [
  GetCurrentUserOutboxSuccessResDto,
  UnauthorizedErrorResponseDto,
  BadRequestErrorResponseDto,
  RateLimiterErrorResponseDto,
  ...SharedErrorResDto,
]);
export type GetCurrentUserOutboxResDtoType = {
  success: z.infer<typeof GetCurrentUserOutboxSuccessResDto>;
  error:
    | SharedErrorResDtoType
    | UnAuthorizedErrorResponseDtoType
    | BadRequestErrorResponseDtoType<GetCurrentUserFriendsRequestQueryDtoType>
    | RateLimiterErrorResponseDtoType;
};
