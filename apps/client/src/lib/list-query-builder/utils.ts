import z from 'zod';

const Wrappers = new Set(['optional', 'nullable', 'default', 'prefault', 'nonoptional', 'readonly', 'catch']);

type AnyDef = { type: string; [K: string]: any };

export function defOf(schema: z.ZodType): AnyDef {
    return schema.def;
}

export function inner(schema: z.ZodType): z.ZodType | undefined {
    const def = defOf(schema);
    if (Wrappers.has(def.type)) return def.innerType;
    if (def.type === 'lazy') return def.getter();

    return undefined;
}

export function unwrap(schema: z.ZodType): z.ZodType {
    let s = schema;
    let next: z.ZodType | undefined;
    while ((next = inner(s))) s = next;
    return s;
}

export function shapeOf(schema: z.ZodType, what: string): Record<string, z.ZodType> {
    const unwrappedSchema = unwrap(schema);
    if (defOf(unwrappedSchema).type !== 'object') throw new Error(`${what} must be a z.object`);
    return (unwrappedSchema as z.ZodObject).shape as Record<string, z.ZodType>;
}

export function humanize(name: string): string {
    const spaced = name
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

/**
 * @description
 *  Collect metadata across wrapper layers; outer layers win.
 */
export function collectMetadata<Output>(schema: z.ZodType): Output {
    let result: Record<string, unknown> = {};
    let s: z.ZodType | undefined = schema;
    while (s) {
        const metadata = z.globalRegistry.get(s);
        if (metadata) result = { ...metadata, ...result };
        s = inner(s);
    }
    return result as Output;
}

export const isPlainObject = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null && !Array.isArray(v);

export function deepEqual(a: unknown, b: unknown): boolean {
    if (Object.is(a, b)) return true;
    if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    return ka.every(k => k in b && deepEqual((a as any)[k], (b as any)[k]));
}
