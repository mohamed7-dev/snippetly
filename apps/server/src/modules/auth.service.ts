import { Injectable } from '../infra/ioc-container/injectable.decorator';
import { UserService } from './user.service';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService) {
        console.log(userService);
    }
}
