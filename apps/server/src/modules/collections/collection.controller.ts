import {
  CreateCollectionRequestDtoType,
  CreateCollectionResponseDto,
  DeleteCollectionRequestParamDtoType,
  DeleteCollectionResDto,
  DiscoverCollectionsRequestQueryDtoType,
  DiscoverCollectionsResDto,
  ForkCollectionRequestParamDtoType,
  ForkCollectionResDto,
  GetCollectionRequestParamDtoType,
  GetCollectionResDto,
  GetUserCollectionsRequestParamDtoType,
  GetUserCollectionsRequestQueryDtoType,
  GetUserCollectionsResDto,
  UpdateCollectionRequestBodyDtoType,
  UpdateCollectionRequestParamDtoType,
  UpdateCollectionResDto,
} from "@snippetly/common/dto";
import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { Collection } from "../../common/db/schema";
import { InternalServerError } from "../../common/lib/exception";
import { CollectionService } from "./collection.service";

export class CollectionController {
  private readonly CollectionService: CollectionService;

  constructor() {
    this.CollectionService = new CollectionService();
  }

  public create = async (
    request: Request<object, object, CreateCollectionRequestDtoType>,
    response: Response
  ) => {
    const result = await this.CollectionService.create(
      request.context,
      request.body
    );
    const rawResponse = {
      type: "success",
      status: StatusCodes.CREATED,
      data: result,
      message: "Collection has been created successfully.",
    }  
    const { success, data: parsedData } =
      CreateCollectionResponseDto.safeParse(rawResponse);

    if (!success) {
      throw new InternalServerError();
    }
    response.status(parsedData.status).json(parsedData);
  };

  public update = async (
    request: Request<
      UpdateCollectionRequestParamDtoType,
      object,
      UpdateCollectionRequestBodyDtoType
    >,
    response: Response
  ) => {
    const result = await this.CollectionService.update(request.context, {
      data: request.body,
      params: request.params,
    });
    if ("redirect" in result) {
      response.redirect(
        StatusCodes.PERMANENT_REDIRECT,
        `/api/v1/collections/${result.slug}`
      );
    } else {
      const rawResponse = {
        type: "success",
        message: "Collection has been updated successfully.",
        data: result,
        status: StatusCodes.OK,
      };
      const { success, data: parsedData } =
        UpdateCollectionResDto.safeParse(rawResponse);
      if (!success) {
        throw new InternalServerError();
      }
      response.status(parsedData.status).json(parsedData);
    }
  };

  public fork = async (
    request: Request<ForkCollectionRequestParamDtoType>,
    response: Response
  ) => {
    const result = await this.CollectionService.fork(
      request.context,
      request.params
    );
    if ("redirect" in result) {
      response.redirect(
        StatusCodes.PERMANENT_REDIRECT,
        `/api/v1/collections/${result.slug}/fork`
      );
    } else {
      const rawResponse = {
        type: "success",
        message: "Collection has been forked successfully.",
        data: result,
        status: StatusCodes.OK,
      };
      const { success, data: parsedData } =
        ForkCollectionResDto.safeParse(rawResponse);
      if (!success) {
        throw new InternalServerError();
      }
      response.status(parsedData.status).json(parsedData);
    }
  };

  public delete = async (
    request: Request<DeleteCollectionRequestParamDtoType>,
    response: Response
  ) => {
    const result = await this.CollectionService.delete(
      request.context,
      request.params
    );
    if ("redirect" in result) {
      response.redirect(
        StatusCodes.PERMANENT_REDIRECT,
        `/api/v1/collections/${result.slug}`
      );
    } else {
      const rawResponse = {
        type: "success",
        message: "Collection has been deleted successfully.",
        data: null,
        status: StatusCodes.OK,
      };
      const { success, data: parsedData } =
        DeleteCollectionResDto.safeParse(rawResponse);

      if (!success) {
        throw new InternalServerError();
      }
      response.status(parsedData.status).json(parsedData);
    }
  };

  public discover = async (
    req: Request<
      object,
      object,
      object,
      DiscoverCollectionsRequestQueryDtoType
    >,
    res: Response
  ) => {
    const result = await this.CollectionService.discover(
      req.context,
      req.validatedQuery
    );
    const rawResponse = {
      type: "success",
      message: "Fetched successfully.",
      data: result,
      status: StatusCodes.OK,
    };
    const { success, data: parsedData } =
      DiscoverCollectionsResDto.safeParse(rawResponse);

    if (!success) {
      throw new InternalServerError();
    }
    res.status(parsedData.status).json(parsedData);
  };

  public getCurrentUserCollections = async (
    request: Request<
      object,
      object,
      object,
      Pick<GetUserCollectionsRequestQueryDtoType, "limit" | "query" | "cursor">
    >,
    response: Response
  ) => {
    const result = await this.CollectionService.findCurrentUserCollections(
      request.context,
      request.validatedQuery
    );
    const rawResponse = {
      type: "owner-success",
      status: StatusCodes.OK,
      message: "Fetched successfully.",
      data: result,
    };

    const { success, data: parsedData } =
      GetUserCollectionsResDto.safeParse(rawResponse);

    if (!success) {
      throw new InternalServerError();
    }

    response.status(parsedData.status).json(parsedData);
  };

  public getUserCollections = async (
    request: Request<
      GetUserCollectionsRequestParamDtoType,
      object,
      object,
      GetUserCollectionsRequestQueryDtoType
    >,
    response: Response
  ) => {
    const result = await this.CollectionService.find(request.context, {
      ...request.params,
      ...request.validatedQuery,
    });

    if ("redirect" in result) {
      response.status(StatusCodes.PERMANENT_REDIRECT).json({
        newUsername: result.name,
      });
    } else {
      const isCurrentUserOwner =
        request.context?.user?.id === result?.items?.[0]?.creator?.id;

      const rawResponse = {
        type: isCurrentUserOwner ? "owner-success" : "public-success",
        status: StatusCodes.OK,
        message: "Fetched successfully.",
        data: result,
      };

      const { success, data: parsedData } =
        GetUserCollectionsResDto.safeParse(rawResponse);

      if (!success) {
        throw new InternalServerError();
      }

      response.status(parsedData.status).json(parsedData);
    }
  };

  public getCollection = async (
    request: Request<GetCollectionRequestParamDtoType>,
    response: Response
  ) => {
    const result = await this.CollectionService.findOne(
      request.context,
      request.params
    );

    if ("redirect" in result) {
      response.status(StatusCodes.PERMANENT_REDIRECT).json({
        newSlug: result.slug,
      });
    } else {
      const isCurrentUserOwner =
        request.context?.user?.id === (result as Collection)?.creatorId;

      const rawResponse = {
        type: isCurrentUserOwner ? "owner-success" : "public-success",
        status: StatusCodes.OK,
        message: "Fetched successfully.",
        data: result,
      };

      const { success, data: parsedData } =
        GetCollectionResDto.safeParse(rawResponse);
      if (!success) {
        throw new InternalServerError();
      }

      response.status(parsedData.status).json(parsedData);
    }
  };
}
