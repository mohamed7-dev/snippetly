import z from "zod";
import { SelectFolderDto } from "../../folder/dto/select-folder.dto";

export const ForkFolderDto = SelectFolderDto.pick({
  code: true,
});
export type ForkFolderDtoType = z.infer<typeof ForkFolderDto>;
