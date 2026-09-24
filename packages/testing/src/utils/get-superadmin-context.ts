import { App, RequestContext } from '@snippetly/server';

export async function getSuperAdminContext(app: App) {
    const { DatabaseService } = await import('@snippetly/server');
    const databaseService = app.getProvider<import('@snippetly/server').DatabaseService>(DatabaseService);
    const { ConfigService } = await import('@snippetly/server');
    const configService = app.getProvider<import('@snippetly/server').ConfigService>(ConfigService);
    const { superAdminCredentials } = configService.authOptions;
    const { User } = await import('@snippetly/server');
    const superAdminUser = await databaseService
        .getRepository(User)
        .findOneOrFail({ where: { identifier: superAdminCredentials.identifier } });

    return new RequestContext({
        apiType: 'admin',
        isAuthorized: true,
        isAuthorizedAsOwnerOnly: false,
        session: {
            id: '',
            token: '',
            sessionExpiry: new Date(),
            cacheExpiry: 999999,
            user: {
                id: superAdminUser.id,
                identifier: superAdminUser.identifier,
                isVerified: true,
                permissions: [],
            },
        },
    });
}
