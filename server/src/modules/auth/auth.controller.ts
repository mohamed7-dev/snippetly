import { NextFunction, Request, Response } from "express";
import { AuthService } from "./auth.service";
import { StatusCodes } from "http-status-codes";
import { LoginDtoType } from "./dto/login.dto";
import { SignupDtoType } from "./dto/signup.dto";

export class AuthController {
  private readonly AuthService: AuthService;

  constructor() {
    this.AuthService = new AuthService();
  }

  public login = async (
    request: Request<any, LoginDtoType>,
    response: Response,
    next: NextFunction
  ) => {
    const loginResult = await this.AuthService.login(request.body);
    //TODO: stripe password before sending user back
    response.status(StatusCodes.OK).json({
      message: "Authenticated successfully.",
      data: loginResult,
    });
    next();
  };

  public signup = async (
    request: Request<any, SignupDtoType>,
    response: Response,
    next: NextFunction
  ) => {
    const signupResult = await this.AuthService.signup(request.body);
    //TODO: stripe password before sending user back
    response.status(StatusCodes.OK).json({
      message: "Registered successfully.",
      data: signupResult,
    });
    next();
  };
}
