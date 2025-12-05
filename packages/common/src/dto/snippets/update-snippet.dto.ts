import { createSuccessResponse, GlobalErrorResponseDto, z } from "../zod";
import { CommonSnippetMutationSchema, snippetExample } from "./common";
import { CreateSnippetRequestDto } from "./create-snippet.dto";
import { SelectSnippetDto } from "./select-snippet.dto";

// Update Snippet Request

export const UpdateSnippetRequestParamDto = z
  .object({
    slug: SelectSnippetDto.shape.slug,
  })
  .meta({
    id: "UpdateSnippetRequestParam",
    description: "Update snippet request param",
    example: {
      slug: "use-debounce-hook",
    },
  });

export type UpdateSnippetRequestParamDtoType = z.infer<
  typeof UpdateSnippetRequestParamDto
>;

export const UpdateSnippetRequestBodyDto = CreateSnippetRequestDto.omit({
  tags: true,
})
  .extend({
    addTags: CreateSnippetRequestDto.shape.tags,
    removeTags: CreateSnippetRequestDto.shape.tags,
  })
  .partial()
  .meta({
    id: "UpdateSnippetRequestBody",
    description: "Update snippet request body",
    example: {
      title: "{{updated_title}}",
    },
  });

export type UpdateSnippetRequestBodyDtoType = z.infer<
  typeof UpdateSnippetRequestBodyDto
>;

// Update Snippet Response
const UpdateSnippetSuccessRes = CommonSnippetMutationSchema;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { oldSlugs, ...updateSnippetResExample } = snippetExample;
export const UpdateSnippetSuccessResDto = createSuccessResponse(
  UpdateSnippetSuccessRes,
  "UpdateSnippetSuccessResBody",
  "Update snippet success response body",
  {
    ...updateSnippetResExample,
  },
  "Snippet has been updated successfully"
);

export const UpdateSnippetResDto = z.discriminatedUnion("type", [
  UpdateSnippetSuccessResDto,
  GlobalErrorResponseDto,
]);

export type UpdateSnippetResDtoType = z.infer<typeof UpdateSnippetResDto>;
