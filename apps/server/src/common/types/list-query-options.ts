import type {
    BooleanFilterOperators,
    DateTimeFilterOperators,
    NumericFilterOperators,
    SortDirection,
    StringFilterOperators,
} from '@snippetly/common/dto';
import { AppEntity } from '../../infra/database/app-entity';

export interface ListQueryOptions<Entity extends AppEntity> {
    take?: number;
    skip?: number;
    filter?: FilterParameter<Entity> | null;
    sort?: SortParameter<Entity> | null;
}

export type PrimitiveFields<Entity extends AppEntity> = {
    [Key in keyof Entity]: NonNullable<Entity[Key]> extends number | string | boolean | Date ? Key : never;
}[keyof Entity];

export type FilterParameter<Entity extends AppEntity> = {
    [Key in PrimitiveFields<Entity>]?: NonNullable<Entity[Key]> extends string
        ? StringFilterOperators
        : NonNullable<Entity[Key]> extends number
          ? NumericFilterOperators
          : NonNullable<Entity[Key]> extends boolean
            ? BooleanFilterOperators
            : NonNullable<Entity[Key]> extends Date
              ? DateTimeFilterOperators
              : StringFilterOperators;
} & {
    _and?: Array<FilterParameter<Entity>>;
    _or?: Array<FilterParameter<Entity>>;
};

export type SortParameter<Entity extends AppEntity> = {
    [Key in PrimitiveFields<Entity>]?: SortDirection;
};
