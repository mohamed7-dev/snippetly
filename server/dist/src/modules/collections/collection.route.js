import { Router } from "express";
import { zodValidatorMiddleware } from "../../common/middlewares/zod-validator.middleware.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { CollectionController } from "./collection.controller.js";
import { CreateCollectionDto } from "./dto/create-collection.dto.js";
import { DiscoverCollectionsDto } from "./dto/find-collection.dto.js";
import { FindCollectionDto } from "./dto/find-collection.dto.js";
import { FindCollectionsDto } from "./dto/find-collection.dto.js";
import { DeleteCollectionDto } from "./dto/delete-collection.dto.js";
import { UpdateCollectionDto } from "./dto/update-collection.dto.js";
import { ForkCollectionDto } from "./dto/fork-collection.dto.js";
export class CollectionRoute {
    path = "/collections";
    router = Router();
    controller = new CollectionController();
    constructor(){
        this.initializeRoutes();
    }
    initializeRoutes() {
        // --- create ---
        this.router.post(`${this.path}`, authMiddleware, zodValidatorMiddleware(CreateCollectionDto, "Body"), this.controller.create);
        // --- static GET routes ---
        this.router.get(`${this.path}/discover`, zodValidatorMiddleware(DiscoverCollectionsDto, "Query"), this.controller.discover);
        this.router.get(`${this.path}/current`, authMiddleware, zodValidatorMiddleware(FindCollectionsDto.omit({
            creatorName: true
        }), "Query"), this.controller.getCurrentUserCollections);
        // --- user collections (more specific than :slug) ---
        this.router.get(`${this.path}/user/:creatorName`, zodValidatorMiddleware(FindCollectionsDto.omit({
            creatorName: true
        }), "Query"), zodValidatorMiddleware(FindCollectionsDto.pick({
            creatorName: true
        }), "Params"), this.controller.getUserCollections);
        // --- fork (longer param path, must be before :slug) ---
        this.router.put(`${this.path}/:slug/fork`, authMiddleware, zodValidatorMiddleware(ForkCollectionDto, "Params"), this.controller.fork);
        // --- update/delete by slug ---
        this.router.put(`${this.path}/:slug`, authMiddleware, zodValidatorMiddleware(UpdateCollectionDto.pick({
            slug: true
        }), "Params"), zodValidatorMiddleware(UpdateCollectionDto.shape.data, "Body"), this.controller.update);
        this.router.delete(`${this.path}/:slug`, authMiddleware, zodValidatorMiddleware(DeleteCollectionDto, "Params"), this.controller.delete);
        // --- get single collection (catch-all, must be last) ---
        this.router.get(`${this.path}/:slug`, zodValidatorMiddleware(FindCollectionDto, "Params"), this.controller.getCollection);
    }
}
