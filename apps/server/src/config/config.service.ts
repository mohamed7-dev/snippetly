import { Injectable } from '../infra/ioc-container/injectable.decorator';
import { AppConfigUtils } from './app-config-utils';
import { RuntimeAppConfig } from './app-config.interface';

@Injectable()
export class ConfigService {
    get apiOptions(): RuntimeAppConfig['api'] {
        return AppConfigUtils.getConfig().api;
    }

    get databaseOptions(): RuntimeAppConfig['database'] {
        return AppConfigUtils.getConfig().database;
    }

    get systemOptions(): RuntimeAppConfig['system'] {
        return AppConfigUtils.getConfig().system;
    }

    get authOptions(): RuntimeAppConfig['auth'] {
        return AppConfigUtils.getConfig().auth;
    }

    get defaultLanguageCode(): RuntimeAppConfig['defaultLanguageCode'] {
        return AppConfigUtils.getConfig().defaultLanguageCode;
    }
}
