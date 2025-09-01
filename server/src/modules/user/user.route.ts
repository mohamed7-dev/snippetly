import { Router } from "express";
import { Route } from "../../common/lib/types";
import { UserController } from "./user.controller";

export class UserRoute implements Route {
  public path: string = "/test";
  public router: Router = Router();
  public controller: UserController = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, this.controller.getHello);
  }
}
