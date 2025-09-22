import { FriendshipService } from "./friendship.service.js";
import { StatusCodes } from "http-status-codes";
import { AcceptRequestResDto } from "./dto/friendship-response.dto.js";
import { CancelRequestResDto } from "./dto/friendship-response.dto.js";
import { GetUserFriendsResDto } from "./dto/friendship-response.dto.js";
import { GetUserInboxResDto } from "./dto/friendship-response.dto.js";
import { GetUserOutboxResDto } from "./dto/friendship-response.dto.js";
import { RejectRequestResDto } from "./dto/friendship-response.dto.js";
import { SendRequestResDto } from "./dto/friendship-response.dto.js";
import { InternalServerError } from "../../common/lib/exception.js";
export class FriendshipController {
    FriendshipService;
    constructor(){
        this.FriendshipService = new FriendshipService();
    }
    getCurrentUserFriends = async (req, res)=>{
        const data = await this.FriendshipService.getCurrentUserFriends(req.context, req.validatedQuery);
        const { data: parsedData, success } = GetUserFriendsResDto.safeParse(data.items);
        if (!success) {
            throw new InternalServerError();
        }
        res.status(StatusCodes.OK).json({
            message: "Fetched successfully.",
            ...data,
            items: parsedData
        });
    };
    getCurrentUserInbox = async (req, res)=>{
        const data = await this.FriendshipService.getCurrentUserInbox(req.context, req.validatedQuery);
        const { data: parsedData, success } = GetUserInboxResDto.safeParse(data.items);
        if (!success) {
            throw new InternalServerError();
        }
        res.status(StatusCodes.OK).json({
            message: "Fetched successfully.",
            ...data,
            items: parsedData
        });
    };
    getCurrentUserOutbox = async (req, res)=>{
        const data = await this.FriendshipService.getCurrentUserOutbox(req.context, req.validatedQuery);
        const { data: parsedData, success } = GetUserOutboxResDto.safeParse(data.items);
        if (!success) {
            throw new InternalServerError();
        }
        res.status(StatusCodes.OK).json({
            message: "Fetched successfully.",
            ...data,
            items: parsedData
        });
    };
    sendFriendshipRequest = async (req, res)=>{
        const data = await this.FriendshipService.sendFriendshipRequest(req.context, req.params);
        if ("redirect" in data && data.redirect) {
            res.redirect(StatusCodes.TEMPORARY_REDIRECT, `/users/add-friend/${data.name}`);
        }
        const { success, data: parsedData } = SendRequestResDto.safeParse(data);
        if (!success) {
            throw new InternalServerError();
        }
        res.status(StatusCodes.OK).json({
            message: "Friendship request has been sent successfully.",
            data: parsedData
        });
    };
    acceptFriendshipRequest = async (req, res)=>{
        const data = await this.FriendshipService.acceptFriendshipRequest(req.context, req.params);
        if ("redirect" in data && data.redirect) {
            res.redirect(StatusCodes.TEMPORARY_REDIRECT, `/users/accept-friend/${data.name}`);
        }
        const { success, data: parsedData } = AcceptRequestResDto.safeParse(data);
        if (!success) {
            throw new InternalServerError();
        }
        res.status(StatusCodes.OK).json({
            message: "Friendship request has been accepted successfully.",
            data: parsedData
        });
    };
    rejectFriendshipRequest = async (req, res)=>{
        const data = await this.FriendshipService.rejectFriendshipRequest(req.context, req.params);
        if ("redirect" in data && data.redirect) {
            res.redirect(StatusCodes.TEMPORARY_REDIRECT, `/users/reject-friend/${data.name}`);
        }
        const { success, data: parsedData } = RejectRequestResDto.safeParse(data);
        if (!success) {
            throw new InternalServerError();
        }
        res.status(StatusCodes.OK).json({
            message: "Friendship request has been rejected successfully.",
            data: parsedData
        });
    };
    cancelFriendshipRequest = async (req, res)=>{
        const data = await this.FriendshipService.cancelFriendshipRequest(req.context, req.params);
        if ("redirect" in data && data.redirect) {
            res.redirect(StatusCodes.TEMPORARY_REDIRECT, `/users/cancel-friend/${data.name}`);
        }
        const { success, data: parsedData } = CancelRequestResDto.safeParse(data);
        if (!success) {
            throw new InternalServerError();
        }
        res.status(StatusCodes.OK).json({
            message: "Friendship request has been cancelled successfully.",
            data: parsedData
        });
    };
}
