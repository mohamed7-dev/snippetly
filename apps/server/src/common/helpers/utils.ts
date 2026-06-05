export const prototypeObjectPropNames = ['constructor', '__proto__', 'prototype'];
/**
 * @description
 * A utility function to assign a value to an object using `Object.defineProperty()` method.
 *
 * @remarks
 * - It doesn't copy prototype related properties.
 */
export function assignPropToObject(object: any, key: string, value: unknown) {
    if (prototypeObjectPropNames.includes(key)) return;
    Object.defineProperty(object, key, {
        value,
        writable: true,
        enumerable: true,
        configurable: true,
    });
}

export function isDevelopment() {
    return process.env.NODE_ENV === 'development';
}

export function isProduction() {
    return process.env.NODE_ENV === 'production';
}
