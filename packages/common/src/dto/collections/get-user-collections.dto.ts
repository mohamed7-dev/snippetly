import { SelectUserDto } from "../user";
import {
  createSuccessResponse,
  GlobalErrorResponseDto,
  LIMIT_SCHEMA,
  z,
} from "../zod";
import { collectionExample, CommonUserCollectionsSchema } from "./common";

// Get User Collections Request

export const GetUserCollectionsRequestQueryDto = z
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
    id: "GetUserCollectionRequestQuery",
    description: "Get user collections request query params",
    example: {
      limit: 10,
      cursor: {
        updatedAt: new Date().toISOString(),
      },
      query: "{{collection name}}",
    },
  });
export type GetUserCollectionsRequestQueryDtoType = z.infer<
  typeof GetUserCollectionsRequestQueryDto
>;

export const GetUserCollectionsRequestParamDto = z
  .object({
    creatorName: SelectUserDto.shape.name,
  })
  .meta({
    id: "GetUserCollectionRequestParams",
    description: "Get user collections request params",
    example: {
      creatorName: "john_doe7",
    },
  });

export type GetUserCollectionsRequestParamDtoType = z.infer<
  typeof GetUserCollectionsRequestParamDto
>;

// Get User Collections Response
// Common Schema

const GetUserCollectionsOwnerSuccessRes = z.object({
  total: z.number(),
  nextCursor: GetUserCollectionsRequestQueryDto.shape.cursor,
  items: z.object({
    collections: CommonUserCollectionsSchema.shape.collections,
    stats: CommonUserCollectionsSchema.shape.stats,
  }),
});

export const GetUserCollectionsOwnerSuccessResDto = createSuccessResponse(
  GetUserCollectionsOwnerSuccessRes,
  "GetUserCollectionsOwnerSuccessRes",
  "Get user collections success response body when the current user is the owner of the collections",
  {
    total: 1,
    nextCursor: undefined,
    items: {
      stats: {
        totalCollections: 1,
        publicCollections: 1,
        totalSnippets: 10,
        forkedCollections: 0,
      },
      collections: [
        {
          ...collectionExample,
          updatedAt: new Date() as unknown as Date,
          snippetsCount: 10,
          creator: {
            name: "john_doe20",
            firstName: "john",
            lastName: "doe",
            image: "https://uploadthing...",
          },
          tags: [{ name: "reactjs" }, { name: "javascript" }],
          snippets: [
            {
              title: "useDebounce hook",
              slug: "useDebounce-hook",
              language: "javascript",
              createdAt: new Date().toISOString() as unknown as Date,
            },
          ],
        },
      ],
    },
  } satisfies z.infer<typeof GetUserCollectionsOwnerSuccessRes>
);

const GetUserCollectionsPublicSuccessRes = z.object({
  total: z.number(),
  nextCursor: GetUserCollectionsRequestQueryDto.shape.cursor,
  items: z.object({
    stats: CommonUserCollectionsSchema.shape.stats,
    collections: z.array(
      CommonUserCollectionsSchema.shape.collections.unwrap().omit({
        forkedFrom: true,
        updatedAt: true,
        isPrivate: true,
      })
    ),
  }),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { isPrivate, ...publicRes } = collectionExample;
export const GetUserCollectionsPublicSuccessResDto = createSuccessResponse(
  GetUserCollectionsPublicSuccessRes,
  "GetUserCollectionsPublicSuccessRes",
  "Get user collections success response body when the current user is not the owner of the collections",
  {
    total: 1,
    nextCursor: undefined,
    items: {
      stats: {
        totalCollections: 1,
        publicCollections: 1,
        totalSnippets: 10,
        forkedCollections: 0,
      },
      collections: [
        {
          ...publicRes,
          snippetsCount: 10,
          creator: {
            name: "john_doe20",
            firstName: "john",
            lastName: "doe",
            image: "https://uploadthing...",
          },
          tags: [{ name: "reactjs" }, { name: "javascript" }],
          snippets: [
            {
              title: "useDebounce hook",
              slug: "useDebounce-hook",
              language: "javascript",
              createdAt: new Date().toISOString() as unknown as Date,
            },
          ],
        },
      ],
    },
  } satisfies z.infer<typeof GetUserCollectionsPublicSuccessRes>
);

export const GetUserCollectionsResDto = z.discriminatedUnion("type", [
  GetUserCollectionsOwnerSuccessResDto.extend({
    type: z.literal("owner-success"),
  }),
  GetUserCollectionsPublicSuccessResDto.extend({
    type: z.literal("public-success"),
  }),
  GlobalErrorResponseDto,
]);

export type GetUserCollectionsResDtoType = z.infer<
  typeof GetUserCollectionsResDto
>;
