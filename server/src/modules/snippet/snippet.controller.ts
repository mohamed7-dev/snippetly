import { Request, Response } from "express";
import { CreateSnippetDtoType } from "./dto/create-snippet.dto";
import { SnippetService } from "./snippet.service";
import { UpdateSnippetDtoType } from "./dto/update-snippet.dto";
import { DeleteSnippetDtoType } from "./dto/delete-snippet.dto";
import { GetUserSnippetsDtoType } from "./dto/get-user-snippets.dto";
import { StatusCodes } from "http-status-codes";
import { ForkSnippetDtoType } from "./dto/fork-snippet.dto";
import {
  GetPublicSnippetResDto,
  GetPublicUserSnippetsResDto,
  GetPublicUserSnippetsResDtoType,
  GetSnippetResDto,
  GetUserSnippetsResponseDto,
  GetUserSnippetsResponseDtoType,
} from "./dto/response.dto";
import { InternalServerError } from "../../common/lib/exception";
import { SelectSnippetDto } from "./dto/select-snippet.dto";
import { GetSnippetDtoType } from "./dto/get-snippet.dto";

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
    } = SelectSnippetDto.safeParse(data);
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
    const { updatedSnippet, newFolderId } = await this.SnippetService.update(
      req.context,
      {
        slug: req.params.slug,
        data: req.body,
      }
    );

    const { success, data: parsedData } =
      SelectSnippetDto.safeParse(updatedSnippet);
    if (!success) {
      throw new InternalServerError();
    }

    res.status(StatusCodes.OK).json({
      message: `Snippet has been updated successfully${
        req.body.folder && !newFolderId
          ? ", but the folder couldn't be found."
          : "."
      }`,
      data: parsedData,
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
    const { success, data: parsedData } = SelectSnippetDto.safeParse(data);
    if (!success) {
      throw new InternalServerError();
    }

    res.status(StatusCodes.OK).json({
      message: `Snippet has been forked successfully.`,
      data: parsedData,
    });
  };

  public delete = async (req: Request<DeleteSnippetDtoType>, res: Response) => {
    await this.SnippetService.delete(req.context, req.params);

    res.status(StatusCodes.OK).json({
      message: "Snippet has been deleted successfully.",
      data: null,
    });
  };

  public getCurrentUserSnippets = async (
    req: Request<{}, {}, {}, Omit<GetUserSnippetsDtoType, "name">>,
    res: Response
  ) => {
    const { data, nextCursor, total } =
      await this.SnippetService.getCurrentUserSnippets(req.context, {
        ...req.query,
      });

    const { success, data: parsedData } =
      GetUserSnippetsResponseDto.safeParse(data);
    if (!success) {
      throw new InternalServerError();
    }

    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      data: parsedData,
      nextCursor,
      total,
    });
  };

  public getUserSnippets = async (
    req: Request<
      Pick<GetUserSnippetsDtoType, "name">,
      {},
      {},
      Omit<GetUserSnippetsDtoType, "name">
    >,
    res: Response
  ) => {
    const { data, nextCursor, total } =
      await this.SnippetService.getUserSnippets(req.context, {
        ...req.params,
        ...req.query,
      });
    const isCurrentUserOwner = req.context.user.name === req.params.name;
    let dataToReturn:
      | GetUserSnippetsResponseDtoType
      | GetPublicUserSnippetsResDtoType;
    if (isCurrentUserOwner) {
      const { success, data: parsedData } =
        GetUserSnippetsResponseDto.safeParse(data);
      if (!success) {
        throw new InternalServerError();
      }
      dataToReturn = parsedData;
    } else {
      const { success, data: parsedData } =
        GetPublicUserSnippetsResDto.safeParse(data);
      if (!success) {
        throw new InternalServerError();
      }
      dataToReturn = parsedData;
    }
    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      data: dataToReturn,
      nextCursor,
      total,
    });
  };

  public getUserFriendsSnippets = async (
    req: Request<
      Pick<GetUserSnippetsDtoType, "name">,
      {},
      {},
      Omit<GetUserSnippetsDtoType, "name">
    >,
    res: Response
  ) => {
    const { data, nextCursor, total } =
      await this.SnippetService.getUserFriendsSnippets(req.context, {
        ...req.params,
        ...req.query,
      });
    const { success, data: parsedData } =
      GetPublicUserSnippetsResDto.safeParse(data);
    if (!success) {
      throw new InternalServerError();
    }
    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      data: parsedData,
      nextCursor,
      total,
    });
  };

  public getSnippet = async (
    req: Request<GetSnippetDtoType>,
    res: Response
  ) => {
    const data = await this.SnippetService.findOne(req.context, req.params);
    const isCurrentUserOwner =
      req.context?.user?.id === data.owner._id.toString();

    let dataToReturn: any;
    if (isCurrentUserOwner) {
      const { success, data: parsedData } = GetSnippetResDto.safeParse(data);
      if (!success) {
        throw new InternalServerError();
      }
      dataToReturn = parsedData;
    } else {
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
  };
}
