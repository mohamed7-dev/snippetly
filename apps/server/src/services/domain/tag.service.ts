import { PopularTagsDtoType } from '@snippetly/common/dto';
import { filterUnique } from '@snippetly/common/lib';
import { RequestContext } from '../../api/request-context/request-context';
import { Developer } from '../../entities/developer/developer.entity';
import { Tag } from '../../entities/tags/tag.entity';
import { DatabaseService } from '../../infra/database/database.service';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder.service';
import { DeveloperService } from './developer.service';

@Injectable()
export class TagService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly developerService: DeveloperService,
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
        const developer = await this.developerService.getActiveDeveloper(ctx);

        return Promise.all(
            filterUnique(values).map(
                async value => await this.createTagsFromValue(ctx, value, developer ?? null),
            ),
        );
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
