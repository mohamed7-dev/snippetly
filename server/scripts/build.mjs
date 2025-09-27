import { build } from 'esbuild';

// Bundle server entry points into Node-compatible ESM output.
// This avoids Node errors with extensionless imports or .ts extensions.
// Adjust entryPoints as needed for any additional directly-executed scripts.
const entryPoints = ['src/index.ts', 'src/vercel.ts'];

// Optionally include seed script if it exists
import { access } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
await access('src/common/db/seed.ts', fsConstants.F_OK).then(
  () => entryPoints.push('src/common/db/seed.ts'),
  () => {}
);

const externalBuiltins = [
  'assert','buffer','child_process','cluster','console','constants','crypto','dgram','diagnostics_channel','dns','domain','events','fs','http','http2','https','inspector','module','net','os','path','perf_hooks','process','punycode','querystring','readline','repl','stream','string_decoder','sys','timers','tls','tty','url','util','v8','vm','worker_threads','zlib'
];

async function run() {
  try {
    // Externalize all project dependencies to keep the bundle small and rely on node_modules at runtime.
    // This is the common pattern for Node servers.
    const pkgPath = fileURLToPath(new URL('../package.json', import.meta.url));
    const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
    const deps = Object.keys({ ...(pkg.dependencies || {}), ...(pkg.peerDependencies || {}) });
    await build({
      entryPoints,
      outdir: 'dist',
      platform: 'node',
      format: 'esm',
      target: 'node20',
      bundle: true,
      sourcemap: true,
      // Place each entry at dist root as [name].js (e.g., index.js, seed.js)
      entryNames: '[name]',
      // Keep node built-ins and all package dependencies external.
      external: [...externalBuiltins, ...deps],
      // Define NODE_ENV at build time for potential dead-code elimination
      define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      },
      logLevel: 'info',
    });
    console.log('\n✔ esbuild completed successfully');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
