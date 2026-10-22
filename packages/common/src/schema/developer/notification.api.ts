import z from 'zod';
import {
    createPaginatedListInputSchema,
    createPaginatedListOutputSchema,
    InferDtoType,
    inputIdSchema,
    sortDirection,
    stringFilterOperators,
    successResponse,
} from '../shared/common-schemas.js';

const appNotification = z.object({
    id: z.string().uuid(),
    title: z.string(),
    body: z.string(),
    url: z.string().nullable(),
    createdAt: z.coerce.date(),
});

const appNotificationFilter = z
    .object({
        title: stringFilterOperators,
        body: stringFilterOperators,
        tag: stringFilterOperators,
    })
    .partial();

const appNotificationSort = z
    .object({
        title: sortDirection,
        body: sortDirection,
        tag: sortDirection,
    })
    .partial();

export const listAppNotificationsDto = {
    input: createPaginatedListInputSchema(appNotificationFilter, appNotificationSort),
    output: createPaginatedListOutputSchema(appNotification),
};

export const dismissAppNotificationDto = {
    input: inputIdSchema,
    output: successResponse,
};

export type ListAppNotificationsDtoType = InferDtoType<typeof listAppNotificationsDto>;
export type DismissAppNotificationDtoType = InferDtoType<typeof dismissAppNotificationDto>;
