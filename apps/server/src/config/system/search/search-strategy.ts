import { SelectQueryBuilder } from 'typeorm';

export interface SearchField {
    expression: string;
    weight: number;
}

export interface SearchStrategy {
    addSearch<Entity extends object>(
        query: SelectQueryBuilder<Entity>,
        term: string | undefined,
        fields: SearchField[],
        tagMatchQuery: string,
    ): void;
}
