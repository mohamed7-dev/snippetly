import { StatusCodes } from "http-status-codes";
import { HttpException } from "../../common/lib/exception";
import { IUser, User } from "../user/user.model";
import { SignupDtoType } from "./dto/signup.dto";
import { hash, genSalt, compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { LoginDtoType } from "./dto/login.dto";
import { JWT_SECRET_KEY } from "../../config";
import { UserService } from "../user/user.service";

export class AuthService {
  private readonly UserService: UserService;
  constructor() {
    this.UserService = new UserService();
  }
  public async login({ password, name }: LoginDtoType) {
    const foundUser = await User.findOne({ name });
    if (!foundUser)
      throw new HttpException(StatusCodes.NOT_FOUND, "User not found.");

    const isPasswordValid = await compare(password, foundUser.password);
    if (!isPasswordValid)
      throw new HttpException(StatusCodes.UNAUTHORIZED, "Invalid credentials.");
    const token = this.generateJWT({ id: foundUser.id, name: foundUser.name });

    return { token, foundUser };
  }

  public async signup(input: SignupDtoType) {
    const newUser = await this.UserService.create(input);

    const token = this.generateJWT({ id: newUser.id, name: newUser.name });

    return { token, newUser };
  }

  private generateJWT({ id, name }: Pick<IUser, "id" | "name">) {
    return jwt.sign(
      {
        id,
        name,
      },
      JWT_SECRET_KEY
    );
  }
}
