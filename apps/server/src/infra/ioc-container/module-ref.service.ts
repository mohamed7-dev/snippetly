import { iocContainer as baseIocContainer, IocContainer } from '../../infra/ioc-container/ioc-container';
import { Token } from './types';

export class ModuleRef {
    private iocContainer: Readonly<IocContainer>;

    constructor() {
        this.iocContainer = baseIocContainer;
    }

    public getProvider<Provider>(token: Token): Provider {
        return this.iocContainer.resolve<Provider>(token);
    }
}
