import z from "zod";
import { SelectFolderDto } from "./select-folder.dto";

export const DeleteFolderDto = SelectFolderDto.pick({ code: true });

export type DeleteFolderDtoType = z.infer<typeof DeleteFolderDto>;
