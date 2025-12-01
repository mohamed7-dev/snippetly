import { z } from "../zod";
export declare const DiscoverUsersDto: z.ZodObject<{
    limit: z.ZodOptional<z.ZodNumber>;
    cursor: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<{
        snippetsCount: number;
        id: number;
    }, string>>>;
    query: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type DiscoverUsersDtoType = z.infer<typeof DiscoverUsersDto>;
