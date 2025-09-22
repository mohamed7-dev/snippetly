import { compare, hash as baseHash, genSalt } from "bcryptjs";
export class PasswordHashService {
    async generateSalt() {
        return await genSalt(10);
    }
    async hash(password) {
        return await baseHash(password, await this.generateSalt());
    }
    async verify({ plain, hashed }) {
        return await compare(plain, hashed);
    }
}
