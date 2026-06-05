import { Request } from 'express';

export type ApiType = 'admin' | 'developer';

export function getApiType(req: Request): ApiType {
    const segments = req.path.split('/').filter(Boolean);
    const apiTypeSegment = segments[0];
    return apiTypeSegment === 'admin' ? 'admin' : 'developer';
}
