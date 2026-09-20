import { EventBus } from '../../infra/event-bus/event-bus.service';
import { InitializerEvent } from '../../infra/event-bus/events/initializer.event';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';
import { AdministratorService } from '../domain/administrator.service';
import { RoleService } from '../domain/role.service';
import { DefaultRolesBuilder } from './default-roles-builder.service';

@Injectable()
export class InitializerService {
    constructor(
        private readonly roleService: RoleService,
        private readonly administratorService: AdministratorService,
        private readonly eventBus: EventBus,
        private readonly defaultRolesBuilder: DefaultRolesBuilder,
    ) {}

    public async initialize() {
        this.defaultRolesBuilder.build();
        await this.roleService.initializeRoles();
        await this.administratorService.initializeAdministrators();
        await this.eventBus.publish(new InitializerEvent());
    }
}
