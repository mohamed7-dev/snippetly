import { createSuccessResponse, GlobalErrorResponseDto, z } from "../zod";
import { CommonUserSnippetsResSchema, snippetExample } from "./common";
import { SelectSnippetDto } from "./select-snippet.dto";

// Get Snippet Request
export const GetSnippetRequestParamDto = z
  .object({
    slug: SelectSnippetDto.shape.slug,
  })
  .meta({
    id: "GetSnippetRequestParam",
    description: "Get snippet request param",
    example: {
      slug: "use-debounce-hook",
    },
  });
export type GetSnippetRequestParamDtoType = z.infer<
  typeof GetSnippetRequestParamDto
>;

// Get Snippet Response

const GetSnippetSuccessOwnerRes = CommonUserSnippetsResSchema;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { oldSlugs, ...ownerSnippetRes } = snippetExample;
export const GetSnippetSuccessOwnerResDto = createSuccessResponse(
  GetSnippetSuccessOwnerRes,
  "GetSnippetSuccessOwnerResBody",
  "Get snippet success response body tailored to the owner user",
  { ...ownerSnippetRes },
  "Fetched successfully"
);

const GetSnippetSuccessPublicRes = CommonUserSnippetsResSchema.omit({
  isPrivate: true,
  updatedAt: true,
  forkedFromSlug: true,
});

// prettier-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { oldSlugs: oldSlugsPublic,isPrivate,updatedAt,forkedFromSlug, ...publicSnippetRes } = snippetExample;

export const GetSnippetSuccessPublicResDto = createSuccessResponse(
  GetSnippetSuccessPublicRes,
  "GetSnippetSuccessPublicResBody",
  "Get snippet success response body tailored to public view",
  { ...publicSnippetRes },
  "Fetched successfully"
);

export const GetSnippetResDto = z.discriminatedUnion("type", [
  GetSnippetSuccessOwnerResDto.extend({
    type: z.literal("owner-success"),
  }),
  GetSnippetSuccessPublicResDto.extend({
    type: z.literal("public-success"),
  }),
  GlobalErrorResponseDto,
]);

export type GetSnippetResDtoType = z.infer<typeof GetSnippetResDto>;
