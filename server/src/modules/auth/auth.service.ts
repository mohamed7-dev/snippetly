import { StatusCodes } from "http-status-codes";
import { HttpException } from "../../common/lib/exception";
import { User } from "../user/user.module";
import { SignupDtoType } from "./dto/signup.dto";
import { hash, genSalt, compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { LoginDtoType } from "./dto/login.dto";

export class AuthService {
  public async login({ password, name }: LoginDtoType) {
    const foundUser = await User.findOne({ name });
    if (!foundUser)
      throw new HttpException(StatusCodes.NOT_FOUND, "User not found.");

    const isPasswordValid = await compare(password, foundUser.password);
    if (!isPasswordValid)
      throw new HttpException(StatusCodes.UNAUTHORIZED, "Invalid credentials.");
    const token = jwt.sign(
      {
        id: foundUser._id,
        name: foundUser.name,
      },
      process.env.SECRET_KEY
    );

    return { token, foundUser };
  }

  public async signup({ firstName, lastName, password, email }: SignupDtoType) {
    const foundUser = await User.findOne({ email });

    if (foundUser)
      throw new HttpException(
        StatusCodes.CONFLICT,
        "User account already exists."
      );

    const hashedPassword = await hash(password, await genSalt(10));

    const name = firstName.slice(0, 3).concat(lastName.slice(0, 3));
    const newUser = await User.create({
      firstName,
      lastName,
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      {
        id: newUser._id,
        name: newUser.name,
      },
      process.env.SECRET_KEY
    );

    return { token, newUser };
  }
}
