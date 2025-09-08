import z from "zod";
import { SelectUserDto } from "../../user/dto/select-user.dto";
import { SelectFolderDto } from "./select-folder.dto";

export const FindFoldersDto = z.object({
  limit: z.number().min(1).max(100).optional(),
  cursor: z
    .object({
      updatedAt: z
        .string()
        .transform((val) => new Date(val))
        .refine((date) => !isNaN(date.getTime()), {
          message: "cursor.updatedAt must be a valid date",
        }),
    })
    .optional(),
  query: z.string().nonempty().optional(),
  owner: SelectUserDto.shape.name,
});

export type FindFoldersDtoType = z.infer<typeof FindFoldersDto>;

// Find one
export const FindFolderDto = z.object({
  code: SelectFolderDto.shape.code,
});
export type FindFolderDtoType = z.infer<typeof FindFolderDto>;
