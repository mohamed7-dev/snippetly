import { SelectCollectionDto } from "../collections/select-collection.dto";
import { SelectTagDto } from "../tags/select-tag.dto";
import { createSuccessResponse, GlobalErrorResponseDto, z } from "../zod";
import { CommonSnippetMutationSchema, snippetExample } from "./common";
import { SelectSnippetDto } from "./select-snippet.dto";

// Create Snippet Request
export const CreateSnippetRequestDto = SelectSnippetDto.pick({
  title: true,
  code: true,
  language: true,
  description: true,
  note: true,
  isPrivate: true,
  allowForking: true,
})
  .extend({
    tags: z.array(SelectTagDto.shape.name).optional(),
    collectionSlug: SelectCollectionDto.shape.slug,
  })
  .meta({
    id: "CreateSnippetRequestBody",
    description: "Create snippet request body",
    example: {
      title: "useDebounce hook",
      description: "custom react hook that debounces rendering",
      isPrivate: false,
      allowForking: true,
      collectionSlug: "reactjs hooks",
      code: `{{code}}`,
      language: "typescript",
      tags: ["reactjs"],
    },
  });

export type CreateSnippetRequestDtoType = z.infer<
  typeof CreateSnippetRequestDto
>;

// Create Snippet Response

const CreateSnippetSuccessRes = CommonSnippetMutationSchema.omit({
  updatedAt: true,
  forkedFromSlug: true,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { forkedFromSlug, updatedAt, oldSlugs, ...createSnippetResExample } =
  snippetExample;
export const CreateSnippetSuccessResDto = createSuccessResponse(
  CreateSnippetSuccessRes,
  "CreateSnippetSuccessResBody",
  "Create snippet success response body",
  {
    ...createSnippetResExample,
  } satisfies z.infer<typeof CreateSnippetSuccessRes>,
  "Snippet has been created successfully",
  201
);

export const CreateSnippetResDto = z.discriminatedUnion("type", [
  CreateSnippetSuccessResDto,
  GlobalErrorResponseDto,
]);

export type CreateSnippetResDtoType = z.infer<typeof CreateSnippetResDto>;
