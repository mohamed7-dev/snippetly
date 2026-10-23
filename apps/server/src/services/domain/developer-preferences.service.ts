import type {
    GetDeveloperPreferencesDtoType,
    UpdateDeveloperPreferencesDtoType,
} from '@snippetly/common/dto';
import { DEFAULT_DEVELOPER_PREFERENCES } from '@snippetly/common/lib';
import { RequestContext } from '../../api/request-context/request-context';
import { DeveloperPreferences } from '../../entities/developer-preferences/developer-preferences.entity';
import { DatabaseService } from '../../infra/database/database.service';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';

type DeveloperPreferencesValues = GetDeveloperPreferencesDtoType['output']['preferences'];

@Injectable()
export class DeveloperPreferencesService {
    constructor(private readonly databaseService: DatabaseService) {}

    /**
     * @description
     * Gets a developer's preferences merged with the application defaults.
     */
    public async get(
        ctx: RequestContext,
        developerId: string,
    ): Promise<GetDeveloperPreferencesDtoType['output']> {
        const storedPreferences = await this.databaseService
            .getRepository(ctx, DeveloperPreferences)
            .findOne({ where: { developer: { id: developerId } } });

        return {
            preferences: {
                ...DEFAULT_DEVELOPER_PREFERENCES,
                ...storedPreferences?.preferences,
                codeEditor: {
                    ...DEFAULT_DEVELOPER_PREFERENCES.codeEditor,
                    ...storedPreferences?.preferences.codeEditor,
                },
            },
            isInitialized: storedPreferences !== null,
        };
    }

    /**
     * @description
     * Updates a developer's preferences while preserving unspecified values.
     */
    public async update(
        ctx: RequestContext,
        developerId: string,
        input: UpdateDeveloperPreferencesDtoType['input'],
    ): Promise<DeveloperPreferencesValues> {
        const repository = this.databaseService.getRepository(ctx, DeveloperPreferences);
        const storedPreferences = await repository.findOne({
            where: { developer: { id: developerId } },
        });
        const currentPreferences = storedPreferences?.preferences ?? DEFAULT_DEVELOPER_PREFERENCES;
        const preferences: DeveloperPreferencesValues = {
            ...currentPreferences,
            ...input,
            codeEditor: {
                ...currentPreferences.codeEditor,
                ...input.codeEditor,
            },
        };

        await repository.save(
            repository.create({
                ...(storedPreferences ? { id: storedPreferences.id } : {}),
                developer: { id: developerId },
                preferences,
            }),
        );

        return preferences;
    }
}
