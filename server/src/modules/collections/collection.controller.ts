import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CollectionService } from "./collection.service";
import { CreateCollectionDtoType } from "./dto/create-collection.dto";
import {
  DiscoverCollectionsDtoType,
  FindCollectionDtoType,
  FindCollectionsDtoType,
} from "./dto/find-collection.dto";
import {
  CreateCollectionResDto,
  DiscoverCollectionsResDto,
  ForkCollectionResDto,
  GetCollectionResDto,
  GetCollectionResDtoType,
  GetCurrentUserCollectionsResDto,
  GetCurrentUserCollectionsResDtoType,
  GetPublicCollectionResDto,
  GetPublicCollectionResDtoType,
  GetPublicUserCollectionsResDto,
  GetPublicUserCollectionsResDtoType,
  UpdateCollectionResDto,
} from "./dto/response.dto";
import { InternalServerError } from "../../common/lib/exception";
import { UpdateCollectionDtoType } from "./dto/update-collection.dto";
import { ForkCollectionDtoType } from "./dto/fork-collection.dto";
import { DeleteCollectionDtoType } from "./dto/delete-collection.dto";
import { Collection } from "../../common/db/schema";

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
    const { success, data: parsedData } =
      CreateCollectionResDto.safeParse(newCollection);
    if (!success) {
      throw new InternalServerError();
    }
    response.status(StatusCodes.CREATED).json({
      message: "Collection has been created successfully.",
      data: parsedData,
    });
  };

  public update = async (
    request: Request<
      Pick<UpdateCollectionDtoType, "slug">,
      {},
      UpdateCollectionDtoType["data"]
    >,
    response: Response
  ) => {
    const result = await this.CollectionService.update(request.context, {
      data: request.body,
      slug: request.params.slug,
    });
    if ("redirect" in result) {
      response.redirect(
        StatusCodes.TEMPORARY_REDIRECT,
        `/collections/${result.slug}`
      );
    } else {
      const { success, data: parsedData } =
        UpdateCollectionResDto.safeParse(result);
      if (!success) {
        throw new InternalServerError();
      }
      response.status(StatusCodes.OK).json({
        message: "Collection has been updated successfully.",
        data: parsedData,
      });
    }
  };

  public fork = async (
    request: Request<ForkCollectionDtoType>,
    response: Response
  ) => {
    const result = await this.CollectionService.fork(
      request.context,
      request.params
    );
    if ("redirect" in result) {
      response.redirect(
        StatusCodes.TEMPORARY_REDIRECT,
        `/collections/${result.slug}/fork`
      );
    } else {
      const { success, data: parsedData } =
        ForkCollectionResDto.safeParse(result);
      if (!success) {
        throw new InternalServerError();
      }
      response.status(StatusCodes.CREATED).json({
        message: "Collection has been forked successfully.",
        data: parsedData,
      });
    }
  };

  public delete = async (
    request: Request<DeleteCollectionDtoType>,
    response: Response
  ) => {
    const result = await this.CollectionService.delete(
      request.context,
      request.params
    );
    if ("redirect" in result) {
      response.redirect(
        StatusCodes.TEMPORARY_REDIRECT,
        `/collections/${result.slug}`
      );
    } else {
      response.status(StatusCodes.OK).json({
        message: "Collection has been deleted successfully",
        data: null,
      });
    }
  };

  public discover = async (
    req: Request<{}, {}, {}, DiscoverCollectionsDtoType>,
    res: Response
  ) => {
    const data = await this.CollectionService.discover(
      req.context,
      req.validatedQuery
    );
    const { success, data: parsedData } = DiscoverCollectionsResDto.safeParse(
      data.items
    );
    if (!success) {
      throw new InternalServerError();
    }
    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      ...data,
      items: parsedData,
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
    const data = await this.CollectionService.findCurrentUserCollections(
      request.context,
      request.validatedQuery
    );
    const { success, data: parsedData } =
      GetCurrentUserCollectionsResDto.safeParse({
        stats: data.stats,
        collections: data.items,
      });
    if (!success) {
      throw new InternalServerError();
    }
    response.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      ...data,
      items: parsedData.collections,
      stats: parsedData.stats,
    });
  };

  public getUserCollections = async (
    request: Request<
      Pick<FindCollectionsDtoType, "creatorName">,
      {},
      {},
      Omit<FindCollectionsDtoType, "creatorName">
    >,
    response: Response
  ) => {
    const data = await this.CollectionService.find(request.context, {
      ...request.params,
      ...(request.validatedQuery as Omit<
        FindCollectionsDtoType,
        "creatorName"
      >),
    });
    if ("redirect" in data) {
      response.redirect(
        StatusCodes.TEMPORARY_REDIRECT,
        `/collections/user/${data.name}`
      );
    } else {
      const isCurrentUserOwner =
        request.context?.user?.id === data?.items?.[0].creator.id;

      let dataToReturn:
        | GetCurrentUserCollectionsResDtoType
        | GetPublicUserCollectionsResDtoType;

      if (isCurrentUserOwner) {
        // run the owner dto
        const { success, data: parsedData } =
          GetCurrentUserCollectionsResDto.safeParse({
            stats: data.stats,
            collections: data.items,
          });
        if (!success) {
          throw new InternalServerError();
        }
        dataToReturn = parsedData;
      } else {
        // run the public dto
        const { success, data: parsedData } =
          GetPublicUserCollectionsResDto.safeParse({
            stats: data.stats,
            collections: data.items,
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
        stats: dataToReturn.stats,
      });
    }
  };

  public getCollection = async (
    request: Request<FindCollectionDtoType>,
    response: Response
  ) => {
    const data = await this.CollectionService.findOne(
      request.context,
      request.params
    );

    if ("redirect" in data) {
      response.redirect(
        StatusCodes.TEMPORARY_REDIRECT,
        `/collections/${data.slug}`
      );
    } else {
      const isCurrentUserOwner =
        request.context?.user?.id === (data as Collection)?.creatorId;

      let dataToReturn: GetCollectionResDtoType | GetPublicCollectionResDtoType;
      if (isCurrentUserOwner) {
        // run owner dto
        const { success, data: parsedData } =
          GetCollectionResDto.safeParse(data);
        if (!success) {
          throw new InternalServerError();
        }
        dataToReturn = parsedData;
      } else {
        // run public dto
        const { success, data: parsedData } =
          GetPublicCollectionResDto.safeParse(data);
        if (!success) {
          throw new InternalServerError();
        }
        dataToReturn = parsedData;
      }

      response.status(StatusCodes.OK).json({
        message: "Fetched successfully.",
        data: dataToReturn,
      });
    }
  };
}
