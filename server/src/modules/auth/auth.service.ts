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
import { APP_URL, JWT_REFRESH_EXPIRES } from "../../config";
import { ResetPasswordDtoType } from "./dto/reset-password.dto";
import { SendVEmailDtoType } from "./dto/send-v-email.dto";
import { VerifyTokenDtoType } from "./dto/verify-token.dto";
import { SendREmailDtoType } from "./dto/send-r-email.dto";
import { UserReadService } from "../user/user-read.service";
import { UserRepository } from "../user/user.repository";
import { RequestContext } from "../../common/middlewares/request-context-middleware";

export class AuthService {
  private readonly UserService: UserService;
  private readonly UserRepository: UserRepository;
  private readonly UserReadService: UserReadService;
  private readonly TokenService: TokenService;
  private readonly PasswordHashService: PasswordHashService;

  constructor() {
    this.UserService = new UserService();
    this.UserReadService = new UserReadService();
    this.TokenService = new TokenService();
    this.PasswordHashService = new PasswordHashService();
    this.UserRepository = new UserRepository();
  }

  public async login(ctx: RequestContext, input: LoginDtoType, res: Response) {
    const { name, password } = input;
    const refreshToken = ctx.req.cookies?.[REFRESH_TOKEN_COOKIE_KEY] as string;

    const foundUser = await this.UserReadService.findOneSlim("name", name);

    if (!foundUser)
      throw new HttpException(StatusCodes.NOT_FOUND, "User not found.");

    const isPasswordValid = await this.PasswordHashService.verify({
      plain: password,
      hashed: foundUser.password,
    });

    if (!isPasswordValid)
      throw new HttpException(StatusCodes.UNAUTHORIZED, "Invalid credentials.");

    // check if the refresh token exists, if so rotate it
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
      const foundToken = await this.UserReadService.findOneByRefreshToken(
        refreshToken
      );

      // danger: if refresh token is not found, then the user tries to re-use it
      // so we need to delete all refresh tokens to log the user out of all sessions.
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

    const [updatedUser] = await this.UserRepository.update(foundUser.id, {
      refreshTokens: [...newRefreshTokenArray, newRefreshToken],
    });

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

      return { accessToken: data.accessToken, user: newUser };
    } catch (error) {
      if (
        error instanceof HttpException &&
        error.status === StatusCodes.CONFLICT
      ) {
        const suggestedNames = await this.UserService.suggestUniqueNames(
          input.name
        );
        return { suggestedNames };
      }
      throw error;
    }
  }

  public async refreshAccessToken(ctx: RequestContext, res: Response) {
    const refreshToken = ctx.req.cookies[REFRESH_TOKEN_COOKIE_KEY];

    if (!refreshToken) return this.throwSessionError();

    this.clearRefreshTokenCookie(res);

    const foundUserWithToken = await this.UserReadService.findOneByRefreshToken(
      refreshToken
    );

    if (!foundUserWithToken) {
      this.TokenService.verifyRefreshToken(
        refreshToken,
        async (err, decoded) => {
          if (err) return this.throwSessionError();
          await this.UserRepository.update(decoded.id, {
            refreshTokens: [],
          });
        }
      );
      return this.throwSessionError();
    }

    const newRefreshTokenArray = foundUserWithToken.refreshTokens.filter(
      (rt) => rt !== refreshToken
    );

    this.TokenService.verifyRefreshToken(refreshToken, async (err, decoded) => {
      if (err) {
        await this.UserRepository.update(decoded.id, {
          refreshTokens: [...newRefreshTokenArray],
        });
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

    const [updatedUser] = await this.UserRepository.update(
      foundUserWithToken.id,
      {
        refreshTokens: [...newRefreshTokenArray, newRefreshToken],
      }
    );

    this.setRefreshTokenCookie(res, newRefreshToken);

    return { accessToken: newAccessToken, user: updatedUser };
  }

  public async logout(ctx: RequestContext, res: Response) {
    const refreshToken = ctx.req.cookies?.[REFRESH_TOKEN_COOKIE_KEY] as string;
    if (!refreshToken) return this.throwSessionError();

    const foundUserWithToken = await this.UserReadService.findOneByRefreshToken(
      refreshToken
    );

    if (!foundUserWithToken) {
      this.clearRefreshTokenCookie(res);
      return this.throwSessionError();
    }

    const filteredUserTokens = foundUserWithToken.refreshTokens.filter(
      (rt) => rt !== refreshToken
    );

    const [updatedUser] = await this.UserRepository.update(
      foundUserWithToken.id,
      { refreshTokens: filteredUserTokens }
    );

    this.clearRefreshTokenCookie(res);

    return updatedUser;
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
      maxAge: JWT_REFRESH_EXPIRES,
    });
  }
}
