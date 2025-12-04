import { createSuccessResponse, GlobalErrorResponseDto, z } from "../zod";
import { SelectCollectionDto } from "./select-collection.dto";

// Delete Collection Request
export const DeleteCollectionRequestParamDto = z
  .object({
    slug: SelectCollectionDto.shape.slug,
  })
  .meta({
    id: "DeleteCollectionRequestParam",
    description: "Delete collection request param",
    example: {
      slug: "reactjs-custom-hooks",
    },
  });

export type DeleteCollectionRequestParamDtoType = z.infer<
  typeof DeleteCollectionRequestParamDto
>;

// Delete Collection Response
export const DeleteCollectionSuccessResDto = createSuccessResponse(
  z.null(),
  "DeleteCollectionSuccessResponseBody",
  "Delete collection success response body",
  null,
  "Collection has been deleted successfully"
);

export const DeleteCollectionResDto = z.discriminatedUnion("type", [
  DeleteCollectionSuccessResDto,
  GlobalErrorResponseDto,
]);

export type DeleteCollectionResDtoType = z.infer<typeof DeleteCollectionResDto>;
