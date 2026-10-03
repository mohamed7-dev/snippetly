import type { EntityMetadata, ObjectLiteral, Repository } from 'typeorm';
import { RequestContext } from '../../api/request-context/request-context';
import { UserInputError } from '../../common/errors/errors';
import { DatabaseService } from '../../infra/database/database.service';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';

export interface SlugForEntityOptions {
    entityName: string;
    fieldName: string;
    inputValue: string;
    entityId?: string;
}

interface EntityFieldInfo {
    metadata: EntityMetadata;
    column: string;
    excludeColumn?: string;
}

@Injectable()
export class SlugService {
    constructor(private readonly databaseService: DatabaseService) {}
    public generate(_ctx: RequestContext, value: string): string {
        if (!value) {
            return '';
        }
        return value
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .split('-')
            .filter(Boolean)
            .join('-');
    }

    public async slugForEntity(ctx: RequestContext, input: SlugForEntityOptions): Promise<string> {
        const { entityName, fieldName, inputValue: value, entityId } = input;
        const baseSlug = this.generate(ctx, value);
        if (!baseSlug) {
            return '';
        }
        const field = this.resolveEntityField(entityName, fieldName);
        const repository = this.databaseService.getRepository(ctx, field.metadata.target);
        const exclusion =
            entityId == null ? undefined : { column: field.excludeColumn ?? 'id', value: entityId };
        let slug = baseSlug;
        let suffix = 1;
        while (await this.slugExists(repository, field.column, slug, exclusion)) {
            slug = `${baseSlug}-${suffix++}`;
        }
        return slug;
    }

    private resolveEntityField(entityName: string, fieldName: string): EntityFieldInfo {
        const metadata = this.databaseService.dataSource.entityMetadatas.find(
            m => m.tableName === entityName.toLowerCase(),
        );
        if (!metadata) {
            throw new UserInputError('Entity not found', { entityName });
        }
        const baseColumn = metadata.columns.find(c => c.propertyName === fieldName);
        if (baseColumn) {
            return { metadata, column: baseColumn.databaseName };
        }
        const translations = metadata.relations.find(r => r.propertyName === 'translations');
        if (!translations) {
            throw new UserInputError('Entity has no field', {
                entityName,
                fieldName,
            });
        }
        const translationMetadata = this.databaseService.dataSource.getMetadata(translations.type);
        const translationColumn = translationMetadata.columns.find(c => c.propertyName === fieldName);
        if (!translationColumn) {
            throw new UserInputError('Entity has no field', {
                entityName,
                fieldName,
            });
        }
        const ownerRelation = translationMetadata.relations.find(r => r.type === metadata.target);
        return {
            metadata: translationMetadata,
            column: translationColumn.databaseName,
            excludeColumn: ownerRelation?.joinColumns?.[0]?.databaseName ?? 'baseId',
        };
    }

    private async slugExists(
        repository: Repository<ObjectLiteral>,
        column: string,
        slug: string,
        exclusion?: { column: string; value: string | number },
    ): Promise<boolean> {
        const qb = repository.createQueryBuilder('entity').where(`entity.${column} = :slug`, { slug });
        if (exclusion) {
            qb.andWhere(`entity.${exclusion.column} != :id`, { id: exclusion.value });
        }
        return (await qb.getCount()) > 0;
    }
}
