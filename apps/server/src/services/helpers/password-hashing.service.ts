import { ConfigService } from '../../config/config.service';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';

@Injectable()
export class PasswordHashingService {
    constructor(private configService: ConfigService) {}

    public async hash(plaintext: string): Promise<string> {
        return await this.configService.authOptions.passwordHashingStrategy.hash(plaintext);
    }

    public async verify(plaintext: string, hash: string): Promise<boolean> {
        return await this.configService.authOptions.passwordHashingStrategy.verify(plaintext, hash);
    }
}
