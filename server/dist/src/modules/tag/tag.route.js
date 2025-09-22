import { Router } from "express";
import { TagController } from "./tag.controller.js";
export class TagRoute {
    basePath = "/tags";
    router = Router();
    TagController = new TagController();
    constructor(){
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`${this.basePath}/popular`, this.TagController.getPopularTags);
    }
}
