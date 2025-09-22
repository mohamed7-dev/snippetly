import jwt from "jsonwebtoken";
import { ACCESS_JWTOKEN_SECRET } from "../../config/index.js";
import { JWT_ACCESS_EXPIRES } from "../../config/index.js";
import { REFRESH_JWTOKEN_SECRET } from "../../config/index.js";
import { HttpException } from "../../common/lib/exception.js";
import { StatusCodes } from "http-status-codes";
import { TOKEN_EXPIRES } from "./constants.js";
import crypto from "crypto";
import { UserReadService } from "../user/user-read.service.js";
import { UserRepository } from "../user/user.repository.js";
import { getRefreshTokenExpires } from "../../common/lib/utils.js";
export class TokenService {
    UserReadService;
    UserRepository;
    constructor(){
        this.UserReadService = new UserReadService();
        this.UserRepository = new UserRepository();
    }
    signAccessJWT(payload) {
        return jwt.sign(payload, ACCESS_JWTOKEN_SECRET, {
            expiresIn: JWT_ACCESS_EXPIRES / 1000
        });
    }
    signRefreshJWT(payload, rememberMe) {
        return jwt.sign(payload, REFRESH_JWTOKEN_SECRET, {
            expiresIn: getRefreshTokenExpires(rememberMe) / 1000
        });
    }
    decodeToken(token) {
        return jwt.decode(token);
    }
    async verifyRefreshToken(token, cb) {
        jwt.verify(token, REFRESH_JWTOKEN_SECRET, (err, decoded)=>{
            if (typeof decoded === "string") {
                new HttpException(StatusCodes.UNAUTHORIZED, "Invalid session credentials.");
            }
            cb(err, decoded);
        });
    }
    async generateEmailVerificationToken(email, user) {
        let foundUser = user ?? null;
        if (!user) {
            foundUser = await this.findUserByEmail(email);
        }
        if (!foundUser) {
            throw new HttpException(StatusCodes.NOT_FOUND, "User account not found.");
        }
        const generatedToken = this.generateRandomUUID();
        const [updatedUser] = await this.UserRepository.update(foundUser.id, {
            emailVerificationToken: generatedToken,
            emailVerificationTokenExpiresAt: TOKEN_EXPIRES
        });
        return {
            token: generatedToken,
            user: updatedUser
        };
    }
    async verifyEmailVerificationToken(token) {
        const foundUserWithToken = await this.UserReadService.findOneByEmailVToken(token);
        if (!foundUserWithToken || !foundUserWithToken.emailVerificationTokenExpiresAt) {
            throw new HttpException(StatusCodes.UNAUTHORIZED, "Invalid token.");
        }
        const isTokenExpired = new Date(foundUserWithToken.emailVerificationTokenExpiresAt) < new Date();
        if (isTokenExpired) {
            throw new HttpException(StatusCodes.UNAUTHORIZED, "Invalid token.");
        }
        const [updatedUser] = await this.UserRepository.update(foundUserWithToken.id, {
            emailVerificationToken: null,
            emailVerificationTokenExpiresAt: null,
            emailVerifiedAt: new Date()
        });
        return updatedUser;
    }
    async generateResetPasswordToken(email, user) {
        let foundUser = user ? user : null;
        if (!user) {
            foundUser = await this.findUserByEmail(email);
        }
        if (!foundUser) {
            throw new HttpException(StatusCodes.NOT_FOUND, `User not found.`);
        }
        const generatedToken = this.generateRandomUUID();
        const [updatedUser] = await this.UserRepository.update(foundUser.id, {
            resetPasswordToken: generatedToken,
            resetPasswordTokenExpiresAt: TOKEN_EXPIRES
        });
        return {
            token: generatedToken,
            user: updatedUser
        };
    }
    async verifyResetPasswordToken(token) {
        const foundUserWithToken = await this.UserReadService.findOneByResetToken(token);
        if (!foundUserWithToken || !foundUserWithToken.resetPasswordTokenExpiresAt) {
            throw new HttpException(StatusCodes.UNAUTHORIZED, "Invalid token.");
        }
        const isTokenExpired = new Date(foundUserWithToken.resetPasswordTokenExpiresAt) < new Date();
        if (isTokenExpired) {
            throw new HttpException(StatusCodes.UNAUTHORIZED, "Invalid token.");
        }
        const [updatedUser] = await this.UserRepository.update(foundUserWithToken.id, {
            resetPasswordToken: null,
            resetPasswordTokenExpiresAt: null
        });
        return updatedUser;
    }
    generateRandomUUID() {
        const token = crypto.randomUUID();
        return token;
    }
    async findUserByEmail(email) {
        const foundUser = await this.UserReadService.findOneSlim("email", email);
        if (!foundUser) {
            throw new HttpException(StatusCodes.NOT_FOUND, `User with email ${email} is not found`);
        }
        return foundUser;
    }
}
