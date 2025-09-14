import { Request, Response } from "express";
import { UpdateFolderDtoType } from "./dto/update-collection.dto";
import { DeleteFolderDtoType } from "./dto/delete-collection.dto";
import { StatusCodes } from "http-status-codes";
import { ForkFolderDtoType } from "./dto/fork-collection.dto";
import { CollectionService } from "./collection.service";
import { CreateCollectionDtoType } from "./dto/create-collection.dto";
import {
  DiscoverCollectionsDtoType,
  FindCollectionDtoType,
  FindCollectionsDtoType,
} from "./dto/find-collection.dto";

export class CollectionController {
  private readonly CollectionService: CollectionService;

  constructor() {
    this.CollectionService = new CollectionService();
  }

  public create = async (
    request: Request<{}, {}, CreateCollectionDtoType>,
    response: Response
  ) => {
    const newCollection = await this.CollectionService.create(
      request.context,
      request.body
    );

    response.status(StatusCodes.CREATED).json({
      message: "Collection has been created successfully.",
      data: newCollection,
    });
  };

  public update = async (
    request: Request<
      Pick<UpdateFolderDtoType, "slug">,
      {},
      UpdateFolderDtoType["data"]
    >,
    response: Response
  ) => {
    const updatedCollection = await this.CollectionService.update(
      request.context,
      {
        data: request.body,
        slug: request.params.slug,
      }
    );

    response.status(StatusCodes.OK).json({
      message: "Collection has been updated successfully.",
      data: updatedCollection,
    });
  };

  public fork = async (
    request: Request<ForkFolderDtoType>,
    response: Response
  ) => {
    const forkedCollection = await this.CollectionService.fork(
      request.context,
      request.params
    );

    response.status(StatusCodes.CREATED).json({
      message: "Collection has been forked successfully.",
      data: forkedCollection,
    });
  };

  public delete = async (
    request: Request<DeleteFolderDtoType>,
    response: Response
  ) => {
    await this.CollectionService.delete(request.context, request.params);
    response.status(StatusCodes.OK).json({
      message: "Collection has been deleted successfully",
      data: null,
    });
  };

  public discover = async (
    req: Request<{}, {}, {}, DiscoverCollectionsDtoType>,
    res: Response
  ) => {
    const data = await this.CollectionService.discover(
      req.context,
      req.validatedQuery
    );

    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      ...data,
    });
  };

  public getCurrentUserCollections = async (
    request: Request<
      {},
      {},
      {},
      Pick<FindCollectionsDtoType, "limit" | "query" | "cursor">
    >,
    response: Response
  ) => {
    const data = await this.CollectionService.findCurrentUserFolders(
      request.context,
      request.validatedQuery
    );

    response.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      ...data,
    });
  };

  public getUserCollections = async (
    request: Request<
      Pick<FindCollectionsDtoType, "creator">,
      {},
      {},
      Omit<FindCollectionsDtoType, "creator">
    >,
    response: Response
  ) => {
    const data = await this.CollectionService.find(request.context, {
      ...request.params,
      ...(request.validatedQuery as Omit<FindCollectionsDtoType, "creator">),
    });

    const isCurrentUserOwner =
      request.context?.user?.name === request.params.creator;

    let dataToReturn: any;
    if (isCurrentUserOwner) {
      // run the public dto
    } else {
      // run the owner dto
    }

    response.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      ...data,
    });
  };

  public getCollection = async (
    request: Request<FindCollectionDtoType>,
    response: Response
  ) => {
    const data = await this.CollectionService.findOne(
      request.context,
      request.params
    );

    const isCurrentUserOwner = request.context?.user?.id === data.creatorId;

    let dataToReturn: any;
    if (isCurrentUserOwner) {
      // run public dto
    } else {
      // run owner dto
    }

    response.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      data,
    });
  };
}
