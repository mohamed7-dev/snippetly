import { createSuccessResponse, GlobalErrorResponseDto, z } from "../zod";
import { SelectSnippetDto } from "./select-snippet.dto";

// Delete Snippet Request
export const DeleteSnippetRequestParamDto = z
  .object({
    slug: SelectSnippetDto.shape.slug,
  })
  .meta({
    id: "DeleteSnippetRequestParam",
    description: "Delete snippet request param",
    example: {
      slug: "use-debounce-hook",
    },
  });

export type DeleteSnippetRequestParamDtoType = z.infer<
  typeof DeleteSnippetRequestParamDto
>;

// Delete Snippet Response
export const DeleteSnippetSuccessResDto = createSuccessResponse(
  z.null(),
  "DeleteSnippetSuccessResBody",
  "Delete snippet success response body",
  null,
  "Snippet has been deleted successfully"
);

export const DeleteSnippetResDto = z.discriminatedUnion("type", [
  DeleteSnippetSuccessResDto,
  GlobalErrorResponseDto,
]);

export type DeleteSnippetResDtoType = z.infer<typeof DeleteSnippetResDto>;
