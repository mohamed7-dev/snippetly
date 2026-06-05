import {
  LoginRequestDtoType,
  LoginResponseDto,
  LoginResponseDtoType,
  LogoutResponseDto,
  LogoutResponseDtoType,
  RefreshTokenResponseDto,
  RefreshTokenResponseDtoType,
  SendRTokenRequestDtoType,
  SendRTokenResponseDto,
  SendRTokenResponseDtoType,
  SendVEmailRequestDtoType,
  SendVEmailResponseDto,
  SendVEmailResponseDtoType,
  SignupRequestDtoType,
  SignupResponseDto,
  SignupResponseDtoType,
  VerifyRTokenRequestBodyDtoType,
  VerifyRTokenRequestQueryDtoType,
  VerifyRTokenResponseDto,
  VerifyRTokenResponseDtoType,
  VerifyVTokenRequestDtoType,
  VerifyVTokenResponseDto,
  VerifyVTokenResponseDtoType,
} from "@snippetly/common/dto";
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { InternalServerError } from "../../common/lib/exception";
import { AuthService } from "./auth.service";

export class AuthController {
  private readonly AuthService: AuthService;

  constructor() {
    this.AuthService = new AuthService();
  }

  public login = async (
    request: Request<object, object, LoginRequestDtoType>,
    response: Response,
  ) => {
    const authResult = await this.AuthService.login(
      request.context,
      request.body,
      response,
    );

    const rawResponse = {
      type: "success",
      status: StatusCodes.OK,
      message: "Authenticated successfully.",
      data: authResult,
    } satisfies LoginResponseDtoType["success"];

    const parsed = LoginResponseDto.safeParse(rawResponse);
    if (!parsed.success) {
      throw new InternalServerError();
    }
    response.status(parsed.data.status).json(parsed.data);
  };

  public signup = async (
    request: Request<object, object, SignupRequestDtoType>,
    response: Response,
  ) => {
    const authResult = await this.AuthService.signup(
      request.context,
      request.body,
      response,
    );
    let rawResponse;
    if ("user" in authResult && authResult.user) {
      rawResponse = {
        type: "success" as const,
        status: StatusCodes.CREATED,
        message: "User account has been created successfully.",
        data: authResult,
      } satisfies SignupResponseDtoType["success"];
    } else if ("suggestedNames" in authResult) {
      rawResponse = {
        type: "conflict" as const,
        status: StatusCodes.CONFLICT,
        message: `User account with the same name ${request.body.name} already exists, but you can use one of the generated names.`,
        data: authResult,
      } satisfies SignupResponseDtoType["conflict"];
    }

    const parsed = SignupResponseDto.safeParse(rawResponse);
    if (!parsed.success) {
      throw new InternalServerError();
    }

    return response.status(parsed.data.status).json(parsed.data);
  };

  public refreshAccessToken = async (request: Request, response: Response) => {
    const result = await this.AuthService.refreshAccessToken(
      request.context,
      response,
    );

    const rawResponse = {
      status: StatusCodes.OK,
      message: "Access token has been refreshed successfully.",
      type: "success",
      data: result,
    } satisfies RefreshTokenResponseDtoType["success"];

    const parsed = RefreshTokenResponseDto.safeParse(rawResponse);
    if (!parsed.success) {
      throw new InternalServerError();
    }

    response.status(parsed.data.status).json(parsed.data);
  };

  public logout = async (request: Request, response: Response) => {
    await this.AuthService.logout(request.context, response);
    const rawResponse = {
      status: StatusCodes.OK,
      message: "Logged out successfully.",
      type: "success" as const,
      data: null,
    } satisfies LogoutResponseDtoType["success"];

    const parsed = LogoutResponseDto.safeParse(rawResponse);
    if (!parsed.success) {
      throw new InternalServerError();
    }

    response.status(parsed.data.status).json(parsed.data);
  };

  public sendVerificationEmail = async (
    request: Request<object, object, SendVEmailRequestDtoType>,
    response: Response,
  ) => {
    const result = await this.AuthService.sendVerificationEmail(
      request.context,
      request.body,
    );
    const rawResponse = {
      status: StatusCodes.OK,
      message: `Email verification has been sent to ${result.user.email}, check your inbox to verify your account.`,
      type: "success" as const,
      data: null,
    } satisfies SendVEmailResponseDtoType["success"];

    const parsed = SendVEmailResponseDto.safeParse(rawResponse);
    if (!parsed.success) {
      throw new InternalServerError();
    }
    response.status(parsed.data.status).json(parsed.data);
  };

  public verifyVerificationToken = async (
    request: Request<object, object, object, VerifyVTokenRequestDtoType>,
    response: Response,
  ) => {
    await this.AuthService.verifyVerificationToken(
      request.context,
      request.query,
    );
    const rawResponse = {
      status: StatusCodes.OK,
      message: "Email verification token has been verified successfully.",
      type: "success" as const,
      data: null,
    } satisfies VerifyVTokenResponseDtoType["success"];

    const parsed = VerifyVTokenResponseDto.safeParse(rawResponse);
    if (!parsed.success) {
      throw new InternalServerError();
    }
    response.status(parsed.data.status).json(parsed.data);
  };

  public sendResetPasswordEmail = async (
    request: Request<object, object, SendRTokenRequestDtoType>,
    response: Response,
  ) => {
    const result = await this.AuthService.sendResetPasswordEmail(
      request.context,
      request.body,
    );
    const rawResponse = {
      status: StatusCodes.OK,
      message:
        result.status === "reset-password-email-sent"
          ? `Reset password email has been sent to ${result.user.email}, check your inbox!`
          : "An email verification token was sent to your email, you need to verify your email first.",
      type: "success" as const,
      data: null,
    } satisfies SendRTokenResponseDtoType["success"];

    const parsed = SendRTokenResponseDto.safeParse(rawResponse);
    if (!parsed.success) {
      throw new InternalServerError();
    }
    response.status(parsed.data.status).json(parsed.data);
  };

  public resetPassword = async (
    request: Request<
      object,
      object,
      VerifyRTokenRequestBodyDtoType,
      VerifyRTokenRequestQueryDtoType
    >,
    response: Response,
  ) => {
    await this.AuthService.resetPassword(request.context, {
      ...request.query,
      ...request.body,
    });
    const rawResponse = {
      status: StatusCodes.OK,
      message: "Password has been updated successfully.",
      type: "success" as const,
      data: null,
    } satisfies VerifyRTokenResponseDtoType["success"];

    const parsed = VerifyRTokenResponseDto.safeParse(rawResponse);
    if (!parsed.success) {
      throw new InternalServerError();
    }
    response.status(parsed.data.status).json(parsed.data);
  };
}
