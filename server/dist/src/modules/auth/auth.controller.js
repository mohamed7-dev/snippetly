import { AuthService } from "./auth.service.js";
import { StatusCodes } from "http-status-codes";
import { LoginResponseDto } from "./dto/response.dto.js";
import { RefreshTokenResDto } from "./dto/response.dto.js";
import { SignupResponseDto } from "./dto/response.dto.js";
import { InternalServerError } from "../../common/lib/exception.js";
export class AuthController {
    AuthService;
    constructor(){
        this.AuthService = new AuthService();
    }
    login = async (request, response)=>{
        const data = await this.AuthService.login(request.context, request.body, response);
        const { success, data: parsedData } = LoginResponseDto.safeParse(data);
        if (!success) {
            throw new InternalServerError();
        }
        response.status(StatusCodes.OK).json({
            message: "Authenticated successfully.",
            data: parsedData
        });
    };
    signup = async (request, response)=>{
        const data = await this.AuthService.signup(request.context, request.body, response);
        if ("accessToken" in data) {
            const { success, data: parsedData } = SignupResponseDto.safeParse(data);
            if (!success) {
                throw new InternalServerError();
            }
            return response.status(StatusCodes.CREATED).json({
                message: "User account has been created successfully.",
                data: parsedData
            });
        }
        return response.status(StatusCodes.CONFLICT).json({
            message: `User account with the same name ${request.body.name} already exists, but you can use one of the generated names.`,
            data
        });
    };
    refreshAccessToken = async (request, response)=>{
        const data = await this.AuthService.refreshAccessToken(request.context, response);
        const { success, data: parsedData } = RefreshTokenResDto.safeParse(data);
        if (!success) {
            throw new InternalServerError();
        }
        response.status(StatusCodes.OK).json({
            message: "Access token has been refreshed successfully.",
            data: parsedData
        });
    };
    logout = async (request, response)=>{
        await this.AuthService.logout(request.context, response);
        response.status(StatusCodes.OK).json({
            message: "Logged out successfully.",
            data: null
        });
    };
    sendVerificationEmail = async (request, response)=>{
        const data = await this.AuthService.sendVerificationEmail(request.context, request.body);
        response.status(StatusCodes.OK).json({
            message: `Email verification has been sent to ${data.user.email}, check your inbox to verify your account.`,
            data: null
        });
    };
    verifyVerificationToken = async (request, response)=>{
        const data = await this.AuthService.verifyVerificationToken(request.context, request.query);
        response.status(StatusCodes.OK).json({
            message: "Email verification token has been verified successfully.",
            data: {
                token: data.token
            }
        });
    };
    sendResetPasswordEmail = async (request, response)=>{
        const data = await this.AuthService.sendResetPasswordEmail(request.context, request.body);
        response.status(StatusCodes.OK).json({
            message: data.status === "reset-password-email-sent" ? `Reset password email has been sent to ${data.user.email}, check your inbox!.` : "An email verification token was sent to your email, you need to verify your email first.",
            data: null
        });
    };
    resetPassword = async (request, response)=>{
        const data = await this.AuthService.resetPassword(request.context, {
            ...request.query,
            ...request.body
        });
        response.status(StatusCodes.OK).json({
            message: "Password has been updated successfully.",
            data: {
                token: data.token
            }
        });
    };
}
