/**
 * @description
 * A simple utility that checks if the target is an object.
 *
 * @remarks
 * - It excludes arrays.
 */
export function isObject(target: unknown): target is object {
    return (target && typeof target === 'object' && !Array.isArray(target)) as boolean;
}

/**
 * @description
 * A simple utility that checks if the target is an instance of a constructor.
 */
export function isConstructorInstance(target: unknown) {
    return isObject(target) && target.constructor && target.constructor.name !== 'Object';
}

/**
 * @description
 * A simple utility that checks if the target is an instance of the File constructor.
 */
export function isFileObject(input: any): boolean {
    if (typeof File === 'undefined') {
        return false;
    } else {
        return input instanceof File;
    }
}

/**
 * @description
 * A simple utility that excludes undefined and nullish values from an input
 */
export function notNullOrUndefined<T>(input: T | undefined | null): input is T {
    return input !== undefined && input !== null;
}

/**
 * @description
 * This utility transforms a given input object into a URLSearchParams
 */
export function transformInputToSearchParams(input: Record<string, unknown>): URLSearchParams {
    const searchParams = new URLSearchParams();

    Object.entries(input).forEach(([key, value]) => {
        if (key === 'filter' || key === 'sort') {
            searchParams.set(key, JSON.stringify(value));
        } else {
            searchParams.set(key, `${value as string | number}`);
        }
    });

    return searchParams;
}
