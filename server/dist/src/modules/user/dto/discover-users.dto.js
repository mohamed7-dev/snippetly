import z from "zod";
export const DiscoverUsersDto = z.object({
    limit: z.number().min(1).max(100).optional(),
    cursor: z.string().transform((val)=>{
        try {
            const parsed = JSON.parse(val);
            return {
                snippetsCount: Number(parsed.snippetsCount),
                id: Number(parsed.id)
            };
        } catch  {
            throw new Error("cursor must be a valid JSON string");
        }
    }).optional(),
    query: z.string().nonempty().optional()
});
