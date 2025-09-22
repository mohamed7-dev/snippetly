import { UserService } from "./user.service.js";
import { InternalServerError } from "../../common/lib/exception.js";
import { AuthService } from "../auth/auth.service.js";
import { StatusCodes } from "http-status-codes";
import { GetCurrentUserProfileResDto } from "./dto/user-response.dto.js";
import { GetPublicUserProfileResDto } from "./dto/user-response.dto.js";
import { GetUserProfileResDto } from "./dto/user-response.dto.js";
import { UpdateUserResDto } from "./dto/user-response.dto.js";
import { GetCurrentUserDashboardDto } from "./dto/user-response.dto.js";
import { DiscoverUsersDto } from "./dto/user-response.dto.js";
export class UserController {
    UserService;
    AuthService;
    constructor(){
        this.UserService = new UserService();
        this.AuthService = new AuthService();
    }
    update = async (req, res)=>{
        const updatedUser = await this.UserService.update(req.context, {
            ...req.body
        });
        const { success, data: parsedData } = UpdateUserResDto.safeParse(updatedUser);
        if (!success) {
            throw new InternalServerError();
        }
        // i don't know if i am going to log the user out or not
        res.status(StatusCodes.OK).json({
            message: `User info has been updated successfully.`,
            data: parsedData
        });
    };
    delete = async (req, res)=>{
        await this.AuthService.logout(req.context, res).then(async ()=>{
            await this.UserService.delete(req.context);
        });
        res.status(StatusCodes.OK).json({
            message: `User account has been deleted successfully, and session has been ended on the server.`,
            data: null
        });
    };
    getCurrentUserProfile = async (req, res)=>{
        const foundUser = await this.UserService.getCurrentUserProfile(req.context);
        const { success, data: parsedData } = GetCurrentUserProfileResDto.safeParse(foundUser);
        if (!success) {
            throw new InternalServerError();
        }
        res.status(StatusCodes.OK).json({
            message: "Fetched successfully.",
            data: parsedData
        });
    };
    discoverUsers = async (req, res)=>{
        const data = await this.UserService.discoverUsers(req.context, req.validatedQuery);
        const { success, data: parsedData } = DiscoverUsersDto.safeParse(data.items);
        if (!success) {
            throw new InternalServerError();
        }
        res.status(StatusCodes.OK).json({
            message: "Fetched successfully.",
            ...data,
            items: parsedData
        });
    };
    getCurrentUserDashboard = async (req, res)=>{
        const dashboardInfo = await this.UserService.getCurrentUserDashboard(req.context);
        const { success, data: parsedData } = GetCurrentUserDashboardDto.safeParse({
            user: dashboardInfo.user,
            collections: dashboardInfo.user.collections,
            stats: dashboardInfo.stats
        });
        if (!success) {
            throw new InternalServerError();
        }
        res.status(StatusCodes.OK).json({
            message: "Fetched successfully.",
            data: {
                profile: parsedData.user,
                recentCollections: parsedData.collections,
                stats: parsedData.stats
            }
        });
    };
    getUserProfile = async (req, res)=>{
        const result = await this.UserService.getUserProfile(req.context, req.params);
        if ("redirect" in result) {
            res.redirect(StatusCodes.TEMPORARY_REDIRECT, `/users/${result.name}`);
        } else {
            const isOwner = result.profile?.id === req.context.user?.id;
            let parsedData = null;
            if (isOwner) {
                // use owner dto
                const { success, data } = GetUserProfileResDto.safeParse(result);
                if (!success) {
                    throw new InternalServerError();
                }
                parsedData = data;
            } else {
                // use public dto
                const { success, data } = GetPublicUserProfileResDto.safeParse(result);
                if (!success) {
                    throw new InternalServerError();
                }
                parsedData = data;
            }
            res.status(StatusCodes.OK).json({
                message: "Fetched successfully.",
                data: parsedData
            });
        }
    };
}
