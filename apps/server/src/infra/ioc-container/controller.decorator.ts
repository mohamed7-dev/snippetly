export const CONTROLLER_DECORATOR_METADATA_KEY = Symbol('CONTROLLER_DECORATOR_METADATA');

export interface ControllerMeta {
    path?: string;
    version?: number;
}
export function Controller(meta: ControllerMeta = {}): ClassDecorator {
    return (target: Function) => {
        Reflect.defineMetadata(CONTROLLER_DECORATOR_METADATA_KEY, meta, target);
    };
}
