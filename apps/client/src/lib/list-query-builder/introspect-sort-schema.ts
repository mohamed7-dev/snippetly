import type { SortDirection } from '@snippetly/common/dto';
import type z from 'zod';
import type { IntrospectSortSchemaOptions, SortFieldDescriptor } from './types';
import { collectMetadata, defOf, humanize, shapeOf, unwrap } from './utils';

export function introspectSortSchema(
    schema: z.ZodType,
    options: IntrospectSortSchemaOptions = {},
): SortFieldDescriptor[] {
    const { labels = {} } = options;

    return Object.entries(shapeOf(schema, 'Sort schema')).map(([name, fieldSchema]) => {
        if (/^(0|[1-9]\d*)$/.test(name)) {
            throw new Error(
                `Sort field "${name}" is integer-like. JS objects reorder such keys, so sort priority would be lost.`,
            );
        }
        const unwrappedSchema = unwrap(fieldSchema);
        const def = defOf(unwrappedSchema);
        if (def.type !== 'enum') {
            throw new Error(`Sort field "${name}" must be an enum of directions (got "${def.type}").`);
        }
        return {
            name,
            label: labels[name] ?? collectMetadata<{ label?: string }>(fieldSchema).label ?? humanize(name),
            directions: Object.values(def.entries as Record<string, SortDirection>),
        };
    });
}
