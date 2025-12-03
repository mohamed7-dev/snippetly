import { SelectTagDto } from "../tags/select-tag.dto";
import { createSuccessResponse, GlobalErrorResponseDto, z } from "../zod";
import { CommonUserResDto, CommonUserResDtoExample } from "./common";

// Discover Users Request
export const DiscoverUsersRequestQueryDto = z
  .object({
    limit: z.number().min(1).max(100).optional(),
    cursor: z
      .string()
      .transform((val) => {
        try {
          const parsed = JSON.parse(val) as {
            snippetsCount: number;
            id: number;
          };
          return {
            snippetsCount: Number(parsed.snippetsCount),
            id: Number(parsed.id),
          };
        } catch {
          throw new Error("cursor must be a valid JSON string");
        }
      })
      .optional(),
    query: z.string().nonempty().optional(),
  })
  .meta({
    id: "DiscoverUsersRequestQuery",
    description: "Discover users request query params",
    example: {
      limit: 10,
      cursor: {
        snippetsCount: 50,
        id: 8,
      },
      query: "{{user name or email}}",
    },
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { emailVerifiedAt, isPrivate, updatedAt, ...rest } =
  CommonUserResDtoExample;
export const DiscoverUsersSuccessResponseDto = createSuccessResponse(
  z.object({
    items: DiscoverUsersSuccessResponse,
    total: z.number(),
    nextCursor: DiscoverUsersRequestQueryDto.shape.cursor,
  }),
  "DiscoverUsersSuccessResponseBody",
  "Discover users success response body",
  {
    items: [
      {
        ...rest,
        friendsCount: 10,
        snippetsCount: 100,
        tags: [{ name: "react-hooks" }, { name: "async-js" }],
      },
    ],
    total: 50,
    nextCursor: { snippetsCount: 41, id: 98 },
  },
  "Fetched successfully"
);

export type DiscoverUsersSuccessResponseDtoType = z.infer<
  typeof DiscoverUsersSuccessResponseDto
>;

export const DiscoverUsersResponseDto = z.discriminatedUnion("type", [
  DiscoverUsersSuccessResponseDto,
  GlobalErrorResponseDto,
]);

export type DiscoverUsersResponseDtoType = z.infer<
  typeof DiscoverUsersResponseDto
>;
