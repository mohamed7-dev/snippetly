import path from 'path';
import { defineConfig } from 'vitest/config';
import { getE2ETestTimeout } from './e2e-common-utils.js';

export default defineConfig({
    test: {
        include: ['**/*.e2e-spec.ts'],
        testTimeout: getE2ETestTimeout(),
        typecheck: {
            tsconfig: path.join(__dirname, 'tsconfig.e2e.json'),
        },
    },
});
