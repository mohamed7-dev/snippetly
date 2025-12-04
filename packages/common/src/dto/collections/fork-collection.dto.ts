import { createSuccessResponse, GlobalErrorResponseDto, z } from "../zod";
import { collectionExample, CommonMutationSchema } from "./common";
import { SelectCollectionDto } from "./select-collection.dto";

// Fork Collection Request
export const ForkCollectionRequestParamDto = z
  .object({
    slug: SelectCollectionDto.shape.slug,
  })
  .meta({
    id: "ForkCollectionRequestParam",
    description: "Fork collection request param",
    example: {
      slug: "reactjs-custom-hooks",
    },
  });

export type ForkCollectionRequestParamDtoType = z.infer<
  typeof ForkCollectionRequestParamDto
>;

// Fork Collection Response

const ForkCollectionSuccessRes = CommonMutationSchema.omit({
  updatedAt: true,
}).required({
  forkedFrom: true,
});

export const ForkCollectionSuccessResDto = createSuccessResponse(
  ForkCollectionSuccessRes,
  "ForkCollectionSuccessResponseBody",
  "Fork collection success response body",
  {
    ...collectionExample,
    forkedFrom: "reactjs-custom-hooks",
  } satisfies z.infer<typeof ForkCollectionSuccessRes>,
  "Collection has been forked successfully."
);

export const ForkCollectionResDto = z.discriminatedUnion("type", [
  ForkCollectionSuccessResDto,
  GlobalErrorResponseDto,
]);

export type ForkCollectionResDtoType = z.infer<typeof ForkCollectionResDto>;
