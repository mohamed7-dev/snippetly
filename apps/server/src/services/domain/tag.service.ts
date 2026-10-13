import { PopularTagsDtoType } from '@snippetly/common/dto';
import { filterUnique } from '@snippetly/common/lib';
import { RequestContext } from '../../api/request-context/request-context';
import { Developer } from '../../entities/developer/developer.entity';
import { Tag } from '../../entities/tags/tag.entity';
import { DatabaseService } from '../../infra/database/database.service';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';
import { moduleRef } from '../../infra/ioc-container/module-ref';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder.service';

@Injectable()
export class TagService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly listQueryBuilder: ListQueryBuilder,
    ) {}

    public async getPopularTags(ctx: RequestContext, input: PopularTagsDtoType['input']) {
        const qb = this.listQueryBuilder.build(
            Tag,
            { take: input.take || 10 },
            {
                ctx,
                orderBy: {
                    usageCount: 'DESC',
                    value: 'ASC',
                },
            },
        );

        const [items, itemsCount] = await qb.getManyAndCount();
        return { items, itemsCount };
    }

    public async createTagsFromValues(ctx: RequestContext, values: string[]): Promise<Tag[]> {
        const { DeveloperService } = require('./developer.service') as typeof import('./developer.service');
        const developerService = moduleRef.getProvider<InstanceType<typeof DeveloperService>>(DeveloperService);
        const developer = await developerService.getActiveDeveloper(ctx);

        return Promise.all(
            filterUnique(values).map(
                async value => await this.createTagsFromValue(ctx, value, developer ?? null),
            ),
        );
    }

    public async countDevelopersTags(ctx: RequestContext, developerIds: string[]) {
        const tagRepo = this.databaseService.getRepository(ctx, Tag);

        const qb = tagRepo
            .createQueryBuilder('tag')
            .innerJoin('tag.addedBy', 'developer')
            .select('developer.id', 'developerId')
            .addSelect('tag.id', 'id')
            .addSelect('tag.value', 'value')
            .addSelect('tag.usageCount', 'usageCount')
            .where('developer.id IN (:...developerIds)', { developerIds })
            .orderBy('tag.value', 'ASC');

        return await qb.getRawMany<{ developerId: string; id: string; value: string; usageCount: number }>();
    }

    private async createTagsFromValue(ctx: RequestContext, value: string, addedBy: Developer | null) {
        const repo = this.databaseService.getRepository(ctx, Tag);
        const tag = await repo.findOne({
            where: {
                value,
            },
        });

        if (tag) return tag;

        return await repo.save(new Tag({ value, addedBy }));
    }
}
