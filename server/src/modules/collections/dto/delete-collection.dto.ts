import z from "zod";
import { SelectCollectionDto } from "./select-collection.dto";

export const DeleteFolderDto = SelectCollectionDto.pick({ slug: true });

export type DeleteFolderDtoType = z.infer<typeof DeleteFolderDto>;
