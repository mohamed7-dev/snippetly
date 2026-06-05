import baseCors from 'cors';
import { ConfigService } from '../../config/config.service';
import { iocContainer } from '../../infra/ioc-container/ioc-container';

export function cors() {
    const configService = iocContainer.resolve<ConfigService>(ConfigService);
    return baseCors(configService.apiOptions.cors);
}
