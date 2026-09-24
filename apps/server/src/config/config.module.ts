import { OnApplicationBootstrap, OnApplicationShutdown } from '../common/types/lifecycle-hooks';
import { moduleRef } from '../infra/ioc-container/module-ref';
import { Module } from '../infra/ioc-container/module.decorator';
import { ConfigService } from './config.service';

@Module({
    providers: [ConfigService],
    exports: [ConfigService],
})
export class ConfigModule implements OnApplicationBootstrap, OnApplicationShutdown {
    constructor(private readonly configService: ConfigService) {}

    async onApplicationBootstrap() {
        await this.initializeInjectableStrategies();
    }

    async onApplicationShutdown() {
        await this.destroyInjectableStrategies();
    }

    private async initializeInjectableStrategies() {
        for (const configItem of this.getInjectableConfigStrategies()) {
            if (typeof configItem.onInit === 'function') {
                await configItem.onInit(moduleRef);
            }
        }
    }

    private async destroyInjectableStrategies() {
        for (const configItem of this.getInjectableConfigStrategies()) {
            if (typeof configItem.onDestroy === 'function') {
                await configItem.onDestroy();
            }
        }
    }

    private getInjectableConfigStrategies() {
        const {
            passwordHashingStrategy,
            adminAuthenticationStrategies,
            developerAuthenticationStrategies,
            sessionCacheStrategy,
            verificationTokenStrategy,
        } = this.configService.authOptions;
        const { email, cacheStrategy } = this.configService.systemOptions;
        return [
            passwordHashingStrategy,
            sessionCacheStrategy,
            verificationTokenStrategy,
            ...adminAuthenticationStrategies,
            ...developerAuthenticationStrategies,
            email.emailTransporterStrategy,
            cacheStrategy,
        ];
    }
}
