/**
 * @description
 * Returns the filename of the caller at the requested stack depth.
 *
 * This uses V8's `Error.prepareStackTrace` API.
 *
 * Normally:
 *
 *     new Error().stack
 *
 * produces a formatted string such as:
 *
 *     Error
 *         at foo (/package/foo.ts:10:5)
 *         at bar (/package/bar.ts:20:3)
 *
 * By temporarily overriding `Error.prepareStackTrace`, we can make
 * V8 give us the underlying CallSite objects instead.
 *
 * CallSite objects provide methods such as:
 *
 *     getFileName()
 *     getFunctionName()
 *     getLineNumber()
 *     getColumnNumber()
 *
 * We specifically use `getFileName()` to discover which source file
 * called our test configuration helper.
 *
 * @param depth
 * Number of application-level frames to skip before finding the
 * desired caller.
 */
export function getCallerFilename(depth: number): string {
    // Keep the existing Error.prepareStackTrace implementation so
    // that we can restore it after capturing the stack.
    const previousPrepareStackTrace = Error.prepareStackTrace;

    // Tell V8 to return the raw CallSite objects instead of converting
    // the stack into a human-readable string.
    Error.prepareStackTrace = (_error, stack) => {
        // Restore the original implementation as soon as V8 has
        // produced the stack. This avoids permanently changing the
        // global Error behavior.
        Error.prepareStackTrace = previousPrepareStackTrace;

        return stack;
    };

    // Create an Error only to capture the current call stack.
    //
    // We don't throw this error.
    //
    // Because Error.prepareStackTrace was overridden above, `.stack`
    // contains CallSite objects rather than a string.
    let stack = new Error().stack as unknown as NodeJS.CallSite[];

    /*
     * The beginning of the stack contains this helper itself and
     * the functions that called it.
     *
     * `depth + 1` accounts for the current stack frame in addition
     * to the requested depth.
     *
     * For example, the stack may conceptually look like:
     *
     *   0 → getCallerFilename()
     *   1 → getTestFileIndex()
     *   2 → testConfig()
     *   3 → auth.spec.ts
     *
     * With depth = 2:
     *
     *   stack.slice(2 + 1)
     *
     * starts looking at `auth.spec.ts`.
     */
    stack = stack.slice(depth + 1);

    let filename: string | null = null;

    /*
     * Walk through the remaining stack frames until we find a frame
     * whose filename is not Node's module loader (`module.js`).
     *
     * `shift()` removes and returns the first frame.
     */
    do {
        const frame = stack.shift();

        // `getFileName()` returns the source file associated with
        // this stack frame.
        filename = frame?.getFileName() ?? null;
    } while (stack.length > 0 && filename === 'module.js');

    // Preserve the original behavior: return the discovered filename.
    return filename as string;
}
