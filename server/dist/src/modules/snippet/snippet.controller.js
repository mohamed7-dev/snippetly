import { SnippetService } from "./snippet.service.js";
import { StatusCodes } from "http-status-codes";
import { CreateSnippetResDto } from "./dto/response.dto.js";
import { DiscoverSnippetsResDto } from "./dto/response.dto.js";
import { GetCurrentUserFriendsSnippetsResDto } from "./dto/response.dto.js";
import { GetCurrentUserSnippetsResDto } from "./dto/response.dto.js";
import { GetPublicSnippetResDto } from "./dto/response.dto.js";
import { GetPublicSnippetsByCollectionResDto } from "./dto/response.dto.js";
import { GetSnippetResDto } from "./dto/response.dto.js";
import { GetSnippetsByCollectionResDto } from "./dto/response.dto.js";
import { GetUserSnippetsResDto } from "./dto/response.dto.js";
import { UpdateSnippetResDto } from "./dto/response.dto.js";
import { InternalServerError } from "../../common/lib/exception.js";
export class SnippetController {
    SnippetService;
    constructor(){
        this.SnippetService = new SnippetService();
    }
    create = async (req, res)=>{
        const data = await this.SnippetService.create(req.context, req.body);
        const { success, data: parsedData, error } = CreateSnippetResDto.safeParse(data);
        console.log(error);
        if (!success) {
            throw new InternalServerError();
        }
        res.status(StatusCodes.CREATED).json({
            message: "Snippet has been created successfully.",
            data: parsedData
        });
    };
    update = async (req, res)=>{
        const result = await this.SnippetService.update(req.context, {
            slug: req.params.slug,
            data: req.body
        });
        if ("redirect" in result) {
            res.redirect(StatusCodes.TEMPORARY_REDIRECT, `/snippets/${result?.slug}`);
        } else {
            const { updatedSnippet, collectionId } = result;
            const { success, data: parsedData } = UpdateSnippetResDto.safeParse(updatedSnippet);
            if (!success) {
                throw new InternalServerError();
            }
            res.status(StatusCodes.OK).json({
                message: `Snippet has been updated successfully${req.body.collection && !collectionId ? ", but the collection couldn't be found." : "."}`,
                data: parsedData
            });
        }
    };
    fork = async (req, res)=>{
        const data = await this.SnippetService.fork(req.context, {
            slug: req.params.slug,
            ...req.body
        });
        if ("redirect" in data) {
            res.redirect(StatusCodes.TEMPORARY_REDIRECT, `/snippets/${data?.slug}/fork`);
        } else {
            const { success, data: parsedData } = UpdateSnippetResDto.safeParse(data);
            if (!success) {
                throw new InternalServerError();
            }
            res.status(StatusCodes.OK).json({
                message: `Snippet has been forked successfully.`,
                data: parsedData
            });
        }
    };
    delete = async (req, res)=>{
        const result = await this.SnippetService.delete(req.context, req.params);
        if ("redirect" in result) {
            res.redirect(StatusCodes.TEMPORARY_REDIRECT, `/snippets/${result?.slug}`);
        } else {
            res.status(StatusCodes.OK).json({
                message: "Snippet has been deleted successfully.",
                data: null
            });
        }
    };
    getSnippetsByCollection = async (req, res)=>{
        const result = await this.SnippetService.getSnippetsByCollection(req.context, {
            ...req.params,
            ...req.validatedQuery
        });
        if ("redirect" in result) {
            // res.redirect(
            //   StatusCodes.PERMANENT_REDIRECT,
            //   `/api/v1/snippets/collection/${result?.slug}`
            // );
            res.status(StatusCodes.PERMANENT_REDIRECT).json({
                newSlug: result.slug
            });
        } else {
            const { items, collection, nextCursor, total } = result;
            const isCurrentUserOwner = req.context.user.id === collection.creatorId;
            let dataToReturn;
            if (isCurrentUserOwner) {
                // use owner dto
                const { success, data: parsedData } = GetSnippetsByCollectionResDto.safeParse({
                    snippets: items,
                    collection
                });
                if (!success) {
                    throw new InternalServerError();
                }
                dataToReturn = parsedData;
            } else {
                // use public dto
                const { success, data: parsedData } = GetPublicSnippetsByCollectionResDto.safeParse({
                    snippets: items,
                    collection
                });
                if (!success) {
                    throw new InternalServerError();
                }
                dataToReturn = parsedData;
            }
            res.status(StatusCodes.OK).json({
                message: "Fetched successfully.",
                items: dataToReturn,
                nextCursor,
                total
            });
        }
    };
    discover = async (req, res)=>{
        const data = await this.SnippetService.discover(req.context, req.validatedQuery);
        const { success, data: parsedData } = DiscoverSnippetsResDto.safeParse(data.items);
        if (!success) {
            throw new InternalServerError();
        }
        res.status(StatusCodes.OK).json({
            message: "Fetched successfully.",
            ...data,
            items: parsedData
        });
    };
    getCurrentUserSnippets = async (req, res)=>{
        const { items, nextCursor, total } = await this.SnippetService.getCurrentUserSnippets(req.context, {
            ...req.validatedQuery
        });
        const { success, data: parsedData } = GetCurrentUserSnippetsResDto.safeParse(items);
        if (!success) {
            throw new InternalServerError();
        }
        res.status(StatusCodes.OK).json({
            message: "Fetched successfully.",
            items: parsedData,
            nextCursor,
            total
        });
    };
    getUserSnippets = async (req, res)=>{
        const result = await this.SnippetService.getUserSnippets(req.context, {
            ...req.params,
            ...req.validatedQuery
        });
        if ("redirect" in result) {
            res.redirect(StatusCodes.TEMPORARY_REDIRECT, `/snippets/user/${result.name}`);
        } else {
            const { items, total, nextCursor } = result;
            const isCurrentUserOwner = req.context.user?.id === items?.[0]?.creator?.id;
            let dataToReturn;
            if (isCurrentUserOwner) {
                // use owner dto
                const { success, data: parsedData } = GetCurrentUserSnippetsResDto.safeParse(items);
                if (!success) {
                    throw new InternalServerError();
                }
                dataToReturn = parsedData;
            } else {
                // use public dto
                const { success, data: parsedData } = GetUserSnippetsResDto.safeParse(items);
                if (!success) {
                    throw new InternalServerError();
                }
                dataToReturn = parsedData;
            }
            res.status(StatusCodes.OK).json({
                message: "Fetched successfully.",
                items: dataToReturn,
                nextCursor,
                total
            });
        }
    };
    getCurrentUserFriendsSnippets = async (req, res)=>{
        const { items, nextCursor, total } = await this.SnippetService.getCurrentUserFriendsSnippets(req.context, {
            ...req.validatedQuery
        });
        const { success, data: parsedData } = GetCurrentUserFriendsSnippetsResDto.safeParse(items);
        if (!success) {
            throw new InternalServerError();
        }
        res.status(StatusCodes.OK).json({
            message: "Fetched successfully.",
            items: parsedData,
            nextCursor,
            total
        });
    };
    getUserFriendsSnippets = async (req, res)=>{
        const result = await this.SnippetService.getUserFriendsSnippets(req.context, {
            ...req.params,
            ...req.validatedQuery
        });
        if ("redirect" in result) {
            res.redirect(StatusCodes.TEMPORARY_REDIRECT, `/snippets/${result.name}/friends`);
        } else {
            const { items, total, nextCursor } = result;
            const { success, data: parsedData } = GetCurrentUserFriendsSnippetsResDto.safeParse(items);
            if (!success) {
                throw new InternalServerError();
            }
            res.status(StatusCodes.OK).json({
                message: "Fetched successfully.",
                items: parsedData,
                nextCursor,
                total
            });
        }
    };
    getSnippet = async (req, res)=>{
        const data = await this.SnippetService.findOne(req.context, req.params);
        if ("redirect" in data) {
            res.redirect(StatusCodes.TEMPORARY_REDIRECT, `/snippets/${data.slug}`);
        } else {
            const isCurrentUserOwner = req.context?.user?.id === data.creatorId;
            let dataToReturn;
            if (isCurrentUserOwner) {
                // use owner dto
                const { success, data: parsedData } = GetSnippetResDto.safeParse(data);
                if (!success) {
                    throw new InternalServerError();
                }
                dataToReturn = parsedData;
            } else {
                // use public dto
                const { success, data: parsedData } = GetPublicSnippetResDto.safeParse(data);
                if (!success) {
                    throw new InternalServerError();
                }
                dataToReturn = parsedData;
            }
            res.status(StatusCodes.OK).json({
                message: "Fetched successfully.",
                data: dataToReturn
            });
        }
    };
}
