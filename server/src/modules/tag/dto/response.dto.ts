import z from "zod";
import { SelectTagDto } from "./select-tag.dto";

export const GetPopularTagsResDto = z.array(
  SelectTagDto.pick({
    name: true,
  })
);

export type GetPopularTagsResDtoType = z.infer<typeof GetPopularTagsResDto>;
