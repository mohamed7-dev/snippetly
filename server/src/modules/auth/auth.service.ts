import { StatusCodes } from "http-status-codes";
import { HttpException } from "../../common/lib/exception";
import { SignupDtoType } from "./dto/signup.dto";
import { LoginDtoType } from "./dto/login.dto";
import { UserService } from "../user/user.service";
import { Response } from "express";
import { JWTPayload, TokenService } from "./token.service";
import { REFRESH_TOKEN_COOKIE_KEY } from "./constants";
import { PasswordHashService } from "./password-hash.service";
import { EmailService } from "../email/email.service";
import { APP_URL } from "../../config";
import { ResetPasswordDtoType } from "./dto/reset-password.dto";
import { SendVEmailDtoType } from "./dto/send-v-email.dto";
import { VerifyTokenDtoType } from "./dto/verify-token.dto";
import { SendREmailDtoType } from "./dto/send-r-email.dto";
import { RequestContext } from "../../common/middlewares";

export class AuthService {
  private readonly UserService: UserService;
  private readonly TokenService: TokenService;
  private readonly PasswordHashService: PasswordHashService;

  constructor() {
    this.UserService = new UserService();
    this.TokenService = new TokenService();
    this.PasswordHashService = new PasswordHashService();
  }

  public async login(ctx: RequestContext, input: LoginDtoType, res: Response) {
    const { name, password } = input;
    const refreshToken = ctx.req.cookies?.[REFRESH_TOKEN_COOKIE_KEY] as string;

    const foundUser = await this.UserService.findOneQueryBuilder({ name });

    if (!foundUser)
      throw new HttpException(StatusCodes.NOT_FOUND, "User not found.");

    const isPasswordValid = await this.PasswordHashService.verify({
      plain: password,
      hashed: foundUser.password,
    });

    if (!isPasswordValid)
      throw new HttpException(StatusCodes.UNAUTHORIZED, "Invalid credentials.");

    //check if the refresh token is reused
    let newRefreshTokenArray = !refreshToken
      ? foundUser.refreshTokens
      : foundUser.refreshTokens.filter((rt) => rt !== refreshToken);

    if (refreshToken) {
      /* 
        Scenario added here: 
            1) User logs in but never uses RT and does not logout 
            2) RT is stolen
            3) If 1 & 2, reuse detection is needed to clear all RTs when user logs in
      */
      const foundToken = await this.UserService.findOneQueryBuilder({
        refreshTokens: refreshToken,
      });

      // Detected refresh token reuse!
      if (!foundToken) {
        // clear out aLL previous refresh tokens
        newRefreshTokenArray = [];
      }

      this.clearRefreshTokenCookie(res);
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      this.generateJWT({
        name: foundUser.name,
        id: foundUser.id,
        email: foundUser.email,
      });

    foundUser.refreshTokens = [...newRefreshTokenArray, newRefreshToken];
    let updatedUser = await foundUser.save();

    this.setRefreshTokenCookie(res, newRefreshToken);

    return { accessToken: newAccessToken, user: updatedUser };
  }

  public async signup(
    ctx: RequestContext,
    input: SignupDtoType,
    res: Response
  ) {
    try {
      const newUser = await this.UserService.create(ctx, input);

      const data = await this.login(
        ctx,
        { name: newUser.name, password: input.password },
        res
      );

      return {
        data: { accessToken: data.accessToken, user: newUser },
        message: "User account has been registered successfully.",
        status: StatusCodes.CREATED,
      };
    } catch (error) {
      if (
        error instanceof HttpException &&
        error.status === StatusCodes.CONFLICT
      ) {
        const suggestedNames = await this.UserService.suggestUniqueNames(
          input.name
        );
        return {
          data: suggestedNames,
          message: "User account already taken.",
          status: StatusCodes.CONFLICT,
        };
      }
      throw error;
    }
  }

  public async generateRefreshToken(ctx: RequestContext, res: Response) {
    const refreshToken = ctx.req.cookies[REFRESH_TOKEN_COOKIE_KEY];

    if (!refreshToken) return this.throwSessionError();

    this.clearRefreshTokenCookie(res);

    const foundUserWithToken = await this.UserService.findOneQueryBuilder({
      refreshTokens: refreshToken,
    });

    if (!foundUserWithToken) {
      this.TokenService.verifyRefreshToken(
        refreshToken,
        async (err, decoded) => {
          if (err) return this.throwSessionError();
          const hackedUser = await this.UserService.findOneQueryBuilder({
            _id: decoded.id,
          });
          hackedUser.refreshTokens = [];
          await hackedUser.save();
        }
      );
      return this.throwSessionError();
    }

    const newRefreshTokenArray = foundUserWithToken.refreshTokens.filter(
      (rt) => rt !== refreshToken
    );

    this.TokenService.verifyRefreshToken(refreshToken, async (err, decoded) => {
      if (err) {
        // expired refresh token
        foundUserWithToken.refreshTokens = [...newRefreshTokenArray];
        await foundUserWithToken.save();
      }
      if (err || foundUserWithToken.id !== decoded.id) {
        return this.throwSessionError();
      }
    });
    // Refresh token rotation
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      this.generateJWT({
        name: foundUserWithToken.name,
        id: foundUserWithToken.id,
        email: foundUserWithToken.email,
      });
    foundUserWithToken.refreshTokens = [
      ...newRefreshTokenArray,
      newRefreshToken,
    ];
    await foundUserWithToken.save();
    this.setRefreshTokenCookie(res, newRefreshToken);

    return { accessToken: newAccessToken, user: foundUserWithToken };
  }

  public async logout(ctx: RequestContext, res: Response) {
    const refreshToken = ctx.req.cookies?.[REFRESH_TOKEN_COOKIE_KEY] as string;

    if (!refreshToken) return this.throwSessionError();

    const foundUserWithToken = await this.UserService.findOneQueryBuilder({
      refreshTokens: refreshToken,
    });

    if (!foundUserWithToken) {
      this.clearRefreshTokenCookie(res);
      return this.throwSessionError();
    }
    foundUserWithToken.refreshTokens = foundUserWithToken.refreshTokens.filter(
      (rt) => rt !== refreshToken
    );
    await foundUserWithToken.save();
    this.clearRefreshTokenCookie(res);

    return foundUserWithToken;
  }

  public async sendVerificationEmail(
    _ctx: RequestContext,
    input: SendVEmailDtoType
  ) {
    const { email } = input;
    const { token, user } =
      await this.TokenService.generateEmailVerificationToken(email);
    EmailService.sendVerificationEmail({
      email: user.email,
      username: `${user.firstName} ${user.lastName}`,
      callbackUrl: `${APP_URL}/api/v1/auth/verify-email-token?token=${token}`,
    });
    return { user, token };
  }

  public async verifyVerificationToken(
    _ctx: RequestContext,
    input: VerifyTokenDtoType
  ) {
    const token = input.token;
    const user = await this.TokenService.verifyEmailVerificationToken(token);
    return { user, token };
  }

  public async sendResetPasswordEmail(
    _ctx: RequestContext,
    input: SendREmailDtoType
  ) {
    const { email } = input;
    const { token, user } = await this.TokenService.generateResetPasswordToken(
      email
    );

    EmailService.sendResetEmail({
      email: user.email,
      username: `${user.firstName} ${user.lastName}`,
      callbackUrl: `${APP_URL}/api/v1/auth/reset-password?token=${token}`,
    });

    return { user, token };
  }

  public async resetPassword(
    ctx: RequestContext,
    input: ResetPasswordDtoType & VerifyTokenDtoType
  ) {
    const token = input.token;
    const foundUser = await this.TokenService.verifyResetPasswordToken(token);
    const updatedUser = this.UserService.updatePassword(ctx, {
      password: input.password,
      email: foundUser.email,
    });

    return { user: updatedUser, token };
  }

  private generateJWT(payload: JWTPayload) {
    return {
      refreshToken: this.TokenService.signRefreshJWT(payload),
      accessToken: this.TokenService.signAccessJWT(payload),
    };
  }

  private throwSessionError(): never {
    throw new HttpException(
      StatusCodes.UNAUTHORIZED,
      "Invalid session credentials."
    );
  }

  private clearRefreshTokenCookie(res: Response) {
    res.clearCookie(REFRESH_TOKEN_COOKIE_KEY, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
  }

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie(REFRESH_TOKEN_COOKIE_KEY, refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      expires: new Date(this.TokenService.decodeToken(refreshToken).exp * 1000),
    });
  }
}
