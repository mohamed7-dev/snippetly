import { StatusCodes } from "http-status-codes";
import { HttpException } from "../../common/lib/exception.js";
import { PasswordHashService } from "../auth/password-hash.service.js";
import { DEFAULT_FIND_USERS_LIMIT } from "./constants.js";
import { handleCursorPagination } from "../../common/lib/utils.js";
import { UserReadService } from "./user-read.service.js";
import { UserRepository } from "./user.repository.js";
import { utapi } from "../../config/uploadthing.js";
export class UserService {
    PasswordHashService;
    UserReadService;
    UserRepository;
    constructor(){
        this.PasswordHashService = new PasswordHashService();
        this.UserReadService = new UserReadService();
        this.UserRepository = new UserRepository();
    }
    async create(_ctx, input) {
        const { password, ...rest } = input;
        const foundUser = await this.UserReadService.findOneSlim("name", rest.name);
        if (foundUser) {
            throw new HttpException(StatusCodes.CONFLICT, "User account already exists.");
        }
        const hashedPassword = await this.PasswordHashService.hash(password);
        const [newUser] = await this.UserRepository.insert([
            {
                ...rest,
                password: hashedPassword
            }
        ]);
        return newUser;
    }
    async suggestUniqueNames(baseName) {
        const suggestions = [];
        const existingNames = new Set((await this.UserReadService.findManySlim("name", `%${baseName}%`)).map((u)=>u.name.toLowerCase()));
        // Try appending numbers
        for(let i = 1; suggestions.length < 3 && i <= 50; i++){
            const candidate = `${baseName}${i}`;
            if (!existingNames.has(candidate.toLowerCase())) {
                suggestions.push(candidate);
            }
        }
        return suggestions;
    }
    async update(ctx, input) {
        let foundUser = await this.UserReadService.findOneSlim("id", ctx.user.id);
        if (!foundUser || ctx.user.id !== foundUser.id) {
            throw new HttpException(StatusCodes.NOT_FOUND, `User not found.`);
        }
        const { newPassword, currentPassword, ...rest } = input;
        if (newPassword && currentPassword) {
            await this.updatePassword(ctx, {
                currentPassword,
                newPassword,
                email: foundUser.email
            });
        }
        const [updatedUser] = await this.UserRepository.update(ctx.user.id, {
            ...rest
        });
        return updatedUser;
    }
    async updatePassword(ctx, input) {
        const loggedInUserEmail = ctx.user?.email;
        if (loggedInUserEmail && loggedInUserEmail !== input.email) {
            // if user is logged in and the input.email is not his email
            // then reject the request.
            throw new HttpException(StatusCodes.NOT_FOUND, "User account not found.");
        }
        const foundUser = await this.UserReadService.findOneSlim("email", input.email);
        if (!foundUser) {
            throw new HttpException(StatusCodes.NOT_FOUND, "User account not found.");
        }
        if (input.currentPassword) {
            const isValid = await this.PasswordHashService.verify({
                plain: input.currentPassword,
                hashed: foundUser.password
            });
            if (!isValid) {
                throw new HttpException(StatusCodes.NOT_FOUND, "User account not found.");
            }
        }
        const updatedUser = await this.UserRepository.update(foundUser.id, {
            password: await this.PasswordHashService.hash(input.newPassword)
        });
        return updatedUser;
    }
    async delete(ctx) {
        const foundUser = await this.UserReadService.findOneSlim("id", ctx.user.id);
        if (!foundUser || ctx.user.id !== foundUser.id) {
            throw new HttpException(StatusCodes.NOT_FOUND, `User account not found.`);
        }
        await Promise.all([
            await this.UserRepository.delete(foundUser.id),
            !!foundUser.imageKey && await utapi.deleteFiles(foundUser.imageKey)
        ]);
        return foundUser;
    }
    async discoverUsers(ctx, input) {
        const { limit } = input;
        const defaultLimit = limit ?? DEFAULT_FIND_USERS_LIMIT;
        const { data, total } = await this.UserReadService.discoverUsers({
            ...input,
            limit: defaultLimit
        });
        // filter out current user from results if logged in
        const filteredItems = ctx.user?.id ? data.filter((user)=>user.id !== ctx.user?.id) : data;
        const { nextCursor, data: items } = handleCursorPagination({
            data: filteredItems,
            limit: defaultLimit
        });
        return {
            items,
            nextCursor: nextCursor ? {
                snippetsCount: nextCursor.snippetsCount,
                id: nextCursor.id
            } : null,
            total: data.length < filteredItems.length ? total - 1 : total
        };
    }
    async getCurrentUserProfile(ctx) {
        const foundUser = await this.UserReadService.findOneSlim("id", ctx.user.id);
        const data = await this.getUserProfile(ctx, {
            user: foundUser
        });
        if (data.profile?.id !== ctx.user.id) {
            throw new HttpException(StatusCodes.NOT_FOUND, "User account not found.");
        }
        return data;
    }
    async getCurrentUserDashboard(ctx) {
        const foundUser = await this.UserReadService.getUserForDashboard({
            userId: ctx.user.id
        });
        if (!foundUser) {
            throw new HttpException(StatusCodes.NOT_FOUND, "User not found.");
        }
        const [stats] = await this.UserReadService.getUserActivityStats({
            userId: foundUser.id
        });
        return {
            user: foundUser,
            stats
        };
    }
    async getUserProfile(ctx, input) {
        const { name, user } = input;
        const checkUserExists = user ? false : true;
        let foundUser = !checkUserExists ? user : null;
        if (checkUserExists && name) {
            foundUser = await this.UserReadService.findOneSlim("name", name);
            if (!foundUser) {
                // search for that name in old names array
                const foundUserWithOldName = await this.UserReadService.findOneByOldNames(name);
                if (!foundUserWithOldName) {
                    throw new HttpException(StatusCodes.NOT_FOUND, "User not found.");
                }
                return {
                    redirect: true,
                    name: foundUserWithOldName.name
                };
            }
        }
        if (!foundUser) {
            throw new HttpException(StatusCodes.NOT_FOUND, "User not found.");
        }
        const isCurrentUserOwner = ctx.user?.id === foundUser.id;
        const userProfile = await this.UserReadService.getUserProfile(foundUser.id, isCurrentUserOwner, ctx.user?.id);
        const isCurrentUserAFriend = (userProfile?.friendshipsReceived?.length ?? 0) > 0 || (userProfile?.friendshipsRequested?.length ?? 0) > 0;
        if (!userProfile) {
            throw new HttpException(StatusCodes.NOT_FOUND, "User account not found.");
        }
        const [stats] = await this.UserReadService.getUserActivityStats({
            userId: foundUser.id
        });
        return {
            profile: userProfile,
            isCurrentUserAFriend,
            stats
        };
    }
}
