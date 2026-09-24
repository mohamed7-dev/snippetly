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
                        const { DeveloperService } = await import('../domain/developer.service.js');
                        const developerService =
                            moduleRef.getProvider<import('../domain/developer.service').DeveloperService>(
                                DeveloperService,
                            );
                        const developer = await developerService.getOneByUserId(metadata.userId);
                        if (!developer) {
                            throw new ForbiddenError();
                        }
                        const { RequestContextService } = await import('./request-context.service.js');
                        const requestContextService =
                            moduleRef.getProvider<import('./request-context.service').RequestContextService>(
                                RequestContextService,
                            );
                        const ctx = await requestContextService.create({ apiType: 'developer' });
                        await developerService.update(ctx, {
                            id: developer.id,
                            image: file.ufsUrl,
                            imageKey: file.key,
                        });
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

export type OurFileRouter = typeof uploadRouter;
