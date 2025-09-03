import { Request, Response } from "express";
import { CreateSnippetDtoType } from "./dto/create-snippet.dto";
import { SnippetService } from "./snippet.service";
import { StatusCodes } from "http-status-codes";
import { UpdateSnippetDtoType } from "./dto/update-snippet.dto";

export class SnippetController {
  private readonly SnippetService: SnippetService;

  constructor() {
    this.SnippetService = new SnippetService();
  }

  public create = async (
    req: Request<{}, {}, CreateSnippetDtoType>,
    res: Response
  ) => {
    const newSnippet = await this.SnippetService.create({
      ...req.body,
      userId: req.user.id,
    });

    res.status(StatusCodes.CREATED).json({
      message: "Snippet has been created successfully.",
      data: newSnippet,
    });
  };

  public update = async (
    req: Request<{ slug: string }, {}, Omit<UpdateSnippetDtoType, "slug">>,
    res: Response
  ) => {
    const updatedSnippet = await this.SnippetService.update({
      ...req.body,
      slug: req.params.slug,
      userId: req.user.id,
    });

    res.status(StatusCodes.OK).json({
      message: "Snippet has been updated successfully.",
      data: updatedSnippet,
    });
  };

  public delete = async (req: Request<{ slug: string }>, res: Response) => {
    await this.SnippetService.delete({
      slug: req.params.slug,
      userId: req.user.id,
    });

    res.status(StatusCodes.OK).json({
      message: "Snippet has been deleted successfully.",
      data: null,
    });
  };

  public getUserSnippets = async (
    req: Request<{ name: string }>,
    res: Response
  ) => {
    const snippets = await this.SnippetService.getUserSnippets({
      name: req.params.name,
    });

    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      data: snippets,
    });
  };

  public getUserFriendsSnippets = async (
    req: Request<{ name: string }>,
    res: Response
  ) => {
    const snippets = await this.SnippetService.getUserFriendsSnippets({
      name: req.params.name,
    });

    res.status(StatusCodes.OK).json({
      message: "Fetched successfully.",
      data: snippets,
    });
  };
}
