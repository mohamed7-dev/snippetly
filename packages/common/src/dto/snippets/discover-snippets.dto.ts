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

// Discover Snippets Request

export const DiscoverSnippetsRequestQueryDto = z
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
    id: "DiscoverSnippetsRequestQuery",
    description: "Discover snippets request query params",
    example: {
      limit: 10,
      cursor: undefined,
      query: undefined,
    },
  });

export type DiscoverSnippetsRequestQueryDtoType = z.infer<
  typeof DiscoverSnippetsRequestQueryDto
>;

// Discover Snippets Response
const DiscoverSnippetsSuccessRes = z.object({
  items: z.array(
    SelectSnippetDto.pick({
      title: true,
      slug: true,
      code: true,
      language: true,
      allowForking: true,
      description: true,
      createdAt: true,
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
    })
  ),
  total: z.number(),
  nextCursor: DiscoverSnippetsRequestQueryDto.shape.cursor,
});

export const DiscoverSnippetsSuccessResDto = createSuccessResponse(
  DiscoverSnippetsSuccessRes,
  "DiscoverSnippetsSuccessResBody",
  "Discover snippets success response body",
  {
    total: 1,
    nextCursor: undefined,
    items: [
      {
        title: "Singleton pattern in js",
        slug: "singleton-pattern-in-js",
        code: "{{code}}",
        language: "javascript",
        allowForking: true,
        createdAt: new Date().toISOString() as unknown as Date,
        forkedCount: 10,
        creator: {
          name: "john_doe90",
          firstName: "john",
          lastName: "doe",
          image: null,
        },
        collection: {
          title: "oop design patterns",
          slug: "oop-design-patterns",
          color: "#000",
        },
        tags: [{ name: "js" }, { name: "design-patterns" }],
      },
    ],
  } satisfies z.infer<typeof DiscoverSnippetsSuccessRes>,
  "Fetched successfully"
);

export const DiscoverSnippetsResDto = z.discriminatedUnion("type", [
  DiscoverSnippetsSuccessResDto,
  GlobalErrorResponseDto,
]);

export type DiscoverSnippetsResDtoType = z.infer<typeof DiscoverSnippetsResDto>;
