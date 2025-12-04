import { SelectSnippetDto } from "../snippets/select-snippet.dto";
import { SelectTagDto } from "../tags/select-tag.dto";
import { SelectUserDto } from "../user";
import {
  createSuccessResponse,
  GlobalErrorResponseDto,
  LIMIT_SCHEMA,
  z,
} from "../zod";
import { SelectCollectionDto } from "./select-collection.dto";

// Discover Collections Request
export const DiscoverCollectionsRequestQueryDto = z
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
    id: "DiscoverCollectionsRequestQuery",
    description: "Discover collections request query params",
    example: {
      limit: 2,
      cursor: {
        updatedAt: new Date().toISOString(),
      },
      query: "{{collection_title}}",
    },
  });

export type DiscoverCollectionsRequestQueryDtoType = z.infer<
  typeof DiscoverCollectionsRequestQueryDto
>;

// Discover Collections Response
const DiscoverCollectionsSuccessRes = z.object({
  items: z.array(
    SelectCollectionDto.omit({
      isPrivate: true,
      id: true,
      creatorId: true,
      forkedFrom: true,
      updatedAt: true,
      oldSlugs: true,
    }).extend({
      creator: SelectUserDto.pick({
        name: true,
        firstName: true,
        lastName: true,
        image: true,
      }),
      tags: z.array(SelectTagDto.pick({ name: true })),
      forkedCount: z.number(),
      snippetsCount: z.number(),
      snippets: z.array(
        SelectSnippetDto.pick({
          title: true,
          slug: true,
          language: true,
          createdAt: true,
        })
      ),
    })
  ),
  nextCursor: DiscoverCollectionsRequestQueryDto.shape.cursor,
  total: z.number(),
});

export const DiscoverCollectionsSuccessResDto = createSuccessResponse(
  DiscoverCollectionsSuccessRes,
  "DiscoverCollectionsSuccessResBody",
  "Discover collections success response body",
  {
    total: 1000,
    nextCursor: { updatedAt: new Date().toISOString() as unknown as Date },
    items: [
      {
        title: "typescript utilities",
        slug: "typescript-utilities",
        createdAt: new Date().toISOString() as unknown as Date,
        color: "#ddd",
        allowForking: true,
        creator: {
          name: "mo_ali7",
          firstName: "mohamed",
          lastName: "ali",
          image: null,
        },
        tags: [{ name: "typescript" }, { name: "utilities" }],
        forkedCount: 10,
        snippetsCount: 1,
        snippets: [
          {
            title: "NonNullable field",
            slug: "nonNullable-field",
            language: "typescript",
            createdAt: new Date().toISOString() as unknown as Date,
          },
        ],
      },
      {
        title: "docker",
        slug: "docker",
        createdAt: new Date().toISOString() as unknown as Date,
        color: "#abc",
        allowForking: false,
        creator: {
          name: "omar2030",
          firstName: "omar",
          lastName: "ahmed",
          image: "https://uplaodthing...",
        },
        tags: [{ name: "docker" }, { name: "dev-ops" }],
        forkedCount: 0,
        snippetsCount: 1,
        snippets: [
          {
            title: "How to compose postgres database?",
            slug: "how-to-compose-postgres-database",
            language: "docker",
            createdAt: new Date().toISOString() as unknown as Date,
          },
        ],
      },
    ],
  } satisfies z.infer<typeof DiscoverCollectionsSuccessRes>,
  "Fetched successfully"
);

export const DiscoverCollectionsResDto = z.discriminatedUnion("type", [
  DiscoverCollectionsSuccessResDto,
  GlobalErrorResponseDto,
]);

export type DiscoverCollectionsResDtoType = z.infer<
  typeof DiscoverCollectionsResDto
>;
