import z from "zod";
import { SelectCollectionDto } from "./select-collection.dto";

export const DeleteCollectionDto = SelectCollectionDto.pick({ code: true });

export type DeleteCollectionDtoType = z.infer<typeof DeleteCollectionDto>;
