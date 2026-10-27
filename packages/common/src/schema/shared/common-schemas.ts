import z, { ZodObject, ZodType } from 'zod';

type InputForSchema<TSchema> =
    TSchema extends z.ZodOptional<infer TInner>
        ? InputForSchema<TInner> | undefined
        : TSchema extends z.ZodNullable<infer TInner>
          ? InputForSchema<TInner> | null
          : TSchema extends { shape: infer TShape extends z.ZodRawShape }
            ? ObjectInput<TShape>
            : TSchema extends { _zod: { input: infer TInput; output: infer TOutput } }
              ? unknown extends TInput
                  ? TOutput
                  : TInput
              : TSchema extends { options: readonly (infer TOption)[] }
                ? InputForSchema<TOption>
                : never;

type ObjectInput<TShape extends z.ZodRawShape> = {
    [TKey in RequiredInputKeys<TShape>]: InputForSchema<TShape[TKey]>;
} & {
    [TKey in OptionalInputKeys<TShape>]?: InputForSchema<TShape[TKey]>;
};

type RequiredInputKeys<TShape extends z.ZodRawShape> = {
    [TKey in keyof TShape]-?: undefined extends InputForSchema<TShape[TKey]> ? never : TKey;
}[keyof TShape];

type OptionalInputKeys<TShape extends z.ZodRawShape> = {
    [TKey in keyof TShape]-?: undefined extends InputForSchema<TShape[TKey]> ? TKey : never;
}[keyof TShape];

type OutputForSchema<TSchema> = TSchema extends z.ZodType<infer TOutput> ? TOutput : never;

export type InferDtoType<TDto extends { input?: z.ZodType; output: z.ZodType }> = {
    output: OutputForSchema<TDto['output']>;
} & (TDto extends { input: infer TInput } ? { input: InputForSchema<TInput> } : Record<never, never>);

//############################ Password Schema ##########################

export const passwordSchema = z.string().nonempty();
//############################ Success Response ##########################

export const successResponse = z.object({
    success: z.boolean(),
});

export type SuccessResponse = z.infer<typeof successResponse>;

//############################ ID Schema ##########################

export const idSchema = z.uuidv4();

//############################ Node ##########################

export const node = z.object({
    id: idSchema,
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});

//############################ Deletion Response ##########################

export const deletionResponse = z.object({
    result: z.enum(['DELETED', 'NOT_DELETED']),
    message: z.string(),
});

export type DeletionResponse = z.infer<typeof deletionResponse>;

//############################ One ##########################
export const inputIdSchema = z.object({
    id: idSchema,
});

export type InputIdSchema = z.infer<typeof inputIdSchema>;

//############################ Many ##########################

export const inputIdsSchema = z.object({
    ids: z.array(idSchema.nonempty()),
});
export type InputIdsSchema = z.infer<typeof inputIdsSchema>;

//############################ Filter & Sort Operators ##########################
export type FilterType = 'Text' | 'Numeric' | 'Date' | 'Boolean' | 'ID' | 'None';
export const stringFilterOperators = defineFilter('Text', {
    equals: z.string(),
    notEquals: z.string(),
    contains: z.string(),
    doesNotContain: z.string(),
    includedIn: z.array(z.string()),
    excludedFrom: z.array(z.string()),
    matchesRegex: z.string(),
    isNull: z.boolean(),
});

export type StringFilterOperators = z.infer<typeof stringFilterOperators>;

export const idFilterOperators = defineFilter('ID', {
    equals: idSchema,
    notEquals: idSchema,
    includedIn: z.array(idSchema),
    excludedFrom: z.array(idSchema),
    isNull: z.boolean(),
});

export type IDFilterOperators = z.infer<typeof idFilterOperators>;

const numericRangeInput = z.object({
    min: z.number(),
    max: z.number(),
});
export type NumericRangeInput = z.infer<typeof numericRangeInput>;

export const numericFilterOperators = defineFilter('Numeric', {
    equals: z.number(),
    lessThan: z.number(),
    lessThanOrEqual: z.number(),
    greaterThan: z.number(),
    greaterThanOrEqual: z.number(),
    withinRange: numericRangeInput,
    isNull: z.boolean(),
});

export type NumericFilterOperators = z.infer<typeof numericFilterOperators>;

export const booleanFilterOperators = defineFilter('Boolean', {
    equals: z.boolean(),
    isNull: z.boolean(),
});

export type BooleanFilterOperators = z.infer<typeof booleanFilterOperators>;

const dateTimeRangeInput = z.object({
    from: z.coerce.date(),
    to: z.coerce.date(),
});
export type DateTimeRangeInput = z.infer<typeof dateTimeRangeInput>;

export const dateTimeFilterOperators = defineFilter('Date', {
    equals: z.coerce.date(),
    before: z.coerce.date(),
    after: z.coerce.date(),
    withinRange: dateTimeRangeInput,
    isNull: z.boolean(),
});

export type DateTimeFilterOperators = z.infer<typeof dateTimeFilterOperators>;

export enum FilterGroupOperator {
    OR = 'OR',
    AND = 'AND',
}

export const filterGroupOperator = z.preprocess(
    value => (typeof value === 'string' ? value.toUpperCase() : value),
    z.enum(FilterGroupOperator),
);

export enum SortDirection {
    ASC = 'ASC',
    DESC = 'DESC',
}

export const sortDirection = z.enum(SortDirection);

//############################ PaginatedList ##########################

const paginatedListInputSchema = z.object({
    take: z.coerce.number(),
    skip: z.coerce.number(),
});

/**
 * @description
 * Define a reusable filter-operators object. All operators are optional and the
 * object is tagged with its filter type. Note: .meta() must be applied last,
 * after .partial(), because .partial() returns a new schema instance.
 */
export function defineFilter<T extends z.ZodRawShape>(filterType: FilterType, shape: T) {
    return z.object(shape).partial().meta({ filterType });
}

export function createPaginatedListInputSchema<Filter extends z.ZodRawShape, Sort extends z.ZodRawShape>(
    filterSchema: ZodObject<Filter>,
    sortSchema: ZodObject<Sort>,
) {
    const extendedFilterSchema = z
        .object({
            createdAt: dateTimeFilterOperators,
            updatedAt: dateTimeFilterOperators,
            id: idFilterOperators,
        })
        .partial()
        .extend(filterSchema.partial().shape);

    return paginatedListInputSchema
        .extend({
            filter: z
                .object({ _and: z.array(extendedFilterSchema), _or: z.array(extendedFilterSchema) })
                .partial()
                .extend(extendedFilterSchema.shape),
            filterOperator: filterGroupOperator.default(FilterGroupOperator.AND),
        })
        .extend({
            sort: z
                .object({
                    createdAt: sortDirection,
                    updatedAt: sortDirection,
                    id: sortDirection,
                })
                .partial()
                .extend(sortSchema.partial().shape),
        })
        .partial()
        .optional();
}

export function createPaginatedListOutputSchema<Item = any>(schema: ZodType<Item>) {
    const paginatedListSchema = z.object({
        items: z.array(schema),
        itemsCount: z.number(),
    });

    return paginatedListSchema;
}
