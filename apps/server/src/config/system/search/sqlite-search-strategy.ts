import { SelectQueryBuilder } from 'typeorm';
import { SearchField, SearchStrategy } from './search-strategy';

export class SqliteSearchStrategy implements SearchStrategy {
    addSearch<Entity extends object>(
        query: SelectQueryBuilder<Entity>,
        term: string | undefined,
        fields: SearchField[],
        tagMatchQuery: string,
    ): void {
        if (!term) {
            query.addSelect('0', 'score');
            return;
        }

        const pattern = `%${escapeLikePattern(term)}%`;
        const score = fields
            .map(
                field =>
                    `CASE WHEN ${field.expression} LIKE :searchPattern ESCAPE '\\' THEN ${field.weight} ELSE 0 END`,
            )
            .join(' + ');
        const fieldMatches = fields
            .map(field => `${field.expression} LIKE :searchPattern ESCAPE '\\'`)
            .join(' OR ');

        query
            .addSelect(`(${score}) + CASE WHEN ${tagMatchQuery} THEN 1 ELSE 0 END`, 'score')
            .andWhere(`((${fieldMatches}) OR ${tagMatchQuery})`)
            .setParameters({
                searchPattern: pattern,
                searchTagPattern: pattern,
            });
    }
}

function escapeLikePattern(value: string): string {
    return value.replace(/[\\%_]/g, '\\$&');
}
