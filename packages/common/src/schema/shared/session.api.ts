import z from 'zod';
import { InferDtoType, idSchema, successResponse } from './common-schemas.js';
import {
    entityNotFoundErrorSchema,
    forbiddenErrorSchema,
    userInputErrorSchema,
    withServerErrors,
} from './errors.js';

const activeSession = z.object({
    id: idSchema,
    createdAt: z.coerce.date(),
    expiresAt: z.coerce.date(),
    authenticationStrategy: z.string(),
    userAgent: z.string().nullable(),
    isCurrent: z.boolean(),
});

export const listActiveSessionsDto = {
    output: withServerErrors(z.array(activeSession), [forbiddenErrorSchema]),
};

export type ListActiveSessionsDtoType = InferDtoType<typeof listActiveSessionsDto>;

export const revokeSessionDto = {
    input: z.object({ id: idSchema }),
    output: withServerErrors(successResponse, [
        userInputErrorSchema,
        forbiddenErrorSchema,
        entityNotFoundErrorSchema,
    ]),
};

export type RevokeSessionDtoType = InferDtoType<typeof revokeSessionDto>;
