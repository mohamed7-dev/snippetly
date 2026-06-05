import {
  CreateSnippetRequestDtoType,
  CreateSnippetResDto,
  CreateSnippetResDtoType,
  DeleteSnippetRequestParamDtoType,
  DeleteSnippetResDto,
  DeleteSnippetResDtoType,
  DiscoverSnippetsRequestQueryDtoType,
  DiscoverSnippetsResDto,
  DiscoverSnippetsResDtoType,
  ForkSnippetRequestBodyDtoType,
  ForkSnippetRequestParamDtoType,
  ForkSnippetResDto,
  ForkSnippetResDtoType,
  GetCollectionSnippetsRequestParamDtoType,
  GetCollectionSnippetsRequestQueryDtoType,
  GetCollectionSnippetsResDto,
  GetCollectionSnippetsResDtoType,
  GetSnippetRequestParamDtoType,
  GetSnippetResDto,
  GetSnippetResDtoType,
  GetUserFriendsSnippetsResDto,
  GetUserFriendsSnippetsResDtoType,
  GetUserSnippetsRequestParamDtoType,
  GetUserSnippetsRequestQueryDtoType,
  GetUserSnippetsResDto,
  GetUserSnippetsResDtoType,
  UpdateSnippetRequestBodyDtoType,
  UpdateSnippetRequestParamDtoType,
  UpdateSnippetResDto,
  UpdateSnippetResDtoType,
} from "@snippetly/common/dto";
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { InternalServerError } from "../../common/lib/exception";
import { SnippetService } from "./snippet.service";

export class SnippetController {
  private readonly SnippetService: SnippetService;

  constructor() {
    this.SnippetService = new SnippetService();
  }

  public create = async (
    req: Request<object, object, CreateSnippetRequestDtoType>,
    res: Response,
  ) => {
    const result = await this.SnippetService.create(req.context, req.body);
    const rawRes = {
      type: "success",
      status: StatusCodes.CREATED,
      message: "Snippet has been created successfully.",
      data: result,
    } satisfies CreateSnippetResDtoType["success"];
    const { success, data: parsedData } = CreateSnippetResDto.safeParse(rawRes);

    if (!success) {
      throw new InternalServerError();
    }

    res.status(parsedData.status).json(parsedData);
  };

  public update = async (
    req: Request<
      UpdateSnippetRequestParamDtoType,
      object,
      UpdateSnippetRequestBodyDtoType
    >,
    res: Response,
  ) => {
    const result = await this.SnippetService.update(req.context, {
      params: req.params,
      data: req.body,
    });
    if ("redirect" in result) {
      res.redirect(StatusCodes.TEMPORARY_REDIRECT, `/snippets/${result?.slug}`);
    } else {
      const { updatedSnippet, collectionId } = result;
      const rawRes = {
        type: "success",
        status: StatusCodes.OK,
        message: `Snippet has been updated successfully${
          req.body.collectionSlug && !collectionId
            ? ", but the collection couldn't be found."
            : "."
        }`,
        data: updatedSnippet,
      } satisfies UpdateSnippetResDtoType["success"];
      const { success, data: parsedData } =
        UpdateSnippetResDto.safeParse(rawRes);

      if (!success) {
        throw new InternalServerError();
      }
      res.status(parsedData.status).json(parsedData);
    }
  };

  public fork = async (
    req: Request<
      ForkSnippetRequestParamDtoType,
      object,
      ForkSnippetRequestBodyDtoType
    >,
    res: Response,
  ) => {
    const result = await this.SnippetService.fork(req.context, {
      params: req.params,
      data: req.body,
    });
    if ("redirect" in result) {
      res.redirect(
        StatusCodes.TEMPORARY_REDIRECT,
        `/snippets/${result?.slug}/fork`,
      );
    } else {
      const rawRes = {
        type: "success",
        status: StatusCodes.OK,
        message: "Snippet has been updated successfully",
        data: result,
      } satisfies ForkSnippetResDtoType["success"];
      const { success, data: parsedData } = ForkSnippetResDto.safeParse(rawRes);
      if (!success) {
        throw new InternalServerError();
      }

      res.status(parsedData.status).json(parsedData);
    }
  };

  public delete = async (
    req: Request<DeleteSnippetRequestParamDtoType>,
    res: Response,
  ) => {
    const result = await this.SnippetService.delete(req.context, req.params);
    if ("redirect" in result) {
      res.redirect(StatusCodes.TEMPORARY_REDIRECT, `/snippets/${result?.slug}`);
    } else {
      const rawRes = {
        type: "success",
        status: StatusCodes.OK,
        message: "Snippet has been updated successfully",
        data: null,
      } satisfies DeleteSnippetResDtoType["success"];
      const { success, data: parsedData } =
        DeleteSnippetResDto.safeParse(rawRes);
      if (!success) {
        throw new InternalServerError();
      }
      res.status(parsedData.status).json(parsedData);
    }
  };

  public getSnippetsByCollection = async (
    req: Request<
      GetCollectionSnippetsRequestParamDtoType,
      object,
      object,
      GetCollectionSnippetsRequestQueryDtoType
    >,
    res: Response,
  ) => {
    const result = await this.SnippetService.getSnippetsByCollection(
      req.context,
      {
        ...req.params,
        ...req.validatedQuery,
      },
    );
    if ("redirect" in result) {
      // res.redirect(
      //   StatusCodes.PERMANENT_REDIRECT,
      //   `/api/v1/snippets/collection/${result?.slug}`
      // );
      res.status(StatusCodes.PERMANENT_REDIRECT).json({
        newSlug: result.slug,
      });
    } else {
      const isCurrentUserOwner =
        req.context.user.id === result.collection.creatorId;
      const rawRes = {
        type: isCurrentUserOwner ? "owner-success" : "public-success",
        message: "Fetched successfully.",
        status: StatusCodes.OK,
        data: {
          items: { snippets: result.items, collection: result.collection },
          total: result.total,
          nextCursor: result.nextCursor ?? undefined,
        },
      } satisfies GetCollectionSnippetsResDtoType["success"];
      const { success, data: parsedData } =
        GetCollectionSnippetsResDto.safeParse(rawRes);
      if (!success) {
        throw new InternalServerError();
      }

      res.status(parsedData.status).json(parsedData);
    }
  };

  public discover = async (
    req: Request<object, object, object, DiscoverSnippetsRequestQueryDtoType>,
    res: Response,
  ) => {
    const result = await this.SnippetService.discover(
      req.context,
      req.validatedQuery,
    );
    const rawRes = {
      type: "success",
      message: "Fetched successfully.",
      status: StatusCodes.OK,
      data: { ...result, nextCursor: result.nextCursor ?? undefined },
    } satisfies DiscoverSnippetsResDtoType["success"];
    const { success, data: parsedData } =
      DiscoverSnippetsResDto.safeParse(rawRes);
    if (!success) {
      throw new InternalServerError();
    }
    res.status(parsedData.status).json(parsedData);
  };

  public getCurrentUserSnippets = async (
    req: Request<object, object, object, GetUserSnippetsRequestQueryDtoType>,
    res: Response,
  ) => {
    const result = await this.SnippetService.getCurrentUserSnippets(
      req.context,
      {
        ...req.validatedQuery,
      },
    );
    if (!("redirect" in result)) {
      const rawRes = {
        type: "owner-success" as const,
        message: "Fetched successfully.",
        status: StatusCodes.OK,
        data: { ...result, nextCursor: result.nextCursor ?? undefined },
      } satisfies GetUserSnippetsResDtoType["success"];
      const { success, data: parsedData } =
        GetUserSnippetsResDto.safeParse(rawRes);
      if (!success) {
        throw new InternalServerError();
      }
      res.status(parsedData.status).json(parsedData);
    }
  };

  public getUserSnippets = async (
    req: Request<
      GetUserSnippetsRequestParamDtoType,
      object,
      object,
      GetUserSnippetsRequestQueryDtoType
    >,
    res: Response,
  ) => {
    const result = await this.SnippetService.getUserSnippets(req.context, {
      ...req.params,
      ...req.validatedQuery,
    });
    if ("redirect" in result) {
      res.redirect(
        StatusCodes.TEMPORARY_REDIRECT,
        `/snippets/user/${result.name}`,
      );
    } else {
      const { items, total, nextCursor } = result;
      const isCurrentUserOwner =
        req.context.user?.id === items?.[0]?.creator?.id;
      const rawRes = {
        type: isCurrentUserOwner ? "owner-success" : "public-success",
        message: "Fetched successfully.",
        data: { items, total, nextCursor: nextCursor ?? undefined },
        status: StatusCodes.OK,
      } satisfies GetUserSnippetsResDtoType["success"];
      const { success, data: parsedData } =
        GetUserSnippetsResDto.safeParse(rawRes);
      if (!success) {
        throw new InternalServerError();
      }
      res.status(parsedData.status).json(parsedData);
    }
  };

  public getCurrentUserFriendsSnippets = async (
    req: Request<object, object, object, GetUserSnippetsRequestQueryDtoType>,
    res: Response,
  ) => {
    const result = await this.SnippetService.getCurrentUserFriendsSnippets(
      req.context,
      {
        ...req.validatedQuery,
      },
    );

    if ("redirect" in result) {
      return res.redirect(StatusCodes.TEMPORARY_REDIRECT, ``);
    }

    const rawRes = {
      type: "success",
      message: "Fetched successfully.",
      status: StatusCodes.OK,
      data: { ...result, nextCursor: result.nextCursor ?? undefined },
    } satisfies GetUserFriendsSnippetsResDtoType["success"];
    const { success, data: parsedData } =
      GetUserFriendsSnippetsResDto.safeParse(rawRes);

    if (!success) {
      throw new InternalServerError();
    }
    res.status(parsedData.status).json(parsedData);
  };

  public getUserFriendsSnippets = async (
    req: Request<
      GetUserSnippetsRequestParamDtoType,
      object,
      object,
      GetUserSnippetsRequestQueryDtoType
    >,
    res: Response,
  ) => {
    const result = await this.SnippetService.getUserFriendsSnippets(
      req.context,
      {
        ...req.params,
        ...req.validatedQuery,
      },
    );
    if ("redirect" in result) {
      res.redirect(
        StatusCodes.TEMPORARY_REDIRECT,
        `/snippets/${result.name}/friends`,
      );
    } else {
      const rawRes = {
        type: "success",
        message: "Fetched successfully.",
        data: { ...result, nextCursor: result.nextCursor ?? undefined },
        status: StatusCodes.OK,
      } satisfies GetUserFriendsSnippetsResDtoType["success"];

      const { success, data: parsedData } =
        GetUserFriendsSnippetsResDto.safeParse(rawRes);

      if (!success) {
        throw new InternalServerError();
      }

      res.status(parsedData.status).json(parsedData);
    }
  };

  public getSnippet = async (
    req: Request<GetSnippetRequestParamDtoType>,
    res: Response,
  ) => {
    const result = await this.SnippetService.findOne(req.context, req.params);
    if ("redirect" in result) {
      res.redirect(StatusCodes.TEMPORARY_REDIRECT, `/snippets/${result.slug}`);
    } else {
      const isCurrentUserOwner = req.context?.user?.id === result.creatorId;
      const rawRes = {
        type: isCurrentUserOwner ? "owner-success" : "public-success",
        message: "Fetched successfully.",
        data: result,
        status: StatusCodes.OK,
      } satisfies GetSnippetResDtoType["success"];
      const { success, data: parsedData } = GetSnippetResDto.safeParse(rawRes);
      if (!success) {
        throw new InternalServerError();
      }

      res.status(parsedData.status).json(parsedData);
    }
  };
}
