import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { zodValidatorMiddleware } from "../../common/middlewares/zod-validator.middleware.js";
import { LoginDto } from "./dto/login.dto.js";
import { SignupDto } from "./dto/signup.dto.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { SendVEmailDto } from "./dto/send-v-email.dto.js";
import { SendREmailDto } from "./dto/send-r-email.dto.js";
import { VerifyTokenDto } from "./dto/verify-token.dto.js";
import { ResetPasswordDto } from "./dto/reset-password.dto.js";
export class AuthRoute {
    path = "/auth";
    router = Router();
    controller = new AuthController();
    constructor(){
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.put(`${this.path}/login`, zodValidatorMiddleware(LoginDto, "Body"), this.controller.login);
        this.router.post(`${this.path}/signup`, zodValidatorMiddleware(SignupDto, "Body"), this.controller.signup);
        this.router.put(`${this.path}/logout`, authMiddleware, this.controller.logout);
        this.router.put(`${this.path}/refresh`, this.controller.refreshAccessToken);
        // These routes are public since resetting password or
        // verifying an email could be done when the user is not authenticated
        // e.g. forget password feature in login form.
        this.router.put(`${this.path}/send-verification-email`, zodValidatorMiddleware(SendVEmailDto, "Body"), this.controller.sendVerificationEmail);
        this.router.put(`${this.path}/verify-email-token`, zodValidatorMiddleware(VerifyTokenDto, "Query"), this.controller.verifyVerificationToken);
        this.router.put(`${this.path}/send-reset-email`, zodValidatorMiddleware(SendREmailDto, "Body"), this.controller.sendResetPasswordEmail);
        this.router.put(`${this.path}/reset-password`, zodValidatorMiddleware(VerifyTokenDto, "Query"), zodValidatorMiddleware(ResetPasswordDto, "Body"), this.controller.resetPassword);
    }
}
