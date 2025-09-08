import { Request, Response } from "express";
import { FolderService } from "./folder.service";
import { CreateFolderDtoType } from "./dto/create-folder.dto";
import { UpdateFolderDtoType } from "./dto/update-folder.dto";
import { DeleteFolderDtoType } from "./dto/delete-folder.dto";
import { FindFolderDtoType, FindFoldersDtoType } from "./dto/find-folder.dto";
import {
  CreateFolderResDto,
  FindFolderResDto,
  FindFoldersResponseDto,
  FindPublicFolderResDto,
  FindPublicFoldersResponseDto,
  UpdateFolderResDto,
} from "./dto/response.dto";
import { StatusCodes } from "http-status-codes";
import { InternalServerError } from "../../common/lib/exception";
import { ForkFolderDtoType } from "./dto/fork-folder.dto";

export class FolderController {
  private readonly FolderService: FolderService;

  constructor() {
    this.FolderService = new FolderService();
  }

  public create = async (
    request: Request<{}, {}, CreateFolderDtoType>,
    response: Response
  ) => {
    const newFolder = await this.FolderService.create(
      request.context,
      request.body
    );
    const { success, data: parsedData } =
      CreateFolderResDto.safeParse(newFolder);
    if (!success) {
      throw new InternalServerError();
    }
    response.status(StatusCodes.CREATED).json({
      message: "Folder has been created successfully.",
      data: parsedData,
    });
  };

  public update = async (
    request: Request<
      Pick<UpdateFolderDtoType, "code">,
      {},
      UpdateFolderDtoType["data"]
    >,
    response: Response
  ) => {
    const updatedFolder = await this.FolderService.update(request.context, {
      data: request.body,
      code: request.params.code,
    });
    const { success, data: parsedData } =
      UpdateFolderResDto.safeParse(updatedFolder);
    if (!success) {
      throw new InternalServerError();
    }
    response.status(StatusCodes.OK).json({
      message: "Folder has been updated successfully.",
      data: parsedData,
    });
  };

  public fork = async (
    request: Request<ForkFolderDtoType>,
    response: Response
  ) => {
    const forkedFolder = await this.FolderService.fork(
      request.context,
      request.params
    );
    const { success, data: parsedData } =
      CreateFolderResDto.safeParse(forkedFolder);
    if (!success) {
      throw new InternalServerError();
    }

    response.status(StatusCodes.CREATED).json({
      message: "Folder has been forked successfully.",
      data: parsedData,
    });
  };

  public delete = async (
    request: Request<DeleteFolderDtoType>,
    response: Response
  ) => {
    await this.FolderService.delete(request.context, request.params);
    response.status(StatusCodes.OK).json({
      message: "Folder has been deleted successfully",
      data: null,
    });
  };

  public findCurrentUserFolders = async (
    request: Request<
      {},
      {},
      {},
      Pick<FindFoldersDtoType, "limit" | "query" | "cursor">
    >,
    response: Response
  ) => {
    const { data, nextCursor } =
      await this.FolderService.findCurrentUserFolders(
        request.context,
        request.query
      );

    const { success, data: parsedData } =
      FindFoldersResponseDto.safeParse(data);

    if (!success) {
      throw new InternalServerError();
    }

    response.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      data: parsedData,
      nextCursor,
    });
  };

  public findFolders = async (
    request: Request<{}, {}, {}, FindFoldersDtoType>,
    response: Response
  ) => {
    const { data, nextCursor } = await this.FolderService.find(
      request.context,
      request.query
    );
    const isCurrentUserOwner =
      request.context?.user?.name === request.query.owner;

    let dataToReturn: any;
    if (isCurrentUserOwner) {
      const { success, data: parsedData } =
        FindFoldersResponseDto.safeParse(data);
      if (!success) {
        throw new InternalServerError();
      }
      dataToReturn = parsedData;
    } else {
      const { success, data: parsedData } =
        FindPublicFoldersResponseDto.safeParse(data);
      if (!success) {
        throw new InternalServerError();
      }
      dataToReturn = parsedData;
    }

    response.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      data: dataToReturn,
      nextCursor,
    });
  };

  public findFolder = async (
    request: Request<FindFolderDtoType>,
    response: Response
  ) => {
    const data = await this.FolderService.findOne(
      request.context,
      request.params
    );
    const isCurrentUserOwner =
      request.context?.user?.id === data.owner._id.toString();

    let dataToReturn: any;
    if (isCurrentUserOwner) {
      const { success, data: parsedData } = FindFolderResDto.safeParse(data);
      if (!success) {
        throw new InternalServerError();
      }
      dataToReturn = parsedData;
    } else {
      const { success, data: parsedData } =
        FindPublicFolderResDto.safeParse(data);
      if (!success) {
        throw new InternalServerError();
      }
      dataToReturn = parsedData;
    }

    response.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      data: dataToReturn,
    });
  };
}
