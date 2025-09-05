import z from "zod";
import { SelectCollectionDto } from "./select-collection.dto";

export const CreateCollectionDto = SelectCollectionDto.pick({ title: true });

export type CreateCollectionDtoType = z.infer<typeof CreateCollectionDto>;
