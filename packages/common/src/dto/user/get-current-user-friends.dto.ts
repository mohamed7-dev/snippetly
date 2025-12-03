import { SelectSnippetDto } from "../snippets/select-snippet.dto";
import {
  baseModelSchema,
  createSuccessResponse,
  GlobalErrorResponseDto,
  z,
} from "../zod";
import { SelectFriendshipDto } from "./select-friendship.dto";
import { SelectUserDto } from "./select-user.dto";

// Get User's Inbox/Outbox/Friends Request
export const GetCurrentUserFriendsRequestQueryDto = z
  .object({
    limit: z.number().min(1).max(100).optional(),
    cursor: baseModelSchema.pick({ id: true }).optional(),
    query: z.string().nonempty().optional(),
  })
  .meta({
    id: "GetCurrentUserFriendsRequestQuery",
    description: "Get current user friends request query param",
    example: {
      limit: 20,
      cursor: { id: 100 },
      query: "search_query",
    },
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

export const GetCurrentUserFriendsSuccessResDto = createSuccessResponse(
  z.object({
    items: GetCurrentUserFriendsSuccessRes,
    total: z.number(),
    nextCursor: GetCurrentUserFriendsRequestQueryDto.shape.cursor,
  }),
  "GetUserFriendsSuccessResBody",
  "Get user friends success response body",
  {
    total: 2,
    cursor: undefined,
    items: [
      {
        firstName: "ahmed",
        lastName: "ali",
        name: "ahmedA70",
        image: "https://uploadthign...",
        bio: "Full-Stack developer",
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
            slug: "usePresence-hook",
            language: "javascript",
            createdAt: new Date().toISOString() as unknown as Date,
          },
        ],
      },
      {
        firstName: "john",
        lastName: "doe",
        name: "john_doe70",
        image: "https://uploadthign...",
        bio: "Front end developer",
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
    ] satisfies z.infer<typeof GetCurrentUserFriendsSuccessRes>,
  },
  "Fetched successfully"
);

export const GetCurrentUserFriendsResDto = z.discriminatedUnion("type", [
  GetCurrentUserFriendsSuccessResDto,
  GlobalErrorResponseDto,
]);
export type GetCurrentUserFriendsResDtoType = z.infer<
  typeof GetCurrentUserFriendsResDto
>;

// Get User Inbox Response
const GetCurrentUserInboxOutboxSuccessRes = z.array(CommonFriendDto); // shared

export const GetCurrentUserInboxSuccessResDto = createSuccessResponse(
  z.object({
    items: GetCurrentUserInboxOutboxSuccessRes,
    total: z.number(),
    nextCursor: GetCurrentUserFriendsRequestQueryDto.shape.cursor,
  }),
  "GetUserInboxSuccessResBody",
  "Response body of the friendship requests sent to the current user",
  {
    total: 10,
    nextCursor: { id: 298 },
    items: [
      {
        firstName: "ahmed",
        lastName: "ali",
        name: "ahmedA70",
        image: "https://uploadthign...",
        bio: "Full-Stack developer",
        requestSentAt: new Date().toISOString() as unknown as Date,
        requestStatus: "pending",
        snippetsCount: 10,
      },
      {
        firstName: "john",
        lastName: "doe",
        name: "john_doe70",
        image: "https://uploadthign...",
        bio: "Front end developer",
        requestSentAt: new Date().toISOString() as unknown as Date,
        snippetsCount: 50,
        requestStatus: "pending",
      },
    ] satisfies z.infer<typeof GetCurrentUserInboxOutboxSuccessRes>,
  },

  "Fetched successfully"
);

export const GetCurrentUserInboxResDto = z.discriminatedUnion("type", [
  GetCurrentUserInboxSuccessResDto,
  GlobalErrorResponseDto,
]);
export type GetCurrentUserInboxResDtoType = z.infer<
  typeof GetCurrentUserInboxResDto
>;

// Get User Outbox Response
export const GetCurrentUserOutboxSuccessResDto = createSuccessResponse(
  z.object({
    items: GetCurrentUserInboxOutboxSuccessRes,
    total: z.number(),
    nextCursor: GetCurrentUserFriendsRequestQueryDto.shape.cursor,
  }),
  "GetUserOutboxSuccessResBody",
  "Response body of the friendship requests sent by the current user",
  {
    total: 2,
    nextCursor: undefined,
    items: [
      {
        firstName: "ahmed",
        lastName: "ali",
        name: "ahmedA70",
        image: "https://uploadthign...",
        bio: "Full-Stack developer",
        requestSentAt: new Date().toISOString() as unknown as Date,
        requestStatus: "pending",
        snippetsCount: 10,
      },
      {
        firstName: "john",
        lastName: "doe",
        name: "john_doe70",
        image: "https://uploadthign...",
        bio: "Front end developer",
        requestSentAt: new Date().toISOString() as unknown as Date,
        snippetsCount: 50,
        requestStatus: "rejected",
      },
    ] satisfies z.infer<typeof GetCurrentUserInboxOutboxSuccessRes>,
  },
  "Fetched successfully"
);
export const GetCurrentUserOutboxResDto = z.discriminatedUnion("type", [
  GetCurrentUserOutboxSuccessResDto,
  GlobalErrorResponseDto,
]);
export type GetCurrentUserOutboxResDtoType = z.infer<
  typeof GetCurrentUserOutboxResDto
>;
