import { notNullOrUndefined } from '@snippetly/common/lib';
import { App, isApiError } from '@snippetly/server';
import { getSuperAdminContext } from '../utils/get-superadmin-context';
import { MockDataService } from './mock-data.service';

export async function populateDevelopers(app: App, count: number, logFn: (message: string) => void) {
    const { DeveloperService } = await import('@snippetly/server');
    const developerService = app.getProvider<import('@snippetly/server').DeveloperService>(DeveloperService);
    const developerData = MockDataService.getMockDevelopers(count);
    // superadmin always has the permission to create a developer explicitly so we need to
    // run the creation method in an admin type request context
    const ctx = await getSuperAdminContext(app);
    const password = 'test';
    try {
        return await Promise.all(
            developerData.map(async dev => {
                const createdDeveloper = await developerService.create(ctx, dev, password);
                if (isApiError(createdDeveloper)) {
                    logFn(`Failed to create developer: ${createdDeveloper.message}`);
                    return;
                }
                return createdDeveloper;
            }),
        ).then(result => result.filter(notNullOrUndefined));
    } catch (e: any) {
        logFn(`Failed to create developer: ${JSON.stringify(e.message)}`);
    }
}
