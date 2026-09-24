import baseCors from 'cors';
import { ConfigService } from '../../config/config.service';
import { moduleRef } from '../../infra/ioc-container/module-ref';

export function cors() {
    const configService = moduleRef.getProvider<ConfigService>(ConfigService);
    return baseCors(configService.apiOptions.cors);
}
