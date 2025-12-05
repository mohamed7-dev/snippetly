import { SelectCollectionDto } from "../collections/select-collection.dto";
import { createSuccessResponse, GlobalErrorResponseDto, z } from "../zod";
import { CommonSnippetMutationSchema, snippetExample } from "./common";
import { SelectSnippetDto } from "./select-snippet.dto";

// Fork Snippet Request

export const ForkSnippetRequestParamDto = SelectSnippetDto.pick({
  slug: true,
}).meta({
  id: "ForkSnippetRequestParam",
  description: "Fork snippet request params",
  example: {
    slug: "use-debounce-hook",
  },
});

export type ForkSnippetRequestParamDtoType = z.infer<
  typeof ForkSnippetRequestParamDto
>;

export const ForkSnippetRequestBodyDto = z
  .object({
    collectionSlug: SelectCollectionDto.shape.slug,
  })
  .meta({
    id: "ForkSnippetRequestBody",
    description: "Fork snippet request body",
    example: {
      collectionSlug: "react-interview",
    },
  });

export type ForkSnippetRequestBodyDtoType = z.infer<
  typeof ForkSnippetRequestBodyDto
>;

// Fork Snippet Response

const ForkSnippetSuccessRes = CommonSnippetMutationSchema.omit({
  updatedAt: true,
  forkedFromSlug: true,
}).extend({
  forkedFromSlug: z.string(),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { updatedAt, oldSlugs, ...forkSnippetResExample } = snippetExample;
export const ForkSnippetSuccessResDto = createSuccessResponse(
  ForkSnippetSuccessRes,
  "ForkSnippetSuccessResBody",
  "Fork snippet success response body",
  {
    ...forkSnippetResExample,
    forkedFromSlug: "use-debounce-hook",
  } satisfies z.infer<typeof ForkSnippetSuccessRes>,
  "Snippet has been forked successfully",
  200
);

export const ForkSnippetResDto = z.discriminatedUnion("type", [
  ForkSnippetSuccessResDto,
  GlobalErrorResponseDto,
]);

export type ForkSnippetResDtoType = z.infer<typeof ForkSnippetResDto>;
