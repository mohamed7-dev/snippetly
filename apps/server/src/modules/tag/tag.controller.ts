import type { Request, Response } from "express";
import { TagService } from "./tag.service";
import { StatusCodes } from "http-status-codes";
import { InternalServerError } from "../../common/lib/exception";
import { GetPopularTagsResDto } from "@snippetly/common/dto";

export class TagController {
  private readonly TagService: TagService;

  constructor() {
    this.TagService = new TagService();
  }

  public getPopularTags = async (_req: Request, res: Response) => {
    const result = await this.TagService.getPopularTags();
    const rawResponse = {
      type: "success",
      message: "Fetched successfully.",
      data: result,
      status: StatusCodes.OK,
    };
    const { success, data: parsedData } =
      GetPopularTagsResDto.safeParse(rawResponse);

    if (!success) {
      throw new InternalServerError();
    }
    res.status(parsedData.status).json(parsedData);
  };
}
