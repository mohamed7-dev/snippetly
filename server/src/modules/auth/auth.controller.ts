import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { StatusCodes } from "http-status-codes";
import { LoginDtoType } from "./dto/login.dto";
import { SignupDtoType } from "./dto/signup.dto";
import { LoginResponseDto } from "./dto/response.dto";
import { HttpException } from "../../common/lib/exception";
import { ResetPasswordDtoType } from "./dto/reset-password.dto";
import { SendVEmailDtoType } from "./dto/send-v-email.dto";
import { SendREmailDtoType } from "./dto/send-r-email.dto";

export class AuthController {
  private readonly AuthService: AuthService;

  constructor() {
    this.AuthService = new AuthService();
  }

  public login = async (
    request: Request<{}, {}, LoginDtoType>,
    response: Response
  ) => {
    const loginResult = await this.AuthService.login(request, response);
    const { success, data: parsedData } = LoginResponseDto.safeParse(
      loginResult.data
    );
    if (!success) {
      throw new HttpException(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Oops, Something went wrong."
      );
    }
    response.status(loginResult.status).json({
      message: loginResult.message,
      data: parsedData,
    });
  };

  public signup = async (
    request: Request<{}, {}, SignupDtoType>,
    response: Response
  ) => {
    const { data, message, status } = await this.AuthService.signup(
      request,
      response
    );
    const { success, data: parsedData } = LoginResponseDto.safeParse(data);
    if (!success) {
      throw new HttpException(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Oops, Something went wrong."
      );
    }
    response.status(status).json({
      message,
      data: parsedData,
    });
  };

  public generateRefreshToken = async (
    request: Request,
    response: Response
  ) => {
    const { status, data, message } =
      await this.AuthService.generateRefreshToken(request, response);
    const { success, data: parsedData } = LoginResponseDto.safeParse(data);
    if (!success) {
      throw new HttpException(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Oops, Something went wrong."
      );
    }
    response.status(status).json({
      message,
      data: parsedData,
    });
  };

  public logout = async (request: Request, response: Response) => {
    const { data, status, message } = await this.AuthService.logout(
      request,
      response
    );
    response.status(status).json({
      message,
      data,
    });
  };

  public sendVerificationEmail = async (
    request: Request<{}, {}, SendVEmailDtoType>,
    response: Response
  ) => {
    const { status, message } = await this.AuthService.sendVerificationEmail(
      request.body.email
    );

    response.status(status).json({
      message,
      data: null,
    });
  };

  public verifyVerificationToken = async (
    request: Request<{}, {}, {}, { token: string }>,
    response: Response
  ) => {
    const { data, status, message } =
      await this.AuthService.verifyVerificationToken(request.query.token);
    response.status(status).json({
      message,
      data: data.token,
    });
  };

  public sendResetPasswordEmail = async (
    request: Request<{}, {}, SendREmailDtoType>,
    response: Response
  ) => {
    const { status, message } = await this.AuthService.sendResetPasswordEmail(
      request.body.email
    );
    response.status(status).json({
      message,
      data: null,
    });
  };

  public resetPassword = async (
    request: Request<{}, {}, ResetPasswordDtoType, { token: string }>,
    response: Response
  ) => {
    const { data, status, message } = await this.AuthService.resetPassword(
      request
    );
    response.status(status).json({
      message,
      data: data.token,
    });
  };
}
