import { StatusCodes } from "http-status-codes";
import { HttpException } from "../../common/lib/exception";
import { SignupDtoType } from "./dto/signup.dto";
import { LoginDtoType } from "./dto/login.dto";
import { UserService } from "../user/user.service";
import { Request, Response } from "express";
import { JWTPayload, TokenService } from "./token.service";
import { REFRESH_TOKEN_COOKIE_KEY } from "./constants";
import { PasswordHashService } from "./password-hash.service";
import { EmailService } from "../email/email.service";
import { APP_URL } from "../../config";
import { ResetPasswordDtoType } from "./dto/reset-password.dto";

export class AuthService {
  private readonly UserService: UserService;
  private readonly TokenService: TokenService;
  private readonly PasswordHashService: PasswordHashService;

  constructor() {
    this.UserService = new UserService();
    this.TokenService = new TokenService();
    this.PasswordHashService = new PasswordHashService();
  }

  public async login(req: Request<{}, {}, LoginDtoType>, res: Response) {
    const { name, password } = req.body;
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_KEY] as string;

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

    res.cookie(REFRESH_TOKEN_COOKIE_KEY, newRefreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      expires: new Date(
        this.TokenService.decodeToken(newRefreshToken).exp * 1000
      ),
    });

    return {
      data: { accessToken: newAccessToken, foundUser: updatedUser },
      message: "Authenticated successfully.",
      status: StatusCodes.OK,
    };
  }

  public async signup(req: Request<{}, {}, SignupDtoType>, res: Response) {
    try {
      const newUser = await this.UserService.create(req.body);

      const { data } = await this.login(req, res);

      return {
        data: { accessToken: data.accessToken, newUser },
        message: "User account has been registered successfully.",
        status: StatusCodes.CREATED,
      };
    } catch (error) {
      if (
        error instanceof HttpException &&
        error.status === StatusCodes.CONFLICT
      ) {
        const suggestedNames = this.UserService.suggestUniqueNames(
          req.body.name
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

  public async generateRefreshToken(req: Request, res: Response) {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_KEY];

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
            id: decoded.id,
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

    let returnStatement;
    this.TokenService.verifyRefreshToken(refreshToken, async (err, decoded) => {
      if (err) {
        // expired refresh token
        foundUserWithToken.refreshTokens = [...newRefreshTokenArray];
        await foundUserWithToken.save();
      }
      if (err || foundUserWithToken._id.toString() !== decoded.id) {
        return this.throwSessionError();
      }
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
      res.cookie(REFRESH_TOKEN_COOKIE_KEY, newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: new Date(
          this.TokenService.decodeToken(newRefreshToken).exp * 1000
        ),
      });

      returnStatement = {
        data: { accessToken: newAccessToken, foundUser: foundUserWithToken },
        message: "Refresh token has been generated successfully.",
        status: StatusCodes.CREATED,
      };
    });

    return returnStatement as {
      data: { accessToken: string; foundUser: typeof foundUserWithToken };
      message: string;
      status: StatusCodes;
    };
  }

  public async logout(req: Request, res: Response) {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_KEY] as string;
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

    return {
      data: null,
      message: "Logged out successfully.",
      status: StatusCodes.OK,
    };
  }

  public async sendVerificationEmail(email: string) {
    const { token, user } =
      await this.TokenService.generateEmailVerificationToken(email);
    EmailService.sendVerificationEmail({
      email: user.email,
      username: `${user.firstName} ${user.lastName}`,
      callbackUrl: `${APP_URL}/api/v1/auth/verify-email-token?token=${token}`,
    });
    return {
      data: { user, token },
      status: StatusCodes.OK,
      message: `Email verification has been sent to ${email}, check your inbox to verify your account.`,
    };
  }

  public async verifyVerificationToken(token: string) {
    const user = await this.TokenService.verifyEmailVerificationToken(token);
    return {
      data: { user, token },
      status: StatusCodes.OK,
      message: "Email verification token has been verified successfully.",
    };
  }

  public async sendResetPasswordEmail(email: string) {
    const { token, user } = await this.TokenService.generateResetPasswordToken(
      email
    );

    EmailService.sendResetEmail({
      email: user.email,
      username: `${user.firstName} ${user.lastName}`,
      callbackUrl: `${APP_URL}/api/v1/auth/reset-password?token=${token}`,
    });

    return {
      data: { user, token },
      status: StatusCodes.OK,
      message: `Reset password email has been sent to ${email}, check your inbox!.`,
    };
  }

  public async resetPassword(
    req: Request<{}, {}, ResetPasswordDtoType, { token: string }>
  ) {
    const token = req.query.token;
    await this.TokenService.verifyResetPasswordToken(token);
    const updatedUser = this.UserService.updatePassword(req);

    return {
      data: { user: updatedUser, token },
      status: StatusCodes.OK,
      message: "Password has been updated successfully",
    };
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
}
