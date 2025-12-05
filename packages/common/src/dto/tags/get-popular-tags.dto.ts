import { createSuccessResponse, GlobalErrorResponseDto, z } from "../zod";
import { SelectTagDto } from "./select-tag.dto";

// Response Schema
const GetPopularTagsRes = z.array(
  SelectTagDto.pick({
    name: true,
  })
);

export const GetPopularTagsSuccessResDto = createSuccessResponse(
  GetPopularTagsRes,
  "GetPopularTagsSuccessResBody",
  "Get popular tags success response body",
  [
    { name: "reactjs" },
    { name: "reactjs-hooks" },
    { name: "async-js" },
    { name: "ts-utils" },
    { name: "python" },
  ],
  "Fetched successfully."
);

export const GetPopularTagsResDto = z.discriminatedUnion("type", [
  GetPopularTagsSuccessResDto,
  GlobalErrorResponseDto,
]);

export type GetPopularTagsResDtoType = z.infer<typeof GetPopularTagsResDto>;
