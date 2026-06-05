import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "./auth.controller";
import { zodValidatorMiddleware } from "../../common/middlewares/zod-validator.middleware";
import { type Route } from "../../common/types/express";
import { authMiddleware } from "../../common/middlewares/auth.middleware";
import {
  LoginRequestDto,
  SendRTokenRequestDto,
  SendVEmailRequestDto,
  SignupRequestDto,
  VerifyRTokenRequestBodyDto,
  VerifyRTokenRequestQueryDto,
  VerifyVTokenRequestDto,
} from "@snippetly/common/dto";

export class AuthRoute implements Route {
  public path: string = "/auth";
  public router: Router = Router();
  public controller: AuthController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const loginLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // 10 login attempts per IP per window
      standardHeaders: true,
      legacyHeaders: false,
    });

    const authRefreshLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 30,
      standardHeaders: true,
      legacyHeaders: false,
    });

    const signupLimiter = rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 20,
      standardHeaders: true,
      legacyHeaders: false,
    });

    const emailFlowLimiter = rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
    });

    this.router.put(
      `${this.path}/login`,
      loginLimiter,
      zodValidatorMiddleware(LoginRequestDto, "Body"),
      this.controller.login
    );

    this.router.post(
      `${this.path}/signup`,
      signupLimiter,
      zodValidatorMiddleware(SignupRequestDto, "Body"),
      this.controller.signup
    );

    this.router.put(
      `${this.path}/logout`,
      authMiddleware,
      this.controller.logout
    );

    this.router.put(
      `${this.path}/refresh`,
      authRefreshLimiter,
      this.controller.refreshAccessToken
    );

    // These routes are public since resetting password or
    // verifying an email could be done when the user is not authenticated
    // e.g. forget password feature in login form.

    this.router.put(
      `${this.path}/send-verification-email`,
      emailFlowLimiter,
      zodValidatorMiddleware(SendVEmailRequestDto, "Body"),
      this.controller.sendVerificationEmail
    );

    this.router.put(
      `${this.path}/verify-email-token`,
      emailFlowLimiter,
      zodValidatorMiddleware(VerifyVTokenRequestDto, "Query"),
      this.controller.verifyVerificationToken
    );

    this.router.put(
      `${this.path}/send-reset-email`,
      emailFlowLimiter,
      zodValidatorMiddleware(SendRTokenRequestDto, "Body"),
      this.controller.sendResetPasswordEmail
    );

    this.router.put(
      `${this.path}/reset-password`,
      emailFlowLimiter,
      zodValidatorMiddleware(VerifyRTokenRequestQueryDto, "Query"),
      zodValidatorMiddleware(VerifyRTokenRequestBodyDto, "Body"),
      this.controller.resetPassword
    );
  }
}
