export function race<T>(maybeSlow: Promise<T> | T, delay: number): Promise<T | undefined> {
    return Promise.race([
        new Promise<undefined>(resolve => setTimeout(() => resolve(undefined), delay)),
        maybeSlow,
    ]);
}
