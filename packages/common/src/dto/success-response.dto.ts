import z from 'zod';

/**
 * @description
 * Dto for generic success operations
 */
export const successResponseDto = z.object({
    success: z.boolean(),
});

export type SuccessResponseDtoType = z.infer<typeof successResponseDto>;
