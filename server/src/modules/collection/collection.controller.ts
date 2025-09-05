import { Request, Response } from "express";
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
    const { data, message, status } = await this.CollectionService.create(
      request
    );
    response.status(status).json({
      message,
      data,
    });
  };

  public update = async (
    request: Request<{ code: string }, {}, UpdateCollectionDtoType["data"]>,
    response: Response
  ) => {
    const { data, message, status } = await this.CollectionService.update(
      request
    );
    response.status(status).json({
      message,
      data,
    });
  };

  public delete = async (
    request: Request<{ code: string }>,
    response: Response
  ) => {
    const { message, status } = await this.CollectionService.delete(request);
    response.status(status).json({
      message,
      data: null,
    });
  };
}
