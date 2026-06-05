import { Module } from '../infra/ioc-container/module.decorator';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

@Module({
    providers: [AuthService, UserService],
    controllers: [AuthController],
})
export class AuthModule {}
