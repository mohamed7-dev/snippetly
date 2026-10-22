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
}

@Injectable()
export class SlugService {
    constructor(private readonly databaseService: DatabaseService) {}

    /**
     * @description
     * Converts text into a lowercase, URL-friendly slug.
     */
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

    /**
     * @description
     * Creates a unique slug for a direct entity field, excluding the current entity when updating.
     */
    public async slugForEntity(ctx: RequestContext, input: SlugForEntityOptions): Promise<string> {
        const { entityName, fieldName, inputValue: value, entityId } = input;
        const baseSlug = this.generate(ctx, value);
        if (!baseSlug) {
            return '';
        }
        const field = this.resolveEntityField(entityName, fieldName);
        const repository = this.databaseService.getRepository(ctx, field.metadata.target);
        const exclusion = entityId == null ? undefined : { column: 'id', value: entityId };
        let slug = baseSlug;
        let suffix = 1;
        while (await this.slugExists(repository, field.column, slug, exclusion)) {
            slug = `${baseSlug}-${suffix++}`;
        }
        return slug;
    }

    /** Finds the entity metadata and database column for a direct entity field. */
    private resolveEntityField(entityName: string, fieldName: string): EntityFieldInfo {
        const metadata = this.databaseService.dataSource.entityMetadatas.find(
            m => m.tableName === entityName.toLowerCase(),
        );
        if (!metadata) {
            throw new UserInputError('Entity not found', { entityName });
        }
        const column = metadata.columns.find(c => c.propertyName === fieldName);
        if (!column) {
            throw new UserInputError('Entity has no field', {
                entityName,
                fieldName,
            });
        }
        return { metadata, column: column.databaseName };
    }

    /** Checks whether a slug is already used, optionally excluding one entity ID. */
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
