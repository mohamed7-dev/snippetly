import type { FilterType } from '@snippetly/common/dto';
import z from 'zod';
import type {
    FilterDescriptor,
    FilterFieldDescriptor,
    FilterOperatorDescriptor,
    IntrospectFilterSchemaOptions,
} from './types';
import { collectMetadata, defOf, humanize, shapeOf, unwrap } from './utils';

const RANGE_KEY_PAIRS: [string, string][] = [
    ['from', 'to'],
    ['min', 'max'],
    ['gte', 'lte'],
];

const DEFAULT_FLAGS = ['notNull', 'isNull', 'isEmpty', 'isNotEmpty'];

function describeOperator(
    operatorFieldName: string,
    operatorFieldSchema: z.ZodType,
    fieldName: string,
    flags: Set<string>,
): FilterOperatorDescriptor {
    const unwrappedSchema = unwrap(operatorFieldSchema);
    const def = defOf(unwrappedSchema);
    const meta = collectMetadata<{ filterType: FilterType }>(operatorFieldSchema);
    const base = { key: operatorFieldName, valueSchema: unwrappedSchema };

    if (meta.filterType === 'None' || (def.type === 'boolean' && flags.has(operatorFieldName))) {
        return { ...base, valueKind: 'none', inputSchema: null, rangeKeys: null };
    }

    switch (def.type) {
        case 'array':
        case 'set':
            return { ...base, valueKind: 'list', rangeKeys: null, inputSchema: def.element };
        case 'tuple':
            if (def.items.length === 2) {
                return { ...base, valueKind: 'range', inputSchema: def.items[0], rangeKeys: null };
            }
            break;
        case 'object': {
            const shape = def.shape as Record<string, z.ZodType>;
            const keys = Object.keys(shape);
            const pair = RANGE_KEY_PAIRS.find(p => keys.length === 2 && p.every(k => keys.includes(k)));
            if (pair) {
                return { ...base, valueKind: 'range', inputSchema: shape[pair[0]], rangeKeys: pair };
            }
            break;
        }
        default:
            return { ...base, valueKind: 'single', inputSchema: unwrappedSchema, rangeKeys: null };
    }

    throw new Error(
        `Unsupported operator schema for "${fieldName}.${operatorFieldName}" (type "${def.type}"). ` +
            `Use a primitive, array, 2-tuple, or a 2-key range object.`,
    );
}

export function introspectFilterSchema(
    schema: z.ZodType,
    options: IntrospectFilterSchemaOptions = {},
): FilterDescriptor {
    const { labels = {}, andKey = '_and', orKey = '_or' } = options;
    const flags = new Set(options.flagOperators ?? DEFAULT_FLAGS);
    const groups = { and: false, or: false };
    const fields: FilterFieldDescriptor[] = [];
    const schemaShape = shapeOf(schema, 'Filter schema');

    for (const [fieldName, fieldSchema] of Object.entries(schemaShape)) {
        if (fieldName === andKey) {
            groups.and = true;
            continue;
        }
        if (fieldName === orKey) {
            groups.or = true;
            continue;
        }

        const metadata = collectMetadata<{ filterType: FilterType; label?: string }>(fieldSchema);
        if (!metadata.filterType) {
            throw new Error(
                `Filter field "${fieldName}" has no filterType. Build it with defineFilter(...) or add .meta({ filterType }).`,
            );
        }

        const operatorsShape = shapeOf(fieldSchema, `Filter field ${fieldName}`);
        fields.push({
            name: fieldName,
            label: labels[fieldName] ?? metadata.label ?? humanize(fieldName),
            filterType: metadata.filterType,
            operators: Object.entries(operatorsShape).map(([operatorFieldName, operatorFieldSchema]) =>
                describeOperator(operatorFieldName, operatorFieldSchema, fieldName, flags),
            ),
        });
    }

    return {
        fields,
        groups: groups,
        keys: { and: andKey, or: orKey },
    };
}
