import { getCallerFilename } from '@snippetly/testing';
import fs from 'node:fs';
import path from 'node:path';

export function isTestRunningInCIEnv() {
    return process.env.CI === 'true' ? true : false;
}

export function getE2ETestDatabase() {
    return process.env.E2E_DB ?? 'sqljs';
}

export function getE2ETestPostgresPort(): number | undefined {
    return process.env.E2E_POSTGRES_PORT ? +process.env.E2E_POSTGRES_PORT : undefined;
}

export function getE2ETestSetupTimeout() {
    // the setup timeout is relatively long on purpose to give sqlite
    // the chance in the CI env to generate the db

    // for local debugging: 1800s
    // otherwise: 12s
    return process.env.E2E_DEBUG ? 1800 * 1000 : 120000;
}

export function getE2ETestTimeout() {
    // for local debugging: 1800s
    // in CI env: 30s
    // if not local debugging, or CI env: 15ms

    return process.env.E2E_DEBUG ? 1800 * 1000 : isTestRunningInCIEnv() ? 30 * 1000 : 15 * 1000;
}

/**
 * @description
 * Finds the position of the current test file in its parent directory.
 *
 * For example, if the directory contains:
 *
 *   [
 *       'auth.spec.ts',
 *       'snippets.spec.ts',
 *       'collections.spec.ts',
 *   ]
 *
 * and `collections.spec.ts` is the file calling `testConfig()`,
 * its index is 2, so it gets port 3012.
 */
export function getTestFileIndex(): number {
    // `getCallerFilename(2)` walks up the call stack far enough
    // to reach the actual test file that ultimately called testConfig().
    //
    // The call chain is approximately:
    //
    //   test file
    //       ↓
    //   testConfig()
    //       ↓
    //   getTestFileIndex()
    //       ↓
    //   getCallerFilename()
    //
    // Therefore depth=2 skips the helper functions and identifies
    // the test file.
    const testFilePath = getCallerFilename(2);

    // Extract the directory containing the test file.
    const testDirectory = path.dirname(testFilePath);

    // Read every entry in that directory.
    const files = fs.readdirSync(testDirectory);

    // Extract only the filename from the full path.
    //
    // Example:
    //   /project/tests/collections.spec.ts
    //          ↓
    //   collections.spec.ts
    const testFileName = path.basename(testFilePath);

    // Find where this test file appears in the directory listing.
    //
    // Example:
    //   ['auth.spec.ts', 'snippets.spec.ts', 'collections.spec.ts']
    //                                      ↑
    //                                    index 2
    return files.indexOf(testFileName);
}
