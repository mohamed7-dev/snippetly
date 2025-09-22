import { Router } from "express";
import { HealthController } from "./health.controller.js";
export class HealthRoute {
    path = "/health";
    router = Router();
    controller = new HealthController();
    constructor(){
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(this.path, this.controller.check);
    }
}
