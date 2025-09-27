import jwt from "jsonwebtoken";
import {
  ACCESS_JWTOKEN_SECRET,
  JWT_ACCESS_EXPIRES,
  REFRESH_JWTOKEN_SECRET,
} from "../../config/index";
import { HttpException } from "../../common/lib/exception";
import { StatusCodes } from "http-status-codes";
import { TOKEN_EXPIRES } from "./constants";
import crypto from "crypto";
import type { Request } from "express";
import { UserReadService } from "../user/user-read.service";
import { UserRepository } from "../user/user.repository";
import { getRefreshTokenExpires } from "../../common/lib/utils";
import type { User } from "../../common/db/schema";

export type JWTPayload = Request["context"]["user"];

export class TokenService {
  private readonly UserReadService: UserReadService;
  private readonly UserRepository: UserRepository;
  constructor() {
    this.UserReadService = new UserReadService();
    this.UserRepository = new UserRepository();
  }

  public signAccessJWT(payload: JWTPayload) {
    return jwt.sign(payload, ACCESS_JWTOKEN_SECRET, {
      expiresIn: JWT_ACCESS_EXPIRES / 1000,
    });
  }

  public signRefreshJWT(payload: JWTPayload, rememberMe: boolean) {
    return jwt.sign(payload, REFRESH_JWTOKEN_SECRET, {
      expiresIn: getRefreshTokenExpires(rememberMe) / 1000,
    });
  }

  public decodeToken(token: string) {
    return jwt.decode(token) as { exp: number };
  }

  public async verifyRefreshToken(
    token: string,
    cb: (
      err: jwt.VerifyErrors | null,
      decoded: jwt.JwtPayload & JWTPayload
    ) => Promise<unknown> | unknown
  ) {
    jwt.verify(token, REFRESH_JWTOKEN_SECRET, (err, decoded) => {
      if (typeof decoded === "string") {
        new HttpException(
          StatusCodes.UNAUTHORIZED,
          "Invalid session credentials."
        );
      }
      cb(err, decoded as jwt.JwtPayload & JWTPayload);
    });
  }

  public async generateEmailVerificationToken(email: string, user?: User) {
    let foundUser = user ?? null;
    if (!user) {
      foundUser = await this.findUserByEmail(email);
    }
    if (!foundUser) {
      throw new HttpException(StatusCodes.NOT_FOUND, "User account not found.");
    }

    const generatedToken = this.generateRandomUUID();

    const [updatedUser] = await this.UserRepository.update(foundUser.id, {
      emailVerificationToken: generatedToken,
      emailVerificationTokenExpiresAt: TOKEN_EXPIRES,
    });

    return { token: generatedToken, user: updatedUser };
  }

  public async verifyEmailVerificationToken(token: string) {
    const foundUserWithToken = await this.UserReadService.findOneByEmailVToken(
      token
    );

    if (
      !foundUserWithToken ||
      !foundUserWithToken.emailVerificationTokenExpiresAt
    ) {
      throw new HttpException(StatusCodes.UNAUTHORIZED, "Invalid token.");
    }

    const isTokenExpired =
      new Date(foundUserWithToken.emailVerificationTokenExpiresAt) < new Date();

    if (isTokenExpired) {
      throw new HttpException(StatusCodes.UNAUTHORIZED, "Invalid token.");
    }

    const [updatedUser] = await this.UserRepository.update(
      foundUserWithToken.id,
      {
        emailVerificationToken: null,
        emailVerificationTokenExpiresAt: null,
        emailVerifiedAt: new Date(),
      }
    );

    return updatedUser;
  }

  public async generateResetPasswordToken(email: string, user?: User) {
    let foundUser = user ? user : null;

    if (!user) {
      foundUser = await this.findUserByEmail(email);
    }
    if (!foundUser) {
      throw new HttpException(StatusCodes.NOT_FOUND, `User not found.`);
    }
    const generatedToken = this.generateRandomUUID();

    const [updatedUser] = await this.UserRepository.update(foundUser.id, {
      resetPasswordToken: generatedToken,
      resetPasswordTokenExpiresAt: TOKEN_EXPIRES,
    });

    return { token: generatedToken, user: updatedUser };
  }

  public async verifyResetPasswordToken(token: string) {
    const foundUserWithToken = await this.UserReadService.findOneByResetToken(
      token
    );

    if (
      !foundUserWithToken ||
      !foundUserWithToken.resetPasswordTokenExpiresAt
    ) {
      throw new HttpException(StatusCodes.UNAUTHORIZED, "Invalid token.");
    }

    const isTokenExpired =
      new Date(foundUserWithToken.resetPasswordTokenExpiresAt) < new Date();

    if (isTokenExpired) {
      throw new HttpException(StatusCodes.UNAUTHORIZED, "Invalid token.");
    }
    const [updatedUser] = await this.UserRepository.update(
      foundUserWithToken.id,
      {
        resetPasswordToken: null,
        resetPasswordTokenExpiresAt: null,
      }
    );

    return updatedUser;
  }

  private generateRandomUUID() {
    const token = crypto.randomUUID();
    return token;
  }

  private async findUserByEmail(email: string) {
    const foundUser = await this.UserReadService.findOneSlim("email", email);

    if (!foundUser) {
      throw new HttpException(
        StatusCodes.NOT_FOUND,
        `User with email ${email} is not found`
      );
    }
    return foundUser;
  }
}
