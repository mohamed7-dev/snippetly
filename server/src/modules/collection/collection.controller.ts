import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CollectionService } from "./collection.service";
import { CreateCollectionDtoType } from "./dto/create-collection.dto";
import { UpdateCollectionDtoType } from "./dto/update-collection.dto";

export class CollectionController {
  private readonly CollectionService: CollectionService;

  constructor() {
    this.CollectionService = new CollectionService();
  }

  public create = async (
    request: Request<{}, {}, CreateCollectionDtoType>,
    response: Response
  ) => {
    const newCollection = await this.CollectionService.create({
      ...request.body,
      userId: request.user.id,
    });
    response.status(StatusCodes.CREATED).json({
      message: "Collection has been created successfully.",
      data: newCollection,
    });
  };

  public update = async (
    request: Request<
      { code: string },
      {},
      Omit<UpdateCollectionDtoType, "code">
    >,
    response: Response
  ) => {
    const { code } = request.params;
    const updatedCollection = await this.CollectionService.update({
      data: request.body.data,
      code,
      userId: request.user.id,
    });
    response.status(StatusCodes.OK).json({
      message: "Collection has been update successfully.",
      data: updatedCollection,
    });
  };

  public delete = async (
    request: Request<{ code: string }>,
    response: Response
  ) => {
    const { code } = request.params;
    await this.CollectionService.delete({
      code,
      userId: request.user.id,
    });
    response.status(StatusCodes.OK).json({
      message: "Collection has been deleted successfully.",
      data: null,
    });
  };
}
