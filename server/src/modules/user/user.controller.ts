import { NextFunction, Request, Response } from "express";
import { UserService } from "./user.service";
import { StatusCodes } from "http-status-codes";

export class UserController {
  private readonly UserService: UserService;

  constructor() {
    this.UserService = new UserService();
  }

  public getHello = (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    response.status(StatusCodes.OK).send(this.UserService.sayHello("Dave"));
  };
}
