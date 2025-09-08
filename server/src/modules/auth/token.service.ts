import jwt from "jsonwebtoken";
import {
  ACCESS_JWTOKEN_SECRET,
  JWT_ACCESS_EXPIRES,
  JWT_REFRESH_EXPIRES,
  REFRESH_JWTOKEN_SECRET,
} from "../../config";
import { HttpException } from "../../common/lib/exception";
import { StatusCodes } from "http-status-codes";
import { UserService } from "../user/user.service";
import { TOKEN_EXPIRES } from "./constants";
import crypto from "crypto";
import { Request } from "express";

export type JWTPayload = Request["user"];

export class TokenService {
  private readonly UserService: UserService;
  constructor() {
    this.UserService = new UserService();
  }

  public signAccessJWT(payload: JWTPayload) {
    return jwt.sign(payload, ACCESS_JWTOKEN_SECRET, {
      expiresIn: JWT_ACCESS_EXPIRES,
    });
  }

  public signRefreshJWT(payload: JWTPayload) {
    return jwt.sign(payload, REFRESH_JWTOKEN_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES,
    });
  }

  public decodeToken(token: string) {
    return jwt.decode(token) as { exp: number };
  }

  public async verifyRefreshToken(
    token: string,
    cb: (
      err: jwt.VerifyErrors,
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

  public async generateEmailVerificationToken(email: string) {
    const generatedToken = this.generateRandomUUID();

    const foundUser = await this.UserService.findOneQueryBuilder({
      email,
    }).select("-password");

    if (!foundUser) {
      throw new HttpException(
        StatusCodes.NOT_FOUND,
        `User with email ${email} is not found`
      );
    }

    const foundVToken = foundUser?.emailVerificationToken;
    if (foundVToken) {
      foundUser.emailVerificationToken = null;
      foundUser.emailVerificationExpiresAt = null;
      await foundUser.save();
    }

    foundUser.emailVerificationToken = generatedToken;
    foundUser.emailVerificationExpiresAt = TOKEN_EXPIRES;

    await foundUser.save();
    return { token: generatedToken, user: foundUser };
  }

  public async verifyEmailVerificationToken(token: string) {
    const foundUserWithToken = await this.UserService.findOneQueryBuilder({
      emailVerificationToken: token,
    });

    if (!foundUserWithToken) {
      throw new HttpException(StatusCodes.UNAUTHORIZED, "Invalid token.");
    }

    const isTokenExpired =
      new Date(foundUserWithToken.emailVerificationExpiresAt) < new Date();

    if (isTokenExpired) {
      throw new HttpException(StatusCodes.UNAUTHORIZED, "Invalid token.");
    }

    foundUserWithToken.emailVerificationToken = null;
    foundUserWithToken.emailVerificationExpiresAt = null;
    foundUserWithToken.emailVerifiedAt = new Date();

    await foundUserWithToken.save();

    return foundUserWithToken;
  }

  public async generateResetPasswordToken(email: string) {
    const generatedToken = this.generateRandomUUID();

    const foundUser = await this.UserService.findOneQueryBuilder({
      email,
    }).select("-password");
    if (!foundUser) {
      throw new HttpException(
        StatusCodes.NOT_FOUND,
        `User with email ${email} is not found`
      );
    }

    const foundRToken = foundUser?.resetPasswordToken;
    if (foundRToken) {
      foundUser.resetPasswordToken = null;
      foundUser.resetPasswordExpiresAt = null;
      await foundUser.save();
    }

    foundUser.resetPasswordToken = generatedToken;
    foundUser.resetPasswordExpiresAt = TOKEN_EXPIRES;

    await foundUser.save();
    return { token: generatedToken, user: foundUser };
  }

  public async verifyResetPasswordToken(token: string) {
    const foundUserWithToken = await this.UserService.findOneQueryBuilder({
      resetPasswordToken: token,
    });

    if (!foundUserWithToken) {
      throw new HttpException(StatusCodes.UNAUTHORIZED, "Invalid token.");
    }

    const isTokenExpired =
      new Date(foundUserWithToken.resetPasswordExpiresAt) < new Date();

    if (isTokenExpired) {
      throw new HttpException(StatusCodes.UNAUTHORIZED, "Invalid token.");
    }

    foundUserWithToken.resetPasswordToken = null;
    foundUserWithToken.resetPasswordExpiresAt = null;

    await foundUserWithToken.save();

    return foundUserWithToken;
  }

  private generateRandomUUID() {
    const token = crypto.randomUUID();
    return token;
  }
}
