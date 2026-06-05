import { compare, hash as baseHash, genSalt } from "bcryptjs";

export class PasswordHashService {
  private async generateSalt() {
    return await genSalt(10);
  }

  public async hash(password: string) {
    return await baseHash(password, await this.generateSalt());
  }

  public async verify({ plain, hashed }: { plain: string; hashed: string }) {
    return await compare(plain, hashed);
  }
}
