import z from 'zod';
import {
    blockedByCorsErrorDto,
    internalServerErrorDto,
    routeNotFoundErrorDto,
} from './generated-errors-dtos.js';

export const baseEntityDto = z.object({
    id: z.number().int(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const commonErrorsDto = [internalServerErrorDto, routeNotFoundErrorDto, blockedByCorsErrorDto];
