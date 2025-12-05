import { SelectCollectionDto } from "../collections/select-collection.dto";
import { SelectTagDto } from "../tags/select-tag.dto";
import { SelectUserDto } from "../user";
import {
  createSuccessResponse,
  GlobalErrorResponseDto,
  LIMIT_SCHEMA,
  z,
} from "../zod";
import { SelectSnippetDto } from "./select-snippet.dto";

// Get User Collections Request

export const GetUserSnippetsRequestQueryDto = z
  .object({
    limit: LIMIT_SCHEMA,
    cursor: z
      .string()
      .transform((val) => {
        try {
          return { updatedAt: new Date(JSON.parse(val).updatedAt) };
        } catch {
          throw new Error("cursor must be a valid JSON string");
        }
      })
      .optional(),
    query: z.string().nonempty().optional(),
  })
  .meta({
    id: "GetUserSnippetsRequestQuery",
    description: "Get user snippets request query params",
    example: {
      limit: 5,
      cursor: undefined,
      query: "{{snippet title}}",
    },
  });

export type GetUserSnippetsRequestQueryDtoType = z.infer<
  typeof GetUserSnippetsRequestQueryDto
>;

export const GetUserSnippetsRequestParamDto = z
  .object({
    creatorName: SelectUserDto.shape.name,
  })
  .meta({
    id: "GetUserSnippetsRequestParam",
    description: "Get user snippets request param",
    example: {
      creatorName: "john_doe40",
    },
  });

export type GetUserSnippetsRequestParamDtoType = z.infer<
  typeof GetUserSnippetsRequestParamDto
>;

// Get User Snippets Response

const CommonUserSnippetsSchema = SelectSnippetDto.pick({
  createdAt: true,
  updatedAt: true,
  title: true,
  slug: true,
  code: true,
  language: true,
  description: true,
  isPrivate: true,
  allowForking: true,
}).extend({
  forkedCount: z.number(),
  creator: SelectUserDto.pick({
    name: true,
    firstName: true,
    lastName: true,
    image: true,
  }),
  collection: SelectCollectionDto.pick({
    title: true,
    slug: true,
    color: true,
  }),
  tags: z.array(SelectTagDto.pick({ name: true })),
  forkedFromSlug: z.string().nullish(),
});

const GetUserSnippetsSuccessOwnerRes = z.object({
  items: z.array(CommonUserSnippetsSchema),
  total: z.number(),
  nextCursor: GetUserSnippetsRequestQueryDto.shape.cursor,
});

export const GetUserSnippetsSuccessOwnerResDto = createSuccessResponse(
  GetUserSnippetsSuccessOwnerRes,
  "GetUserSnippetsSuccessOwnerResBody",
  "Get user snippets success response when the current user is the owner",
  {
    total: 1,
    nextCursor: { updatedAt: new Date().toISOString() as unknown as Date },
    items: [
      {
        createdAt: new Date().toISOString() as unknown as Date,
        updatedAt: new Date().toISOString() as unknown as Date,
        title: "useFetch hook",
        slug: "use-fetch-hook",
        code: "{{code}}",
        language: "javascript",
        description: "hook to fetch data",
        isPrivate: true,
        allowForking: true,
        forkedCount: 0,
        creator: {
          name: "john_doe40",
          firstName: "john",
          lastName: "doe",
          image: null,
        },
        collection: {
          title: "use hooks",
          slug: "use-hooks",
          color: "#666",
        },
        tags: [{ name: "js" }, { name: "reactjs" }],
        forkedFromSlug: null,
      },
    ],
  } satisfies z.infer<typeof GetUserSnippetsSuccessOwnerRes>,
  "Fetched successfully"
);

const GetUserSnippetsSuccessPublicRes = z.object({
  items: z.array(
    CommonUserSnippetsSchema.omit({
      updatedAt: true,
      forkedFromSlug: true,
      isPrivate: true,
    })
  ),
  total: z.number(),
  nextCursor: GetUserSnippetsRequestQueryDto.shape.cursor,
});

export const GetUserSnippetsSuccessPublicResDto = createSuccessResponse(
  GetUserSnippetsSuccessPublicRes,
  "GetUserSnippetsSuccessPublicResBody",
  "Get user snippets success response when there is no current user or the current user is not the owner",
  {
    total: 1,
    nextCursor: { updatedAt: new Date().toISOString() as unknown as Date },
    items: [
      {
        createdAt: new Date().toISOString() as unknown as Date,
        title: "useFetch hook",
        slug: "use-fetch-hook",
        code: "{{code}}",
        language: "javascript",
        description: "hook to fetch data",
        allowForking: true,
        forkedCount: 0,
        creator: {
          name: "john_doe40",
          firstName: "john",
          lastName: "doe",
          image: null,
        },
        collection: {
          title: "use hooks",
          slug: "use-hooks",
          color: "#666",
        },
        tags: [{ name: "js" }, { name: "reactjs" }],
      },
    ],
  } satisfies z.infer<typeof GetUserSnippetsSuccessPublicRes>,
  "Fetched successfully"
);

export const GetUserSnippetsResDto = z.discriminatedUnion("type", [
  GetUserSnippetsSuccessOwnerResDto.extend({
    type: z.literal("owner-success"),
  }),
  GetUserSnippetsSuccessPublicResDto.extend({
    type: z.literal("public-success"),
  }),
  GlobalErrorResponseDto,
]);

export type GetUserSnippetsResDtoType = z.infer<typeof GetUserSnippetsResDto>;

const GetUserFriendsSnippetsSuccessRes = z.object({
  items: z.array(
    CommonUserSnippetsSchema.omit({
      updatedAt: true,
      isPrivate: true,
      forkedFromSlug: true,
    })
  ),
  total: z.number(),
  nextCursor: GetUserSnippetsRequestQueryDto.shape.cursor,
});

export const GetUserFriendsSnippetsSuccessResDto = createSuccessResponse(
  GetUserFriendsSnippetsSuccessRes,
  "GetUserFriendsSnippetsSuccessResBody",
  "Get user friends' snippets success response",
  {
    total: 1,
    nextCursor: undefined,
    items: [
      {
        createdAt: new Date().toISOString() as unknown as Date,
        title: "useDebounce hook",
        slug: "use-debounce-hook",
        code: "{{code}}",
        language: "javascript",
        description: "hook to debounce frequent re-renders",
        allowForking: false,
        forkedCount: 0,
        creator: {
          name: "john_doe20",
          firstName: "john",
          lastName: "doe",
          image: "https://uploadthing...",
        },
        collection: {
          title: "react hooks",
          slug: "react-hooks",
          color: "#fe0",
        },
        tags: [{ name: "reactjs" }],
      },
    ],
  } satisfies z.infer<typeof GetUserFriendsSnippetsSuccessRes>,
  "Fetched successfully"
);

export const GetUserFriendsSnippetsResDto = z.discriminatedUnion("type", [
  GetUserFriendsSnippetsSuccessResDto,
  GlobalErrorResponseDto,
]);

export type GetUserFriendsSnippetsResDtoType = z.infer<
  typeof GetUserFriendsSnippetsResDto
>;
