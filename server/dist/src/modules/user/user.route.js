import { Router } from "express";
import { UserController } from "./user.controller.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { zodValidatorMiddleware } from "../../common/middlewares/zod-validator.middleware.js";
import { UpdateUserDto } from "./dto/update-user.dto.js";
import { ManageFriendshipDto } from "./dto/manage-friendship.dto.js";
import { GetCurrentUserFriendsDto } from "./dto/get-current-user-friends.dto.js";
import { DiscoverUsersDto } from "./dto/discover-users.dto.js";
import { GetUserDto } from "./dto/get-user.dto.js";
import { FriendshipController } from "./friendship.controller.js";
import multer from "multer";
import path from "path";
import { HttpException } from "../../common/lib/exception.js";
import { StatusCodes } from "http-status-codes";
export class UserRoute {
    path = "/users";
    router = Router();
    controller = new UserController();
    FriendshipController = new FriendshipController();
    constructor(){
        this.initializeRoutes();
    }
    initializeRoutes() {
        // --- static GET routes (fixed names first) ---
        this.router.get(`${this.path}/discover`, authMiddleware, zodValidatorMiddleware(DiscoverUsersDto, "Query"), this.controller.discoverUsers);
        this.router.get(`${this.path}/current`, authMiddleware, this.controller.getCurrentUserProfile);
        this.router.get(`${this.path}/current/friends`, authMiddleware, zodValidatorMiddleware(GetCurrentUserFriendsDto, "Query"), this.FriendshipController.getCurrentUserFriends);
        this.router.get(`${this.path}/current/inbox`, authMiddleware, zodValidatorMiddleware(GetCurrentUserFriendsDto, "Query"), this.FriendshipController.getCurrentUserInbox);
        this.router.get(`${this.path}/current/outbox`, authMiddleware, zodValidatorMiddleware(GetCurrentUserFriendsDto, "Query"), this.FriendshipController.getCurrentUserOutbox);
        this.router.get(`${this.path}/current/dashboard`, authMiddleware, this.controller.getCurrentUserDashboard);
        // --- friendship PUT routes (longer param paths first) ---
        this.router.put(`${this.path}/add-friend/:friend_name`, authMiddleware, zodValidatorMiddleware(ManageFriendshipDto, "Params"), this.FriendshipController.sendFriendshipRequest);
        this.router.put(`${this.path}/accept-friend/:friend_name`, authMiddleware, zodValidatorMiddleware(ManageFriendshipDto, "Params"), this.FriendshipController.acceptFriendshipRequest);
        this.router.put(`${this.path}/reject-friend/:friend_name`, authMiddleware, zodValidatorMiddleware(ManageFriendshipDto, "Params"), this.FriendshipController.rejectFriendshipRequest);
        this.router.put(`${this.path}/cancel-friend/:friend_name`, authMiddleware, zodValidatorMiddleware(ManageFriendshipDto, "Params"), this.FriendshipController.cancelFriendshipRequest);
        // --- user PUT/DELETE (single param) ---
        this.router.put(`${this.path}`, authMiddleware, this.configureMulter().single("image"), zodValidatorMiddleware(UpdateUserDto, "Body"), this.controller.update);
        this.router.delete(`${this.path}`, authMiddleware, this.controller.delete);
        // --- user GET (single param, last catch-all) ---
        this.router.get(`${this.path}/:name`, zodValidatorMiddleware(GetUserDto, "Params"), this.controller.getUserProfile);
    }
    configureMulter() {
        const fileFilter = (_req, file, cb)=>{
            const allowedMimes = [
                "image/jpeg",
                "image/png",
                "image/jpg",
                "image/svg+xml"
            ];
            if (allowedMimes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new HttpException(StatusCodes.BAD_REQUEST, "Invalid file type. Only JPG, JPEG, PNG, and SVG are allowed."));
            }
        };
        const storage = multer.diskStorage({
            destination: (_req, _file, cb)=>{
                // public is used here to server static assets from vercel
                cb(null, path.join(process.cwd(), "public", "uploads")); // save locally in uploads/
            },
            filename: (_req, file, cb)=>{
                const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
                cb(null, uniqueSuffix + path.extname(file.originalname));
            }
        });
        return multer({
            storage,
            limits: {
                fileSize: 1 * 1024 * 1024
            },
            fileFilter
        });
    }
}
