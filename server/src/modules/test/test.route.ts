import { Router } from "express";
import { Route } from "../../common/lib/types";
import { TestController } from "./test.controller";

export class TestRoute implements Route {
  public path: string = "/test";
  public router: Router = Router();
  public controller: TestController = new TestController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, this.controller.getHello);
  }
}
