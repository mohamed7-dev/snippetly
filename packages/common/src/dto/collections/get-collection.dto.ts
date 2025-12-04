import { createSuccessResponse, GlobalErrorResponseDto, z } from "../zod";
import { collectionExample, CommonUserCollectionsSchema } from "./common";
import { SelectCollectionDto } from "./select-collection.dto";

// Get Collection Request
export const GetCollectionRequestParamDto = z
  .object({
    slug: SelectCollectionDto.shape.slug,
  })
  .meta({
    id: "GetCollectionRequestParam",
    description: "Get collection request param",
    example: {
      slug: "react-custom-hooks",
    },
  });
export type GetCollectionRequestParamDtoType = z.infer<
  typeof GetCollectionRequestParamDto
>;

// Get Collection Response

const GetCollectionOwnerSuccessRes =
  CommonUserCollectionsSchema.shape.collections.unwrap().extend({
    snippetsCount: z.number(),
  });

export const GetCollectionOwnerSuccessResDto = createSuccessResponse(
  GetCollectionOwnerSuccessRes,
  "GetCollectionOwnerSuccessRes",
  "Get collection success response body when the current user is the owner of the collection",
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
  } satisfies z.infer<typeof GetCollectionOwnerSuccessRes>
);

const GetCollectionPublicSuccessRes =
  CommonUserCollectionsSchema.shape.collections
    .unwrap()
    .omit({
      forkedFrom: true,
      updatedAt: true,
      isPrivate: true,
    })
    .extend({
      snippetsCount: z.number(),
    });

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { isPrivate, ...publicRes } = collectionExample;

export const GetCollectionPublicSuccessResDto = createSuccessResponse(
  GetCollectionPublicSuccessRes,
  "GetCollectionPublicSuccessRes",
  "Get collection success response body when the current user is not the owner of the collection",
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
  } satisfies z.infer<typeof GetCollectionPublicSuccessRes>
);

export const GetCollectionResDto = z.discriminatedUnion("type", [
  GetCollectionOwnerSuccessResDto.extend({
    type: z.literal("owner-success"),
  }),
  GetCollectionPublicSuccessResDto.extend({
    type: z.literal("public-success"),
  }),
  GlobalErrorResponseDto,
]);

export type GetCollectionResDtoType = z.infer<typeof GetCollectionResDto>;
