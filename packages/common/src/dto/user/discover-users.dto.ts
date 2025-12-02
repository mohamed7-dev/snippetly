import { SelectTagDto } from "../tags/select-tag.dto";
import { createSuccessResponse, GlobalErrorResponseDto, z } from "../zod";
import { CommonUserResDto, CommonUserResDtoExample } from "./common";

// Discover Users Request
export const DiscoverUsersRequestQueryDto = z.object({
  limit: z.number().min(1).max(100).optional(),
  cursor: z
    .string()
    .transform((val) => {
      try {
        const parsed = JSON.parse(val) as { snippetsCount: number; id: number };
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
  DiscoverUsersSuccessResponse,
  "DiscoverUsersSuccessResponseBody",
  "Discover users success response body",
  {
    ...rest,
    friendsCount: 10,
    snippetsCount: 100,
    tags: [{ name: "react-hooks" }, { name: "async-js" }],
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
