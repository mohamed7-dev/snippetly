import { SelectTagDto } from "../tags/select-tag.dto";
import { createSuccessResponse, GlobalErrorResponseDto, z } from "../zod";
import { collectionExample, CommonMutationSchema } from "./common";
import { SelectCollectionDto } from "./select-collection.dto";

// Create collection request
export const CreateCollectionRequestDto = SelectCollectionDto.pick({
  title: true,
  description: true,
  allowForking: true,
  isPrivate: true,
  color: true,
})
  .extend({
    tags: z.array(SelectTagDto.shape.name).optional(),
  })
  .meta({
    id: "CreateCollectionRequestBody",
    description: "Create collection request body",
    example: {
      title: "React custom hooks",
      description: "Collection of reactjs custom hooks",
      allowForking: true,
      isPrivate: false,
      color: "#eee",
      tags: ["js", "reactjs", "react-hooks"],
    },
  });

export type CreateCollectionRequestDtoType = z.infer<
  typeof CreateCollectionRequestDto
>;

// Create collection response
const CreateCollectionSuccessRes = CommonMutationSchema.omit({
  forkedFrom: true,
  updatedAt: true,
});

export const CreateCollectionSuccessResDto = createSuccessResponse(
  CreateCollectionSuccessRes,
  "CreateCollectionSuccessResBody",
  "Create collection success response body",
  {
    ...collectionExample,
  } satisfies z.infer<typeof CreateCollectionSuccessRes>,
  "Collection has been created successfully.",
  201
);

export const CreateCollectionResponseDto = z.discriminatedUnion("type", [
  CreateCollectionSuccessResDto,
  GlobalErrorResponseDto,
]);

export type CreateCollectionResponseDtoType = z.infer<
  typeof CreateCollectionResponseDto
>;
