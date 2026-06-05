import { Scope } from './types';

export const INJECTABLE_DECORATOR_METADATA_KEY = Symbol('INJECTABLE_DECORATOR_METADATA');

export interface InjectableMeta {
    scope?: Scope;
}

export function Injectable(options?: InjectableMeta): ClassDecorator {
    return (target: Function) => {
        Reflect.defineMetadata(
            INJECTABLE_DECORATOR_METADATA_KEY,
            { ...options, scope: options?.scope ?? 'singleton' },
            target,
        );
    };
}
