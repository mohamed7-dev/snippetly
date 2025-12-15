import { SelectTagDto } from "../tags/select-tag.dto";
import {
  BadRequestErrorResponseDto,
  BadRequestErrorResponseDtoType,
  createSuccessResponse,
  LIMIT_SCHEMA,
  RateLimiterErrorResponseDto,
  RateLimiterErrorResponseDtoType,
  SharedErrorResDto,
  SharedErrorResDtoType,
  z,
} from "../zod";
import {
  CommonUserResDto,
  UPLOAD_THING_KEY_EXAMPLE,
  UPLOAD_THING_URL_EXAMPLE,
} from "./common";

const DiscoverUsersRequestQuery = z.object({
  limit: LIMIT_SCHEMA,
  cursor: z
    .object({
      snippetsCount: z.number(),
      id: z.number(),
    })
    .optional(),
  query: z.string().nonempty().optional(),
  // .string()
  // .transform((val) => {
  //   try {
  //     const parsed = JSON.parse(val) as {
  //       snippetsCount: number;
  //       id: number;
  //     };
  //     if (!parsed.id || !parsed.snippetsCount) {
  //       throw new Error("cursor must be a valid discover users' cursor");
  //     }
  //     return {
  //       snippetsCount: Number(parsed.snippetsCount),
  //       id: Number(parsed.id),
  //     };
  //   } catch {
  //     throw new Error("cursor must be a valid JSON string");
  //   }
  // })
  // .optional(),
});

// Discover Users Request
export const DiscoverUsersRequestQueryDto = DiscoverUsersRequestQuery.meta({
  id: "DiscoverUsersRequestQuery",
  description: "Discover users request query params",
  example: {
    limit: 10,
    cursor: {
      snippetsCount: 50,
      id: 8,
    },
    query: "john | doe | test@example.com",
  } satisfies z.infer<typeof DiscoverUsersRequestQuery>,
});

export type DiscoverUsersRequestQueryDtoType = z.infer<
  typeof DiscoverUsersRequestQueryDto
>;

// Discover Users Response
const DiscoverUsersSuccessResponse = z.array(
  CommonUserResDto.omit({
    emailVerifiedAt: true,
    isPrivate: true,
    updatedAt: true,
  }).extend({
    friendsCount: z.number(),
    snippetsCount: z.number(),
    tags: z.array(SelectTagDto.pick({ name: true })),
  })
);

const DiscoverUsersSuccessResponseBody = z.object({
  items: DiscoverUsersSuccessResponse,
  total: z.number(),
  nextCursor: z
    .object({
      snippetsCount: z.number(),
      id: z.number(),
    })
    .optional(),
});
export const DiscoverUsersSuccessResponseDto = createSuccessResponse(
  DiscoverUsersSuccessResponseBody,
  "DiscoverUsersSuccessResponseBody",
  "Discover users success response body",
  {
    items: [
      {
        name: "John_doe7",
        firstName: "john",
        lastName: "doe",
        image: UPLOAD_THING_URL_EXAMPLE,
        imageKey: UPLOAD_THING_KEY_EXAMPLE,
        bio: "I'm a full-stack developer",
        email: "test@example.com",
        createdAt: new Date().toISOString() as unknown as Date,
        friendsCount: 10,
        snippetsCount: 100,
        tags: [{ name: "react-hooks" }, { name: "async-js" }],
      },
    ],
    total: 50,
    nextCursor: { snippetsCount: 41, id: 98 },
  } satisfies z.infer<typeof DiscoverUsersSuccessResponseBody>,
  "Fetched successfully"
);

export const DiscoverUsersResponseDto = z.discriminatedUnion("status", [
  DiscoverUsersSuccessResponseDto,
  BadRequestErrorResponseDto,
  RateLimiterErrorResponseDto,
  ...SharedErrorResDto,
]);

export type DiscoverUsersResponseDtoType = {
  success: z.infer<typeof DiscoverUsersSuccessResponseDto>;
  error:
    | SharedErrorResDtoType
    | BadRequestErrorResponseDtoType<DiscoverUsersRequestQueryDtoType>
    | RateLimiterErrorResponseDtoType;
};
