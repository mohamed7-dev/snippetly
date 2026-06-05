import { Injectable } from '../infra/ioc-container/injectable.decorator';
import { AppConfigUtils } from './app-config-utils';
import { RuntimeAppConfig } from './app-config.interface';

@Injectable()
export class ConfigService {
    private appConfig: RuntimeAppConfig;
    constructor() {
        this.appConfig = AppConfigUtils.getConfig();
    }

    get apiOptions(): RuntimeAppConfig['api'] {
        return this.appConfig.api;
    }

    get databaseOptions(): RuntimeAppConfig['database'] {
        return this.appConfig.database;
    }

    get systemOptions(): RuntimeAppConfig['system'] {
        return this.appConfig.system;
    }

    get authOptions(): RuntimeAppConfig['auth'] {
        return this.appConfig.auth;
    }

    get defaultLanguageCode(): RuntimeAppConfig['defaultLanguageCode'] {
        return this.appConfig.defaultLanguageCode;
    }
}
