import type { Express, Router } from 'express';
import { iocContainer } from '../../infra/ioc-container/ioc-container';
import { Logger } from '../../infra/logger/logger';

type Layer = {
    name?: string;
    regexp?: RegExp;
    keys?: Array<{ name: string }>;

    route?: {
        path: string;
        methods: Record<string, boolean>;
    };

    handle?: {
        stack?: Layer[];
    };
};

export function logExpressRoutes(app: Express | Router) {
    const stack = (app as any).router.stack;
    const visited = new Set<string>();
    walk(stack, '');

    // Also log routes collected by the IoC container (mounted controllers)
    try {
        const mounted = (iocContainer as any).getMountedRoutes?.() || [];
        for (const m of mounted) {
            const routePath = normalizePath(m.basePath || '');
            // Since methods are not available here, log as generic POST/GET placeholders
            if (!visited.has(`MOUNT:${routePath}`)) {
                visited.add(`MOUNT:${routePath}`);
                Logger.debug(`MOUNTED      ${routePath}`);
            }
        }
    } catch {
        // ignore
    }

    function walk(layers: Layer[], parentPath: string) {
        for (const layer of layers) {
            // Route endpoint
            if (layer.route) {
                const routePath = normalizePath(`${parentPath}/${layer.route.path}`);

                for (const method of Object.keys(layer.route.methods)) {
                    const signature = `${method}:${routePath}`;

                    if (visited.has(signature)) {
                        continue;
                    }

                    visited.add(signature);

                    Logger.info(`${method.toUpperCase().padEnd(7)} ${routePath}`);
                }

                continue;
            }

            // Mounted router (treat any handler with a `.stack` as a router)
            if (layer.handle?.stack) {
                const mountPath = extractMountPath(layer) || (layer.handle as any).__mountedBasePath || '';

                walk(layer.handle.stack, normalizePath(`${parentPath}/${mountPath}`));
            }
        }
    }
}

function normalizePath(path: string): string {
    const normalized = '/' + path.replace(/\/+/g, '/').replace(/^\/|\/$/g, '');

    return normalized === '/' ? normalized : normalized.replace(/\/$/, '');
}

/**
 * Converts express router regexp into a path.
 *
 * Examples:
 * /^\/auth\/?(?=\/|$)/i     -> auth
 * /^\/api\/v1\/?(?=\/|$)/i  -> api/v1
 */
function extractMountPath(layer: Layer): string {
    if (!layer.regexp) {
        return '';
    }

    let source = layer.regexp.source;

    // Remove express-specific suffix used for optional trailing slash
    source = source.replace('\\/?(?=\\\/|$)', '');

    // Convert escaped slashes to normal slashes
    source = source.replace(/\\\//g, '/');

    // Remove non-capturing group markers so patterns like (?:v1) become v1
    source = source.replace(/\(\?:/g, '');

    // Remove remaining regex group parentheses
    source = source.replace(/\)/g, '');

    // Trim anchors and leading/trailing slashes
    source = source.replace(/^\^/, '').replace(/\$$/, '').replace(/^\//, '').replace(/\/$/, '');

    return source;
}
