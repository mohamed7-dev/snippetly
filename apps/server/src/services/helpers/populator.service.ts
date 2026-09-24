import { LanguageCode } from '@snippetly/common/dto';
import { RequestContext } from '../../api/request-context/request-context';
import { ConfigService } from '../../config/config.service';
import { User } from '../../entities/users/user.entity';
import { DatabaseService } from '../../infra/database/database.service';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';
import { Logger } from '../../infra/logger/logger';
import { CollectionService } from '../domain/collection.service';
import { RoleService } from '../domain/role.service';
import { SnippetService } from '../domain/snippet.service';
import { RoleDefinition } from './default-roles-builder.service';
import { RequestContextService } from './request-context.service';

const CONTEXT_NAME = 'Populator';

interface CollectionDef {
    name: string;
    slug?: string;
    color?: string;
    description?: string;
    isPrivate?: boolean;
    allowForking?: boolean;
    tags?: string[];
    creatorUserId: string;
}

interface SnippetDef {
    name: string;
    slug?: string;
    language?: string;
    code?: string;
    description?: string;
    note?: string;
    isPrivate?: boolean;
    allowForking?: boolean;
    tags?: string[];
    creatorUserId: string;
    collectionId: string;
}

export interface InitialData {
    defaultLanguageCode: LanguageCode;
    roles: RoleDefinition[];
    collections: CollectionDef[];
    snippets: SnippetDef[];
}

@Injectable()
export class Populator {
    constructor(
        private readonly configService: ConfigService,
        private readonly databaseService: DatabaseService,
        private readonly requestContextService: RequestContextService,
        private readonly roleService: RoleService,
        private readonly collectionService: CollectionService,
        private readonly snippetService: SnippetService,
    ) {}

    public async populateInitialData(data: InitialData) {
        const ctx = await this.createSuperAdminRequestContext(data);
        try {
            await this.populateRoles(ctx, data.roles);
        } catch (error: any) {
            Logger.error('Populating roles failed');
            Logger.error(error, CONTEXT_NAME, error.stack);
        }
    }

    /**'
     * @description
     * Should be run **before** snippets population otherwise, snippets will not have collections to reference.
     * Should be run **after** developers population otherwise, collections will not have creators to reference.
     */
    public async populateCollections(data: InitialData) {
        return Promise.all(
            data.collections.map(async def => {
                const ctx = await this.createDeveloperRequestContext(data, def.creatorUserId);
                return await this.collectionService.create(ctx, {
                    name: def.name,
                    slug: def.slug ?? def.name,
                    description: def.description,
                    color: def.color ?? 'red',
                    isPrivate: def.isPrivate ?? false,
                    allowForking: def.allowForking ?? true,
                    tags: def.tags,
                });
            }),
        );
    }

    /**'
     * @description
     * Should be run **after** collections population
     */
    public async populateSnippets(data: InitialData) {
        return Promise.all(
            data.snippets.map(async def => {
                const ctx = await this.createDeveloperRequestContext(data, def.creatorUserId);
                return await this.snippetService.create(ctx, {
                    name: def.name,
                    slug: def.slug ?? def.name,
                    description: def.description ?? '',
                    note: def.description ?? '',
                    language: def.language ?? 'js',
                    code: def.code ?? '<code>Code</code>',
                    isPrivate: def.isPrivate ?? false,
                    allowForking: def.allowForking ?? true,
                    tags: def.tags,
                    collectionId: def.collectionId,
                });
            }),
        );
    }

    private async populateRoles(ctx: RequestContext, roles: RoleDefinition[]) {
        if (!roles) return;
        return await Promise.all(roles.map(role => this.roleService.create(ctx, role)));
    }

    private async createSuperAdminRequestContext(data: InitialData) {
        const { superAdminCredentials } = this.configService.authOptions;
        const superAdminUser = await this.databaseService.getRepository(User).findOne({
            where: {
                identifier: superAdminCredentials.identifier,
            },
        });
        const ctx = await this.requestContextService.create({
            user: superAdminUser ?? undefined,
            apiType: 'admin',
            languageCode: data.defaultLanguageCode,
        });
        return ctx;
    }

    private async createDeveloperRequestContext(data: InitialData, identifier: string) {
        const developerUser = await this.databaseService.getRepository(User).findOne({
            where: {
                identifier,
            },
        });
        const ctx = await this.requestContextService.create({
            user: developerUser ?? undefined,
            apiType: 'developer',
            languageCode: data.defaultLanguageCode,
        });
        return ctx;
    }
}
