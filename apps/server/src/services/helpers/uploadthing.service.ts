import { createUploadthing, FileRouter } from 'uploadthing/express';
import { ForbiddenError } from '../../common/errors/errors';
import { moduleRef } from '../../infra/ioc-container/module-ref';

export class UploadthingService {
    private f = createUploadthing();
    private router: FileRouter;

    constructor() {
        this.router = this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router = {
            ['upload-avatar']: this.f({
                image: {
                    maxFileSize: '1MB',
                    maxFileCount: 1,
                },
            })
                .middleware(({ req }) => {
                    const ctx = req.getRequestContext();
                    if (!ctx.activeUserId) {
                        throw new ForbiddenError();
                    }
                    return { userId: ctx.activeUserId };
                })
                .onUploadComplete(async ({ metadata, file }) => {
                    if (metadata.userId) {
                        const { RequestContextService } =
                            require('../helpers/request-context.service') as typeof import('../helpers/request-context.service');
                        const requestContextService =
                            moduleRef.getProvider<
                                import('../helpers/request-context.service').RequestContextService
                            >(RequestContextService);

                        const { DeveloperService } =
                            require('../domain/developer.service') as typeof import('../domain/developer.service');
                        const developerService =
                            moduleRef.getProvider<import('../domain/developer.service').DeveloperService>(
                                DeveloperService,
                            );

                        const developer = await developerService.getOneByUserId(
                            requestContextService.create({ apiType: 'developer' }),
                            metadata.userId,
                            undefined,
                            { includePrivateDevelopers: true, includeSoftDeleted: false },
                        );
                        if (!developer) {
                            throw new ForbiddenError();
                        }

                        const ctx = requestContextService.create({
                            apiType: 'developer',
                            user: developer.user,
                        });

                        await developerService.update(ctx, {
                            id: developer.id,
                            image: file.ufsUrl,
                            imageKey: file.key,
                        });

                        return { success: true };
                    }
                }),
        };
        return this.router;
    }

    /**
     * Returns the configured upload router
     */
    public getRouter(): FileRouter {
        return this.router;
    }
}

export const uploadRouter = new UploadthingService().getRouter();
export type { OurFileRouter } from './uploadthing-router.type';
