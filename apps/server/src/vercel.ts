import type { Request, Response } from 'express';
import { appConfig } from './app-config.js';
import { bootstrap } from './bootstrap.js';

let applicationPromise: ReturnType<typeof bootstrap> | undefined;

const handler = async (request: Request, response: Response) => {
    applicationPromise ??= bootstrap(appConfig, { listen: false });
    const application = await applicationPromise;
    return application.expressApp(request, response);
};

export = handler;
