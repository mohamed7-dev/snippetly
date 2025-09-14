import { Request, Response } from "express";
import { CreateSnippetDtoType } from "./dto/create-snippet.dto";
import { SnippetService } from "./snippet.service";
import { UpdateSnippetDtoType } from "./dto/update-snippet.dto";
import { DeleteSnippetDtoType } from "./dto/delete-snippet.dto";
import { GetUserSnippetsDtoType } from "./dto/get-user-snippets.dto";
import { StatusCodes } from "http-status-codes";
import { ForkSnippetDtoType } from "./dto/fork-snippet.dto";
import { GetSnippetDtoType } from "./dto/get-snippet.dto";
import { DiscoverSnippetsDtoType } from "./dto/discover-snippets.dto";
import { GetCollectionSnippetsDtoType } from "./dto/get-collection-snippets";

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

    res.status(StatusCodes.CREATED).json({
      message: "Snippet has been created successfully.",
      data: data,
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
    const { updatedSnippet, collectionId } = await this.SnippetService.update(
      req.context,
      {
        slug: req.params.slug,
        data: req.body,
      }
    );

    res.status(StatusCodes.OK).json({
      message: `Snippet has been updated successfully${
        req.body.collection && !collectionId
          ? ", but the collection couldn't be found."
          : "."
      }`,
      data: updatedSnippet,
    });
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

    res.status(StatusCodes.OK).json({
      message: `Snippet has been forked successfully.`,
      data: data,
    });
  };

  public delete = async (req: Request<DeleteSnippetDtoType>, res: Response) => {
    await this.SnippetService.delete(req.context, req.params);

    res.status(StatusCodes.OK).json({
      message: "Snippet has been deleted successfully.",
      data: null,
    });
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
    const { items, nextCursor, total, collection } =
      await this.SnippetService.getSnippetsByCollection(req.context, {
        ...req.params,
        ...(req.validatedQuery as Omit<GetUserSnippetsDtoType, "creator">),
      });

    const isCurrentUserOwner = req.context.user.id === collection.creatorId;
    let dataToReturn: any;
    if (isCurrentUserOwner) {
      // use owner dto
    } else {
      // use public dto
    }
    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      items,
      nextCursor,
      total,
    });
  };

  public discover = async (
    req: Request<{}, {}, {}, DiscoverSnippetsDtoType>,
    res: Response
  ) => {
    const data = await this.SnippetService.discover(
      req.context,
      req.validatedQuery
    );

    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      ...data,
    });
  };

  public getCurrentUserSnippets = async (
    req: Request<{}, {}, {}, Omit<GetUserSnippetsDtoType, "creator">>,
    res: Response
  ) => {
    const { items, nextCursor, total } =
      await this.SnippetService.getCurrentUserSnippets(req.context, {
        ...(req.validatedQuery as Omit<GetUserSnippetsDtoType, "creator">),
      });

    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      items,
      nextCursor,
      total,
    });
  };

  public getUserSnippets = async (
    req: Request<
      Pick<GetUserSnippetsDtoType, "creator">,
      {},
      {},
      Omit<GetUserSnippetsDtoType, "creator">
    >,
    res: Response
  ) => {
    const { items, nextCursor, total } =
      await this.SnippetService.getUserSnippets(req.context, {
        ...req.params,
        ...(req.validatedQuery as Omit<GetUserSnippetsDtoType, "creator">),
      });

    const isCurrentUserOwner = req.context.user.name === req.params.creator;
    let dataToReturn: any;
    if (isCurrentUserOwner) {
      // use owner dto
    } else {
      // use public dto
    }
    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      items,
      nextCursor,
      total,
    });
  };

  public getCurrentUserFriendsSnippets = async (
    req: Request<{}, {}, {}, Omit<GetUserSnippetsDtoType, "creator">>,
    res: Response
  ) => {
    const { items, nextCursor, total } =
      await this.SnippetService.getCurrentUserFriendsSnippets(req.context, {
        ...(req.validatedQuery as Omit<GetUserSnippetsDtoType, "creator">),
      });

    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      items,
      nextCursor,
      total,
    });
  };

  public getUserFriendsSnippets = async (
    req: Request<
      Pick<GetUserSnippetsDtoType, "creator">,
      {},
      {},
      Omit<GetUserSnippetsDtoType, "creator">
    >,
    res: Response
  ) => {
    const { items, nextCursor, total } =
      await this.SnippetService.getUserFriendsSnippets(req.context, {
        ...req.params,
        ...(req.validatedQuery as Omit<GetUserSnippetsDtoType, "creator">),
      });

    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      items,
      nextCursor,
      total,
    });
  };

  public getSnippet = async (
    req: Request<GetSnippetDtoType>,
    res: Response
  ) => {
    const data = await this.SnippetService.findOne(req.context, req.params);
    const isCurrentUserOwner = req.context?.user?.id === data.creatorId;

    let dataToReturn: any;
    if (isCurrentUserOwner) {
      // use owner dto
    } else {
      // use public dto
    }
    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      data: data,
    });
  };
}
