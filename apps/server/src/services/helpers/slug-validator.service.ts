import { normalizeString } from '@snippetly/common/lib';
import { RequestContext } from '../../api/request-context/request-context';
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
        if (input.slug) {
            input.slug = normalizeString(input.slug, '-');
            let match: Entity | null;
            const visited: string[] = [];
            let suffix = 1;
            const hasSuffixPattern = /-\d+$/;

            do {
                const repo = this.databaseService.getRepository(ctx, entityType);
                const qb = repo
                    .createQueryBuilder('entity')
                    .andWhere('entity.slug = :slug', { slug: input.slug });

                if (input.id) {
                    qb.andWhere('entity.id != :id', { id: input.id });
                }
                if (visited.length) {
                    qb.andWhere('entity.id NOT IN (:...seen)', { visited });
                }
                match = await qb.getOne();
                if (match) {
                    if (!(match as any).deletedAt) {
                        suffix++;
                        if (hasSuffixPattern.test(input.slug)) {
                            input.slug = input.slug.replace(hasSuffixPattern, `-${suffix}`);
                        } else {
                            input.slug = `${input.slug}-${suffix}`;
                        }
                    } else {
                        visited.push(match.id);
                    }
                }
            } while (match);
        }

        return input;
    }
}
