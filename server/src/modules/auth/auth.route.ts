import { Router } from "express";
import { AuthController } from "./auth.controller";
import { zodValidatorMiddleware } from "../../common/middlewares/zod-validator.middleware";
import { LoginDto } from "./dto/login.dto";
import { SignupDto } from "./dto/signup.dto";
import { Route } from "../../common/types/express";

export class AuthRoute implements Route {
  public path: string = "/auth";
  public router: Router = Router();
  public controller: AuthController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.put(
      `${this.path}/login`,
      zodValidatorMiddleware(LoginDto),
      this.controller.login
    );
    this.router.post(
      `${this.path}/signup`,
      zodValidatorMiddleware(SignupDto),
      this.controller.signup
    );
  }
}
