import { FilterGroupOperator } from '@snippetly/common/dto';
import z from 'zod';

export const OFFLINE_SNIPPET_SORT_ORDERS = ['newest', 'oldest', 'name-asc', 'name-desc'] as const;

export const offlineSnippetsSearchSchema = z.object({
    search: z.string().max(200).optional(),
    tags: z.array(z.string().min(1)).optional(),
    tagOperator: z.enum(FilterGroupOperator).optional(),
    sort: z.enum(OFFLINE_SNIPPET_SORT_ORDERS).optional(),
    page: z.coerce.number().int().min(1).optional(),
});

export type OfflineSnippetsSearchParams = z.infer<typeof offlineSnippetsSearchSchema>;

export const offlineCollectionsSearchSchema = z.object({
    search: z.string().max(200).optional(),
});

export type OfflineCollectionsSearchParams = z.infer<typeof offlineCollectionsSearchSchema>;

export const offlineCollectionSearchSchema = offlineCollectionsSearchSchema;

export type OfflineCollectionSearchParams = OfflineCollectionsSearchParams;
