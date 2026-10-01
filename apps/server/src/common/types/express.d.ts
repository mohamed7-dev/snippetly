import { RequestContext } from '../../api/request-context/request-context';

declare global {
    namespace Express {
        export interface Request {
            getRequestContext(): RequestContext;
        }
    }
}

export {};
