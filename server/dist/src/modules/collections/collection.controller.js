import { StatusCodes } from "http-status-codes";
import { CollectionService } from "./collection.service.js";
import { CreateCollectionResDto } from "./dto/response.dto.js";
import { DiscoverCollectionsResDto } from "./dto/response.dto.js";
import { ForkCollectionResDto } from "./dto/response.dto.js";
import { GetCollectionResDto } from "./dto/response.dto.js";
import { GetCurrentUserCollectionsResDto } from "./dto/response.dto.js";
import { GetPublicCollectionResDto } from "./dto/response.dto.js";
import { GetPublicUserCollectionsResDto } from "./dto/response.dto.js";
import { UpdateCollectionResDto } from "./dto/response.dto.js";
import { InternalServerError } from "../../common/lib/exception.js";
export class CollectionController {
    CollectionService;
    constructor(){
        this.CollectionService = new CollectionService();
    }
    create = async (request, response)=>{
        const newCollection = await this.CollectionService.create(request.context, request.body);
        const { success, data: parsedData, error } = CreateCollectionResDto.safeParse(newCollection);
        console.log(error);
        if (!success) {
            throw new InternalServerError();
        }
        response.status(StatusCodes.CREATED).json({
            message: "Collection has been created successfully.",
            data: parsedData
        });
    };
    update = async (request, response)=>{
        const result = await this.CollectionService.update(request.context, {
            data: request.body,
            slug: request.params.slug
        });
        if ("redirect" in result) {
            response.redirect(StatusCodes.PERMANENT_REDIRECT, `/api/v1/collections/${result.slug}`);
        // response.status(StatusCodes.PERMANENT_REDIRECT).json({
        //   newSlug: result.slug,
        // });
        } else {
            const { success, data: parsedData } = UpdateCollectionResDto.safeParse(result);
            if (!success) {
                throw new InternalServerError();
            }
            response.status(StatusCodes.OK).json({
                message: "Collection has been updated successfully.",
                data: parsedData
            });
        }
    };
    fork = async (request, response)=>{
        const result = await this.CollectionService.fork(request.context, request.params);
        if ("redirect" in result) {
            response.redirect(StatusCodes.PERMANENT_REDIRECT, `/api/v1/collections/${result.slug}/fork`);
        // response.redirect(
        //   StatusCodes.PERMANENT_REDIRECT,
        //   `/api/v1/collections/${result.slug}/fork`
        // );
        } else {
            const { success, data: parsedData } = ForkCollectionResDto.safeParse(result);
            if (!success) {
                throw new InternalServerError();
            }
            response.status(StatusCodes.CREATED).json({
                message: "Collection has been forked successfully.",
                data: parsedData
            });
        }
    };
    delete = async (request, response)=>{
        const result = await this.CollectionService.delete(request.context, request.params);
        if ("redirect" in result) {
            response.redirect(StatusCodes.PERMANENT_REDIRECT, `/api/v1/collections/${result.slug}`);
        // response.status(StatusCodes.PERMANENT_REDIRECT).json({
        //   newSlug: `/api/v1/collections/${result.slug}`,
        // });
        } else {
            response.status(StatusCodes.OK).json({
                message: "Collection has been deleted successfully",
                data: null
            });
        }
    };
    discover = async (req, res)=>{
        const data = await this.CollectionService.discover(req.context, req.validatedQuery);
        const { success, data: parsedData } = DiscoverCollectionsResDto.safeParse(data.items);
        if (!success) {
            throw new InternalServerError();
        }
        res.status(StatusCodes.OK).json({
            message: "Fetched successfully.",
            ...data,
            items: parsedData
        });
    };
    getCurrentUserCollections = async (request, response)=>{
        const data = await this.CollectionService.findCurrentUserCollections(request.context, request.validatedQuery);
        const { success, data: parsedData } = GetCurrentUserCollectionsResDto.safeParse({
            stats: data.stats,
            collections: data.items
        });
        if (!success) {
            throw new InternalServerError();
        }
        response.status(StatusCodes.OK).json({
            message: "Fetched successfully.",
            ...data,
            items: parsedData.collections,
            stats: parsedData.stats
        });
    };
    getUserCollections = async (request, response)=>{
        const data = await this.CollectionService.find(request.context, {
            ...request.params,
            ...request.validatedQuery
        });
        if ("redirect" in data) {
            response.status(StatusCodes.PERMANENT_REDIRECT).json({
                newUsername: data.name
            });
        } else {
            const isCurrentUserOwner = request.context?.user?.id === data?.items?.[0]?.creator?.id;
            let dataToReturn;
            if (isCurrentUserOwner) {
                // run the owner dto
                const { success, data: parsedData } = GetCurrentUserCollectionsResDto.safeParse({
                    stats: data.stats,
                    collections: data.items
                });
                if (!success) {
                    throw new InternalServerError();
                }
                dataToReturn = parsedData;
            } else {
                // run the public dto
                const { success, data: parsedData } = GetPublicUserCollectionsResDto.safeParse({
                    stats: data.stats,
                    collections: data.items
                });
                if (!success) {
                    throw new InternalServerError();
                }
                dataToReturn = parsedData;
            }
            response.status(StatusCodes.OK).json({
                message: "Fetched successfully.",
                ...data,
                items: dataToReturn.collections,
                stats: dataToReturn.stats
            });
        }
    };
    getCollection = async (request, response)=>{
        const data = await this.CollectionService.findOne(request.context, request.params);
        if ("redirect" in data) {
            response.status(StatusCodes.PERMANENT_REDIRECT).json({
                newSlug: data.slug
            });
        } else {
            const isCurrentUserOwner = request.context?.user?.id === data?.creatorId;
            let dataToReturn;
            if (isCurrentUserOwner) {
                // run owner dto
                const { success, data: parsedData } = GetCollectionResDto.safeParse(data);
                if (!success) {
                    throw new InternalServerError();
                }
                dataToReturn = parsedData;
            } else {
                // run public dto
                const { success, data: parsedData } = GetPublicCollectionResDto.safeParse(data);
                if (!success) {
                    throw new InternalServerError();
                }
                dataToReturn = parsedData;
            }
            response.status(StatusCodes.OK).json({
                message: "Fetched successfully.",
                data: dataToReturn
            });
        }
    };
}
