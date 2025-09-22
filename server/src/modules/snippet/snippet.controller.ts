import type { Request, Response } from "express";
import type { CreateSnippetDtoType } from "./dto/create-snippet.dto.ts";
import { SnippetService } from "./snippet.service.ts";
import type { UpdateSnippetDtoType } from "./dto/update-snippet.dto.ts";
import type { DeleteSnippetDtoType } from "./dto/delete-snippet.dto.ts";
import type { GetUserSnippetsDtoType } from "./dto/get-user-snippets.dto.ts";
import { StatusCodes } from "http-status-codes";
import type { ForkSnippetDtoType } from "./dto/fork-snippet.dto.ts";
import type { GetSnippetDtoType } from "./dto/get-snippet.dto.ts";
import type { DiscoverSnippetsDtoType } from "./dto/discover-snippets.dto.ts";
import type { GetCollectionSnippetsDtoType } from "./dto/get-collection-snippets.ts";
import {
  CreateSnippetResDto,
  DiscoverSnippetsResDto,
  GetCurrentUserFriendsSnippetsResDto,
  GetCurrentUserSnippetsResDto,
  GetPublicSnippetResDto,
  GetPublicSnippetsByCollectionResDto,
  GetSnippetResDto,
  GetSnippetsByCollectionResDto,
  GetUserSnippetsResDto,
  UpdateSnippetResDto,
} from "./dto/response.dto.ts";
import { InternalServerError } from "../../common/lib/exception.ts";

export class SnippetController {
  private readonly SnippetService: SnippetService;

  constructor() {
    this.SnippetService = new SnippetService();
  }

  public create = async (
    req: Request<{}, {}, CreateSnippetDtoType>,
    res: Response
  ) => {
    const data = await this.SnippetService.create(req.context, req.body);
    const {
      success,
      data: parsedData,
      error,
    } = CreateSnippetResDto.safeParse(data);
    console.log(error);
    if (!success) {
      throw new InternalServerError();
    }
    res.status(StatusCodes.CREATED).json({
      message: "Snippet has been created successfully.",
      data: parsedData,
    });
  };

  public update = async (
    req: Request<
      Pick<UpdateSnippetDtoType, "slug">,
      {},
      UpdateSnippetDtoType["data"]
    >,
    res: Response
  ) => {
    const result = await this.SnippetService.update(req.context, {
      slug: req.params.slug,
      data: req.body,
    });
    if ("redirect" in result) {
      res.redirect(StatusCodes.TEMPORARY_REDIRECT, `/snippets/${result?.slug}`);
    } else {
      const { updatedSnippet, collectionId } = result;
      const { success, data: parsedData } =
        UpdateSnippetResDto.safeParse(updatedSnippet);
      if (!success) {
        throw new InternalServerError();
      }
      res.status(StatusCodes.OK).json({
        message: `Snippet has been updated successfully${
          req.body.collection && !collectionId
            ? ", but the collection couldn't be found."
            : "."
        }`,
        data: parsedData,
      });
    }
  };

  public fork = async (
    req: Request<
      Pick<ForkSnippetDtoType, "slug">,
      {},
      Omit<ForkSnippetDtoType, "slug">
    >,
    res: Response
  ) => {
    const data = await this.SnippetService.fork(req.context, {
      slug: req.params.slug,
      ...req.body,
    });
    if ("redirect" in data) {
      res.redirect(
        StatusCodes.TEMPORARY_REDIRECT,
        `/snippets/${data?.slug}/fork`
      );
    } else {
      const { success, data: parsedData } = UpdateSnippetResDto.safeParse(data);
      if (!success) {
        throw new InternalServerError();
      }

      res.status(StatusCodes.OK).json({
        message: `Snippet has been forked successfully.`,
        data: parsedData,
      });
    }
  };

  public delete = async (req: Request<DeleteSnippetDtoType>, res: Response) => {
    const result = await this.SnippetService.delete(req.context, req.params);
    if ("redirect" in result) {
      res.redirect(StatusCodes.TEMPORARY_REDIRECT, `/snippets/${result?.slug}`);
    } else {
      res.status(StatusCodes.OK).json({
        message: "Snippet has been deleted successfully.",
        data: null,
      });
    }
  };

  public getSnippetsByCollection = async (
    req: Request<
      Pick<GetCollectionSnippetsDtoType, "collection">,
      {},
      {},
      Omit<GetCollectionSnippetsDtoType, "collection">
    >,
    res: Response
  ) => {
    const result = await this.SnippetService.getSnippetsByCollection(
      req.context,
      {
        ...req.params,
        ...(req.validatedQuery as Omit<GetUserSnippetsDtoType, "creator">),
      }
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
      const { items, collection, nextCursor, total } = result;

      const isCurrentUserOwner = req.context.user.id === collection.creatorId;
      let dataToReturn: any;
      if (isCurrentUserOwner) {
        // use owner dto
        const { success, data: parsedData } =
          GetSnippetsByCollectionResDto.safeParse({
            snippets: items,
            collection,
          });
        if (!success) {
          throw new InternalServerError();
        }
        dataToReturn = parsedData;
      } else {
        // use public dto
        const { success, data: parsedData } =
          GetPublicSnippetsByCollectionResDto.safeParse({
            snippets: items,
            collection,
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
        total,
      });
    }
  };

  public discover = async (
    req: Request<{}, {}, {}, DiscoverSnippetsDtoType>,
    res: Response
  ) => {
    const data = await this.SnippetService.discover(
      req.context,
      req.validatedQuery
    );
    const { success, data: parsedData } = DiscoverSnippetsResDto.safeParse(
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

  public getCurrentUserSnippets = async (
    req: Request<{}, {}, {}, Omit<GetUserSnippetsDtoType, "creator">>,
    res: Response
  ) => {
    const { items, nextCursor, total } =
      await this.SnippetService.getCurrentUserSnippets(req.context, {
        ...(req.validatedQuery as Omit<GetUserSnippetsDtoType, "creatorName">),
      });

    const { success, data: parsedData } =
      GetCurrentUserSnippetsResDto.safeParse(items);
    if (!success) {
      throw new InternalServerError();
    }
    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      items: parsedData,
      nextCursor,
      total,
    });
  };

  public getUserSnippets = async (
    req: Request<
      Pick<GetUserSnippetsDtoType, "creatorName">,
      {},
      {},
      Omit<GetUserSnippetsDtoType, "creatorName">
    >,
    res: Response
  ) => {
    const result = await this.SnippetService.getUserSnippets(req.context, {
      ...req.params,
      ...(req.validatedQuery as Omit<GetUserSnippetsDtoType, "creatorName">),
    });
    if ("redirect" in result) {
      res.redirect(
        StatusCodes.TEMPORARY_REDIRECT,
        `/snippets/user/${result.name}`
      );
    } else {
      const { items, total, nextCursor } = result;
      const isCurrentUserOwner =
        req.context.user?.id === items?.[0]?.creator?.id;
      let dataToReturn: any;
      if (isCurrentUserOwner) {
        // use owner dto
        const { success, data: parsedData } =
          GetCurrentUserSnippetsResDto.safeParse(items);
        if (!success) {
          throw new InternalServerError();
        }
        dataToReturn = parsedData;
      } else {
        // use public dto
        const { success, data: parsedData } =
          GetUserSnippetsResDto.safeParse(items);
        if (!success) {
          throw new InternalServerError();
        }
        dataToReturn = parsedData;
      }
      res.status(StatusCodes.OK).json({
        message: "Fetched successfully.",
        items: dataToReturn,
        nextCursor,
        total,
      });
    }
  };

  public getCurrentUserFriendsSnippets = async (
    req: Request<{}, {}, {}, Omit<GetUserSnippetsDtoType, "creatorName">>,
    res: Response
  ) => {
    const { items, nextCursor, total } =
      await this.SnippetService.getCurrentUserFriendsSnippets(req.context, {
        ...(req.validatedQuery as Omit<GetUserSnippetsDtoType, "creatorName">),
      });
    const { success, data: parsedData } =
      GetCurrentUserFriendsSnippetsResDto.safeParse(items);
    if (!success) {
      throw new InternalServerError();
    }
    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      items: parsedData,
      nextCursor,
      total,
    });
  };

  public getUserFriendsSnippets = async (
    req: Request<
      Pick<GetUserSnippetsDtoType, "creatorName">,
      {},
      {},
      Omit<GetUserSnippetsDtoType, "creatorName">
    >,
    res: Response
  ) => {
    const result = await this.SnippetService.getUserFriendsSnippets(
      req.context,
      {
        ...req.params,
        ...(req.validatedQuery as Omit<GetUserSnippetsDtoType, "creatorName">),
      }
    );
    if ("redirect" in result) {
      res.redirect(
        StatusCodes.TEMPORARY_REDIRECT,
        `/snippets/${result.name}/friends`
      );
    } else {
      const { items, total, nextCursor } = result;
      const { success, data: parsedData } =
        GetCurrentUserFriendsSnippetsResDto.safeParse(items);
      if (!success) {
        throw new InternalServerError();
      }
      res.status(StatusCodes.OK).json({
        message: "Fetched successfully.",
        items: parsedData,
        nextCursor,
        total,
      });
    }
  };

  public getSnippet = async (
    req: Request<GetSnippetDtoType>,
    res: Response
  ) => {
    const data = await this.SnippetService.findOne(req.context, req.params);
    if ("redirect" in data) {
      res.redirect(StatusCodes.TEMPORARY_REDIRECT, `/snippets/${data.slug}`);
    } else {
      const isCurrentUserOwner = req.context?.user?.id === data.creatorId;
      let dataToReturn: any;
      if (isCurrentUserOwner) {
        // use owner dto
        const { success, data: parsedData } = GetSnippetResDto.safeParse(data);
        if (!success) {
          throw new InternalServerError();
        }
        dataToReturn = parsedData;
      } else {
        // use public dto
        const { success, data: parsedData } =
          GetPublicSnippetResDto.safeParse(data);
        if (!success) {
          throw new InternalServerError();
        }
        dataToReturn = parsedData;
      }
      res.status(StatusCodes.OK).json({
        message: "Fetched successfully.",
        data: dataToReturn,
      });
    }
  };
}
