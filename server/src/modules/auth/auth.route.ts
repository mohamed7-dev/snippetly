import { Router } from "express";
import { AuthController } from "./auth.controller";
import { zodValidatorMiddleware } from "../../common/middlewares/zod-validator.middleware";
import { LoginDto } from "./dto/login.dto";
import { SignupDto } from "./dto/signup.dto";
import { Route } from "../../common/types/express";
import { authMiddleware } from "../../common/middlewares/auth.middleware";
import { SendVEmailDto } from "./dto/send-v-email.dto";
import { SendREmailDto } from "./dto/send-r-email.dto";

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
    this.router.put(
      `${this.path}/logout`,
      authMiddleware,
      this.controller.logout
    );
    this.router.put(
      `${this.path}/refresh-token`,
      authMiddleware,
      this.controller.generateRefreshToken
    );
    // These routes are public since resetting password or
    // verifying an email could be done when the user is not authenticated
    // e.g. forget password feature in login form.
    this.router.put(
      `${this.path}/send-verification-email`,
      zodValidatorMiddleware(SendVEmailDto),
      this.controller.sendVerificationEmail
    );
    this.router.put(
      `${this.path}/verify-email-token`,
      this.controller.verifyVerificationToken
    );
    this.router.put(
      `${this.path}/send-reset-email`,
      zodValidatorMiddleware(SendREmailDto),
      this.controller.sendResetPasswordEmail
    );
    this.router.put(
      `${this.path}/reset-password`,
      this.controller.resetPassword
    );
  }
}
