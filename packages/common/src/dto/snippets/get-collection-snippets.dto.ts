import { SelectCollectionDto } from "../collections/select-collection.dto";
import { SelectTagDto } from "../tags/select-tag.dto";
import { SelectUserDto } from "../user";
import {
  createSuccessResponse,
  GlobalErrorResponseDto,
  LIMIT_SCHEMA,
  z,
} from "../zod";
import { snippetExample } from "./common";
import { SelectSnippetDto } from "./select-snippet.dto";

// Get Collection Snippets Request

export const GetCollectionSnippetsRequestQueryDto = z.object({
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
});

export type GetCollectionSnippetsRequestQueryDtoType = z.infer<
  typeof GetCollectionSnippetsRequestQueryDto
>;

export const GetCollectionSnippetsRequestParamDto = z.object({
  collectionSlug: SelectCollectionDto.shape.slug,
});

export type GetCollectionSnippetsRequestParamDtoType = z.infer<
  typeof GetCollectionSnippetsRequestParamDto
>;

// Get Collection Snippets Response

const BaseSnippetsCollectionSchema = z.object({
  snippet: SelectSnippetDto.pick({
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
    forkedFromSlug: z.string().nullish(),
    tags: z.array(SelectTagDto.pick({ name: true })),
    creator: SelectUserDto.pick({
      name: true,
      firstName: true,
      lastName: true,
      image: true,
    }),
  }),
  collection: SelectCollectionDto.pick({
    title: true,
    slug: true,
    color: true,
  }),
});

const GetCollectionSnippetsSuccessOwnerRes = z.object({
  items: z.object({
    snippets: z.array(BaseSnippetsCollectionSchema.shape.snippet),
    collection: BaseSnippetsCollectionSchema.shape.collection,
  }),
  total: z.number(),
  nextCursor: GetCollectionSnippetsRequestQueryDto.shape.cursor,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { creatorName, collectionSlug, oldSlugs, ...ownerExample } =
  snippetExample;
export const GetCollectionSnippetsSuccessOwnerResDto = createSuccessResponse(
  GetCollectionSnippetsSuccessOwnerRes,
  "GetCollectionSnippetsSuccessOwnerResBody",
  "Get collection snippets success response body tailored to the owner user",
  {
    total: 1,
    nextCursor: undefined,
    items: {
      snippets: [
        {
          ...ownerExample,
          tags: [{ name: "reactjs" }],
          creator: { name: creatorName, firstName: "john", lastName: "doe" },
        },
      ],
      collection: {
        title: "reactjs hooks",
        slug: collectionSlug,
        color: "#eee",
      },
    },
  } satisfies z.infer<typeof GetCollectionSnippetsSuccessOwnerRes>,
  "Fetched successfully"
)
  .omit({
    type: true,
  })
  .extend({
    type: z.literal("owner-success"),
  });

const GetCollectionSnippetsSuccessPublicRes = z.object({
  total: z.number(),
  nextCursor: GetCollectionSnippetsRequestQueryDto.shape.cursor,
  items: z.object({
    snippets: z.array(
      BaseSnippetsCollectionSchema.shape.snippet.omit({
        isPrivate: true,
        updatedAt: true,
        forkedFromSlug: true,
      })
    ),
  }),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { updatedAt, forkedFromSlug, isPrivate, ...publicExample } = ownerExample;
export const GetCollectionSnippetsSuccessPublicResDto = createSuccessResponse(
  GetCollectionSnippetsSuccessPublicRes,
  "GetCollectionSnippetsSuccessPublicResBody",
  "Get collection snippets success response body tailored to public view",
  {
    total: 1,
    nextCursor: undefined,
    items: {
      snippets: [
        {
          ...publicExample,
          tags: [{ name: "reactjs" }],
          creator: { name: creatorName, firstName: "john", lastName: "doe" },
        },
      ],
    },
  } satisfies z.infer<typeof GetCollectionSnippetsSuccessPublicRes>,
  "Fetched successfully"
).extend({
  type: z.literal("public-success"),
});

export const GetCollectionSnippetsResDto = z.discriminatedUnion("type", [
  GetCollectionSnippetsSuccessOwnerResDto,
  GetCollectionSnippetsSuccessPublicResDto,
  GlobalErrorResponseDto,
]);

export type GetCollectionSnippetsResDtoType = z.infer<
  typeof GetCollectionSnippetsResDto
>;
