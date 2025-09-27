import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { StatusCodes } from "http-status-codes";
import type { LoginDtoType } from "./dto/login.dto";
import type { SignupDtoType } from "./dto/signup.dto";
import {
  LoginResponseDto,
  RefreshTokenResDto,
  SignupResponseDto,
} from "./dto/response.dto";
import { InternalServerError } from "../../common/lib/exception";
import type { ResetPasswordDtoType } from "./dto/reset-password.dto";
import type { SendVEmailDtoType } from "./dto/send-v-email.dto";
import type { SendREmailDtoType } from "./dto/send-r-email.dto";
import type { VerifyTokenDtoType } from "./dto/verify-token.dto";

export class AuthController {
  private readonly AuthService: AuthService;

  constructor() {
    this.AuthService = new AuthService();
  }

  public login = async (
    request: Request<{}, {}, LoginDtoType>,
    response: Response
  ) => {
    const data = await this.AuthService.login(
      request.context,
      request.body,
      response
    );
    const { success, data: parsedData } = LoginResponseDto.safeParse(data);
    if (!success) {
      throw new InternalServerError();
    }
    response.status(StatusCodes.OK).json({
      message: "Authenticated successfully.",
      data: parsedData,
    });
  };

  public signup = async (
    request: Request<{}, {}, SignupDtoType>,
    response: Response
  ) => {
    const data = await this.AuthService.signup(
      request.context,
      request.body,
      response
    );
    if ("accessToken" in data) {
      const { success, data: parsedData } = SignupResponseDto.safeParse(data);
      if (!success) {
        throw new InternalServerError();
      }
      return response.status(StatusCodes.CREATED).json({
        message: "User account has been created successfully.",
        data: parsedData,
      });
    }

    return response.status(StatusCodes.CONFLICT).json({
      message: `User account with the same name ${request.body.name} already exists, but you can use one of the generated names.`,
      data,
    });
  };

  public refreshAccessToken = async (request: Request, response: Response) => {
    const data = await this.AuthService.refreshAccessToken(
      request.context,
      response
    );

    const { success, data: parsedData } = RefreshTokenResDto.safeParse(data);
    if (!success) {
      throw new InternalServerError();
    }

    response.status(StatusCodes.OK).json({
      message: "Access token has been refreshed successfully.",
      data: parsedData,
    });
  };

  public logout = async (request: Request, response: Response) => {
    await this.AuthService.logout(request.context, response);
    response.status(StatusCodes.OK).json({
      message: "Logged out successfully.",
      data: null,
    });
  };

  public sendVerificationEmail = async (
    request: Request<{}, {}, SendVEmailDtoType>,
    response: Response
  ) => {
    const data = await this.AuthService.sendVerificationEmail(
      request.context,
      request.body
    );

    response.status(StatusCodes.OK).json({
      message: `Email verification has been sent to ${data.user.email}, check your inbox to verify your account.`,
      data: null,
    });
  };

  public verifyVerificationToken = async (
    request: Request<{}, {}, {}, VerifyTokenDtoType>,
    response: Response
  ) => {
    const data = await this.AuthService.verifyVerificationToken(
      request.context,
      request.query
    );
    response.status(StatusCodes.OK).json({
      message: "Email verification token has been verified successfully.",
      data: { token: data.token },
    });
  };

  public sendResetPasswordEmail = async (
    request: Request<{}, {}, SendREmailDtoType>,
    response: Response
  ) => {
    const data = await this.AuthService.sendResetPasswordEmail(
      request.context,
      request.body
    );

    response.status(StatusCodes.OK).json({
      message:
        data.status === "reset-password-email-sent"
          ? `Reset password email has been sent to ${data.user.email}, check your inbox!.`
          : "An email verification token was sent to your email, you need to verify your email first.",
      data: null,
    });
  };

  public resetPassword = async (
    request: Request<{}, {}, ResetPasswordDtoType, VerifyTokenDtoType>,
    response: Response
  ) => {
    const data = await this.AuthService.resetPassword(request.context, {
      ...request.query,
      ...request.body,
    });
    response.status(StatusCodes.OK).json({
      message: "Password has been updated successfully.",
      data: { token: data.token },
    });
  };
}
