import { createSuccessResponse, GlobalErrorResponseDto, z } from "../zod";
import { collectionExample, CommonMutationSchema } from "./common";
import { CreateCollectionRequestDto } from "./create-collection.dto";
import { SelectCollectionDto } from "./select-collection.dto";

// Update Collection Request
export const UpdateCollectionRequestParamDto = z
  .object({
    slug: SelectCollectionDto.shape.slug,
  })
  .meta({
    id: "UpdateCollectionRequestParam",
    description: "Update collection request param",
    example: {
      slug: "reactjs-custom-hooks",
    },
  });
export type UpdateCollectionRequestParamDtoType = z.infer<
  typeof UpdateCollectionRequestParamDto
>;

export const UpdateCollectionRequestBodyDto = CreateCollectionRequestDto.omit({
  tags: true,
})
  .extend({
    removeTags: CreateCollectionRequestDto.shape.tags,
    addTags: CreateCollectionRequestDto.shape.tags,
  })
  .partial()
  .meta({
    id: "UpdateCollectionRequestBody",
    description: "Update collection response body",
    example: {
      description: "Collection of reactjs custom hooks <edited>",
      color: "#000",
      removeTags: ["js"],
      addTags: ["javascript"],
    },
  });
export type UpdateCollectionRequestBodyDtoType = z.infer<
  typeof UpdateCollectionRequestBodyDto
>;

// Update Collection Response

const UpdateCollectionSuccessResponse = CommonMutationSchema;

export const UpdateCollectionSuccessResDto = createSuccessResponse(
  UpdateCollectionSuccessResponse,
  "UpdateCollectionSuccessResponseBody",
  "Update collection success response body",
  {
    ...collectionExample,
    updatedAt: new Date().toISOString() as unknown as Date,
  } satisfies z.infer<typeof UpdateCollectionSuccessResponse>,
  "Collection has been updated successfully."
);

export const UpdateCollectionResDto = z.discriminatedUnion("type", [
  UpdateCollectionSuccessResDto,
  GlobalErrorResponseDto,
]);

export type UpdateCollectionResDtoType = z.infer<typeof UpdateCollectionResDto>;
