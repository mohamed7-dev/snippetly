import { isConstructorInstance, isObject } from '@snippetly/common/lib';
import { OBJECT_PROTOTYPE_KEYS } from '../common/constants/common';
import { simpleDeepClone } from '../common/helpers/simple-deep-clone';
import { assignToObject } from '../common/helpers/utils';
import { PartialAppConfig, RuntimeAppConfig } from './app-config.interface';

export function mergeConfig<Target extends RuntimeAppConfig>(
    src: PartialAppConfig,
    dest: Target,
    depth: number = 0,
): Target {
    if (!src) return dest;

    if (depth === 0) {
        // clone dest to keep original dest object un-mutated
        dest = simpleDeepClone(dest);
    }

    if (isObject(src) && isObject(dest)) {
        for (const key in src) {
            if (OBJECT_PROTOTYPE_KEYS.includes(key)) {
                continue;
            }
            const srcTypedKey = key as keyof typeof src;
            const srcValue = src[srcTypedKey];
            if (isObject(srcValue)) {
                // object has three possibilities:
                // 1. class constructor
                // 2. plain object
                // 3. value exists in src, but not in dest
                const destValue = dest[srcTypedKey];
                if (!destValue) {
                    // value doesn't exist in dest -> init
                    assignToObject(dest, srcTypedKey, {});
                }
                if (isConstructorInstance(srcValue)) {
                    // constructor -> assign directly to dest
                    assignToObject(dest, srcTypedKey, srcValue);
                } else {
                    // plain object -> run recursively
                    mergeConfig(
                        srcValue as unknown as PartialAppConfig,
                        dest[srcTypedKey] as unknown as RuntimeAppConfig,
                        depth + 1,
                    );
                }
            } else {
                // primitive -> assign directly to dest
                assignToObject(dest, srcTypedKey, srcValue);
            }
        }
    }

    return dest;
}
