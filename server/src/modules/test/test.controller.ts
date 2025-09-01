import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { TestService } from "./test.service";

export class TestController {
  private readonly testServices: TestService;

  constructor() {
    this.testServices = new TestService();
  }

  public getHello = (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    response.status(StatusCodes.OK).send(this.testServices.sayHello("Dave"));
  };
}
