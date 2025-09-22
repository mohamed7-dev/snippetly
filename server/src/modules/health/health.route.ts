import { Router } from "express";
import type { Route } from "../../common/types/express.ts";
import { HealthController } from "./health.controller.ts";

export class HealthRoute implements Route {
  public path: string = "/health";
  public router: Router = Router();
  public controller: HealthController = new HealthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, this.controller.check);
  }
}
