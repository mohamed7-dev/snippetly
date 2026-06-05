import { Router } from 'express';
import { AppRouter } from '../common/types/app-router.interface';
import { Controller } from '../infra/ioc-container/controller.decorator';
import { AuthService } from './auth.service';

@Controller({
    path: 'auth',
})
export class AuthController implements AppRouter {
    constructor(private readonly authService: AuthService) {}

    initRoutes(router: Router): Router {
        router.post('/login', (req, res) => {
            res.sendStatus(200);
        });
        return router;
    }
}
