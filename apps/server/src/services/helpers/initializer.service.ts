import { Injectable } from '../../infra/ioc-container/injectable.decorator';
import { AdministratorService } from '../domain/administrator.service';
import { RoleService } from '../domain/role.service';

@Injectable()
export class InitializerService {
    constructor(
        private readonly roleService: RoleService,
        private readonly administratorService: AdministratorService,
    ) {}

    public async initialize() {
        await this.roleService.initializeRoles();
        await this.administratorService.initializeAdministrators();
    }
}
