import { Request, Response } from "express";
import { CreateSnippetDtoType } from "./dto/create-snippet.dto";
import { SnippetService } from "./snippet.service";
import { UpdateSnippetDtoType } from "./dto/update-snippet.dto";
import { DeleteSnippetDtoType } from "./dto/delete-snippet.dto";
import { GetUserSnippetsDtoType } from "./dto/get-user-snippets.dto";

export class SnippetController {
  private readonly SnippetService: SnippetService;

  constructor() {
    this.SnippetService = new SnippetService();
  }

  public create = async (
    req: Request<{}, {}, CreateSnippetDtoType>,
    res: Response
  ) => {
    const { data, message, status } = await this.SnippetService.create(req);

    res.status(status).json({
      message,
      data,
    });
  };

  public update = async (
    req: Request<
      { slug: UpdateSnippetDtoType["slug"] },
      {},
      UpdateSnippetDtoType["data"]
    >,
    res: Response
  ) => {
    const { data, status, message } = await this.SnippetService.update(req);

    res.status(status).json({
      message,
      data,
    });
  };

  public delete = async (
    req: Request<{ slug: DeleteSnippetDtoType["slug"] }>,
    res: Response
  ) => {
    const { message, status } = await this.SnippetService.delete(req);

    res.status(status).json({
      message,
      data: null,
    });
  };

  public getUserSnippets = async (
    req: Request<{ name: GetUserSnippetsDtoType["name"] }>,
    res: Response
  ) => {
    const { data, message, status } = await this.SnippetService.getUserSnippets(
      req
    );
    res.status(status).json({
      message,
      data,
    });
  };

  public getUserFriendsSnippets = async (
    req: Request<{ name: GetUserSnippetsDtoType["name"] }>,
    res: Response
  ) => {
    const { data, message, status } =
      await this.SnippetService.getUserFriendsSnippets(req);
    res.status(status).json({
      message,
      data,
    });
  };
}
