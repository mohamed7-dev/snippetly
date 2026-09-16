// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export interface ClassType<T> extends Function {
    new (...args: any[]): T;
}
