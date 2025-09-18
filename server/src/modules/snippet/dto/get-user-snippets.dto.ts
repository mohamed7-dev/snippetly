import z from "zod";
import { SelectUserDto } from "../../user/dto/select-user.dto";

export const GetUserSnippetsDto = z.object({
  limit: z.number().min(1).max(100).optional(),
  cursor: z
    .string()
    .transform((val) => {
      try {
        return { updatedAt: new Date(JSON.parse(val).updatedAt) };
      } catch {
        throw new Error("cursor must be a valid JSON string");
      }
    })
    .optional(),
  query: z.string().nonempty().optional(),
  creatorName: SelectUserDto.shape.name,
});

export type GetUserSnippetsDtoType = z.infer<typeof GetUserSnippetsDto>;
