import { StatusCodes } from "http-status-codes";
import { HttpException } from "../../common/lib/exception.js";
import { UserService } from "../user/user.service.js";
import { TokenService } from "./token.service.js";
import { REFRESH_TOKEN_COOKIE_KEY } from "./constants.js";
import { PasswordHashService } from "./password-hash.service.js";
import { EmailService } from "../email/email.service.js";
import { CLIENTS_URLS } from "../../config/index.js";
import { JWT_REFRESH_EXPIRES } from "../../config/index.js";
import { JWT_REFRESH_REMEMBER_EXPIRES } from "../../config/index.js";
import { UserReadService } from "../user/user-read.service.js";
import { UserRepository } from "../user/user.repository.js";
import { isDevelopment } from "../../common/lib/utils.js";
export class AuthService {
    UserService;
    UserRepository;
    UserReadService;
    TokenService;
    PasswordHashService;
    constructor(){
        this.UserService = new UserService();
        this.UserReadService = new UserReadService();
        this.TokenService = new TokenService();
        this.PasswordHashService = new PasswordHashService();
        this.UserRepository = new UserRepository();
    }
    async login(ctx, input, res) {
        const { name, password, rememberMe } = input;
        const refreshToken = ctx.req.cookies?.[REFRESH_TOKEN_COOKIE_KEY];
        const foundUser = await this.UserReadService.findOneSlim("name", name);
        if (!foundUser) throw new HttpException(StatusCodes.NOT_FOUND, "User not found.");
        const isPasswordValid = await this.PasswordHashService.verify({
            plain: password,
            hashed: foundUser.password
        });
        if (!isPasswordValid) throw new HttpException(StatusCodes.UNAUTHORIZED, "Invalid credentials.");
        // check if the refresh token exists, if so rotate it
        let newRefreshTokenArray = !refreshToken ? foundUser.refreshTokens : foundUser.refreshTokens.filter((rt)=>rt !== refreshToken);
        if (refreshToken) {
            /* 
        Scenario added here: 
            1) User logs in but never uses RT and does not logout 
            2) RT is stolen
            3) If 1 & 2, reuse detection is needed to clear all RTs when user logs in
      */ const foundToken = await this.UserReadService.findOneByRefreshToken(refreshToken);
            // danger: if refresh token is not found, then the user tries to re-use it
            // so we need to delete all refresh tokens to log the user out of all sessions.
            if (!foundToken) {
                // clear out aLL previous refresh tokens
                newRefreshTokenArray = [];
            }
            this.clearRefreshTokenCookie(res);
        }
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = this.generateJWT({
            id: foundUser.id,
            email: foundUser.email,
            image: foundUser.image,
            name: foundUser.name
        }, rememberMe ?? false);
        const [updatedUser] = await this.UserRepository.update(foundUser.id, {
            refreshTokens: [
                ...newRefreshTokenArray,
                newRefreshToken
            ],
            rememberMe: rememberMe ?? false
        });
        this.setRefreshTokenCookie(res, newRefreshToken, rememberMe ?? false);
        return {
            accessToken: newAccessToken,
            user: updatedUser
        };
    }
    async signup(ctx, input, res) {
        try {
            const newUser = await this.UserService.create(ctx, input);
            const data = await this.login(ctx, {
                name: newUser.name,
                password: input.password
            }, res);
            return {
                accessToken: data.accessToken,
                user: newUser
            };
        } catch (error) {
            if (error instanceof HttpException && error.status === StatusCodes.CONFLICT) {
                const suggestedNames = await this.UserService.suggestUniqueNames(input.name);
                return {
                    suggestedNames
                };
            }
            throw error;
        }
    }
    async refreshAccessToken(ctx, res) {
        const refreshToken = ctx.req.cookies[REFRESH_TOKEN_COOKIE_KEY];
        if (!refreshToken) return this.throwSessionError();
        this.clearRefreshTokenCookie(res);
        const foundUserWithToken = await this.UserReadService.findOneByRefreshToken(refreshToken);
        if (!foundUserWithToken) {
            this.TokenService.verifyRefreshToken(refreshToken, async (err, decoded)=>{
                if (err) return this.throwSessionError();
                await this.UserRepository.update(decoded.id, {
                    refreshTokens: []
                });
            });
            return this.throwSessionError();
        }
        const newRefreshTokenArray = foundUserWithToken.refreshTokens.filter((rt)=>rt !== refreshToken);
        this.TokenService.verifyRefreshToken(refreshToken, async (err, decoded)=>{
            if (err) {
                await this.UserRepository.update(decoded.id, {
                    refreshTokens: [
                        ...newRefreshTokenArray
                    ]
                });
            }
            if (err || foundUserWithToken.id !== decoded.id) {
                return this.throwSessionError();
            }
        });
        // Refresh token rotation
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = this.generateJWT({
            id: foundUserWithToken.id,
            email: foundUserWithToken.email,
            image: foundUserWithToken.image,
            name: foundUserWithToken.name
        }, foundUserWithToken.rememberMe);
        const [updatedUser] = await this.UserRepository.update(foundUserWithToken.id, {
            refreshTokens: [
                ...newRefreshTokenArray,
                newRefreshToken
            ]
        });
        this.setRefreshTokenCookie(res, newRefreshToken, foundUserWithToken.rememberMe);
        return {
            accessToken: newAccessToken,
            user: updatedUser
        };
    }
    async logout(ctx, res) {
        const refreshToken = ctx.req.cookies?.[REFRESH_TOKEN_COOKIE_KEY];
        if (!refreshToken) return this.throwSessionError();
        const foundUserWithToken = await this.UserReadService.findOneByRefreshToken(refreshToken);
        if (!foundUserWithToken) {
            this.clearRefreshTokenCookie(res);
            return this.throwSessionError();
        }
        const filteredUserTokens = foundUserWithToken.refreshTokens.filter((rt)=>rt !== refreshToken);
        const [updatedUser] = await this.UserRepository.update(foundUserWithToken.id, {
            refreshTokens: filteredUserTokens
        });
        this.clearRefreshTokenCookie(res);
        return updatedUser;
    }
    async sendVerificationEmail(_ctx, input, user) {
        const { email } = input;
        const { token, user: foundUser } = await this.TokenService.generateEmailVerificationToken(email, user);
        await EmailService.sendVerificationEmail({
            email: foundUser.email,
            username: `${foundUser.firstName} ${foundUser.lastName}`,
            callbackUrl: `${CLIENTS_URLS.reactEmailVerification}?token=${token}`
        });
        return {
            user: foundUser,
            token
        };
    }
    async verifyVerificationToken(_ctx, input) {
        const token = input.token;
        const user = await this.TokenService.verifyEmailVerificationToken(token);
        return {
            user,
            token
        };
    }
    async sendResetPasswordEmail(_ctx, input) {
        const { email } = input;
        const foundUser = await this.UserReadService.findOneSlim("email", email);
        if (!foundUser) {
            throw new HttpException(StatusCodes.NOT_FOUND, "User account not found.");
        }
        if (!foundUser.emailVerifiedAt) {
            await this.sendVerificationEmail(_ctx, {
                email
            }, foundUser);
            return {
                status: "email-verification-sent"
            };
        }
        const { token, user } = await this.TokenService.generateResetPasswordToken(email, foundUser);
        await EmailService.sendResetEmail({
            email: user.email,
            username: `${user.firstName} ${user.lastName}`,
            callbackUrl: `${CLIENTS_URLS.reactPasswordReset}?token=${token}`
        });
        return {
            user: foundUser,
            token,
            status: "reset-password-email-sent"
        };
    }
    async resetPassword(ctx, input) {
        const token = input.token;
        const foundUser = await this.TokenService.verifyResetPasswordToken(token);
        const updatedUser = this.UserService.updatePassword(ctx, {
            newPassword: input.password,
            email: foundUser.email
        });
        return {
            user: updatedUser,
            token
        };
    }
    generateJWT(payload, rememberMe) {
        return {
            refreshToken: this.TokenService.signRefreshJWT(payload, rememberMe),
            accessToken: this.TokenService.signAccessJWT(payload)
        };
    }
    throwSessionError() {
        throw new HttpException(StatusCodes.UNAUTHORIZED, "Invalid session credentials.");
    }
    clearRefreshTokenCookie(res) {
        res.clearCookie(REFRESH_TOKEN_COOKIE_KEY, {
            httpOnly: true,
            sameSite: "none",
            secure: isDevelopment ? false : true
        });
    }
    setRefreshTokenCookie(res, refreshToken, rememberMe) {
        res.cookie(REFRESH_TOKEN_COOKIE_KEY, refreshToken, {
            httpOnly: true,
            sameSite: "none",
            secure: isDevelopment ? false : true,
            maxAge: rememberMe ? JWT_REFRESH_REMEMBER_EXPIRES : JWT_REFRESH_EXPIRES
        });
    }
}
