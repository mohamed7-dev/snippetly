import { filterUnique } from '@snippetly/common/lib';
import { RequestContext } from '../../api/request-context/request-context';
import { Developer } from '../../entities/developer/developer.entity';
import { Tag } from '../../entities/tags/tag.entity';
import { DatabaseService } from '../../infra/database/database.service';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';
import { DeveloperService } from './developer.service';

@Injectable()
export class TagService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly developerService: DeveloperService,
    ) {}
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
