import z from "zod";
import { SelectCollectionDto } from "./select-collection.dto";

export const ForkFolderDto = SelectCollectionDto.pick({
  slug: true,
});
export type ForkFolderDtoType = z.infer<typeof ForkFolderDto>;
