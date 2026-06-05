import z from 'zod';

export const authenticatedUserDto = z.object({
    id: z.number().int(),
    identifier: z.string(),
});

export type AuthenticatedUserDto = z.infer<typeof authenticatedUserDto>;
