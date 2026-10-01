import { normalizeString } from '@snippetly/common/lib';
import { RequestContext } from '../../api/request-context/request-context';
import { SoftDeletable } from '../../common/types/soft-deletable.interface';
import { ClassType } from '../../common/types/utils';
import { AppEntity } from '../../infra/database/app-entity';
import { DatabaseService } from '../../infra/database/database.service';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';

export type InputWithSlug = {
    id?: string | null;
    slug?: string | null;
};

@Injectable()
export class SlugValidator {
    constructor(private readonly databaseService: DatabaseService) {}

    public async validateSlug<Input extends InputWithSlug, Entity extends AppEntity>(
        ctx: RequestContext,
        input: Input,
        entityType: ClassType<Entity>,
    ): Promise<Input> {
        if (!input.slug) {
            return input;
        }

        input.slug = normalizeString(input.slug, '-');

        const suffixPattern = /-\d+$/;
        const excludedIds: string[] = [];
        let suffix = 1;

        while (true) {
            const repository = this.databaseService.getRepository(ctx, entityType);

            const query = repository.createQueryBuilder('entity').where('entity.slug = :slug', {
                slug: input.slug,
            });

            // Ignore the entity currently being updated.
            if (input.id) {
                query.andWhere('entity.id != :id', {
                    id: input.id,
                });
            }

            // Ignore soft-deleted records that have already been encountered.
            if (excludedIds.length > 0) {
                query.andWhere('entity.id NOT IN (:...excludedIds)', {
                    excludedIds,
                });
            }

            const match = await query.getOne();

            // No collision: the current slug is available.
            if (!match) {
                break;
            }

            // A soft-deleted entity does not force us to change the slug.
            // Instead, exclude it from subsequent queries and continue looking.
            if ((match as Entity & SoftDeletable).deletedAt) {
                excludedIds.push(match.id);
                continue;
            }

            // An active entity owns this slug, so generate the next candidate.
            suffix++;

            if (suffixPattern.test(input.slug)) {
                input.slug = input.slug.replace(suffixPattern, `-${suffix}`);
            } else {
                input.slug = `${input.slug}-${suffix}`;
            }
        }

        return input;
    }
}
