import { Request, Response } from "express";
import { TagService } from "./tag.service";
import { StatusCodes } from "http-status-codes";

export class TagController {
  private readonly TagService: TagService;

  constructor() {
    this.TagService = new TagService();
  }

  public getPopularTags = async (_req: Request, res: Response) => {
    const tags = await this.TagService.getPopularTags();
    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      data: tags,
    });
  };
}
