import bcrypt from 'bcryptjs';
import { PasswordHashingStrategy } from './password-hashing-strategy.interface';

export class BcryptPasswordHashingStrategy implements PasswordHashingStrategy {
    private readonly saltRound = 10;

    async hash(plain: string): Promise<string> {
        return await bcrypt.hash(plain, this.saltRound);
    }

    async verify(plain: string, hash: string): Promise<boolean> {
        return bcrypt.compare(plain, hash);
    }
}
