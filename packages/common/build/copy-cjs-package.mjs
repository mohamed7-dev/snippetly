import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const cjsDirectory = path.resolve(scriptDirectory, '../dist/cjs');

await mkdir(cjsDirectory, { recursive: true });
await copyFile(path.join(scriptDirectory, 'cjs-package.json'), path.join(cjsDirectory, 'package.json'));
