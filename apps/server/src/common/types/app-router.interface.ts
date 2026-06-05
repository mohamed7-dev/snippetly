import { Router } from 'express';

export interface AppRouter {
    initRoutes(router: Router): Router;
}
