import { SelectQueryBuilder } from 'typeorm';
import { SearchField, SearchStrategy } from './search-strategy';

export class PostgresSearchStrategy implements SearchStrategy {
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

        const tokens = term.match(/[\p{L}\p{N}_]+/gu) ?? [];
        const searchQuery = tokens.map(token => `'${token.replaceAll("'", "''")}':*`).join(' & ');
        if (!searchQuery) {
            query
                .addSelect(`CASE WHEN ${tagMatchQuery} THEN 1 ELSE 0 END`, 'score')
                .andWhere(tagMatchQuery)
                .setParameter('searchTagPattern', `%${escapeLikePattern(term)}%`);
            return;
        }

        const vectors = fields
            .map(
                field =>
                    `setweight(to_tsvector('simple', COALESCE(${field.expression}, '')), '${weightLabel(field.weight)}')`,
            )
            .join(' || ');
        const tsQuery = `to_tsquery('simple', :searchTsQuery)`;
        const tagScore = `CASE WHEN ${tagMatchQuery} THEN 1 ELSE 0 END`;

        query
            .addSelect(`ts_rank_cd(${vectors}, ${tsQuery}) + ${tagScore}`, 'score')
            .andWhere(`((${vectors}) @@ ${tsQuery} OR ${tagMatchQuery})`)
            .setParameters({
                searchTsQuery: searchQuery,
                searchTagPattern: `%${escapeLikePattern(term)}%`,
            });
    }
}

function weightLabel(weight: number): string {
    if (weight >= 4) return 'A';
    if (weight >= 2) return 'B';
    if (weight >= 1) return 'C';
    return 'D';
}

function escapeLikePattern(value: string): string {
    return value.replace(/[\\%_]/g, '\\$&');
}
