import type { Request, Response } from "express";
import { TagService } from "./tag.service";
import { StatusCodes } from "http-status-codes";
import { GetPopularTagsResDto } from "./dto/response.dto";
import { InternalServerError } from "../../common/lib/exception";

export class TagController {
  private readonly TagService: TagService;

  constructor() {
    this.TagService = new TagService();
  }

  public getPopularTags = async (_req: Request, res: Response) => {
    const tags = await this.TagService.getPopularTags();
    const { success, data: parsedData } = GetPopularTagsResDto.safeParse(tags);
    if (!success) {
      throw new InternalServerError();
    }
    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      data: parsedData,
    });
  };
}
