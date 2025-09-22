import z from "zod";
import { SelectTagDto } from "./select-tag.dto.js";
export const GetPopularTagsResDto = z.array(SelectTagDto.pick({
    name: true
}));
