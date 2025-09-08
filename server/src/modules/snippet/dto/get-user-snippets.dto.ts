import z from "zod";
import { SelectUserDto } from "../../user/dto/select-user.dto";

export const GetUserSnippetsDto = z.object({
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
  name: SelectUserDto.shape.name,
});

export type GetUserSnippetsDtoType = z.infer<typeof GetUserSnippetsDto>;
