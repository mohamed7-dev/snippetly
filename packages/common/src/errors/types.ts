/**
 * @description
 * Any error that implements this interface can be serialized to a Zod schema.
 */
export interface Schemable {
    defineSchema(): string;
}

export enum LogLevel {
    error = 0,
    warn = 1,
    info = 2,
    verbose = 3,
    debug = 4,
}
