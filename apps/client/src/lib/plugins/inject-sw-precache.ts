import { resolve } from 'node:path'
import { transformWithEsbuild, type Plugin } from 'vite'

/**
 * @description
 * Custom plugin: inject precache manifest into service worker and emit sw.js
 */
export function injectSWPrecache() {
  const placeholderBare = '__PRECACHE_MANIFEST__'
  const placeholderSingle = `'__PRECACHE_MANIFEST__'`
  const placeholderDouble = '"__PRECACHE_MANIFEST__"'
  return {
    name: 'inject-sw-precache',
    apply: 'build',
    async generateBundle(_options, bundle) {
      // Collect all emitted asset and chunk paths for precaching
      const urls = new Set<string>()
      for (const [, output] of Object.entries(bundle)) {
        if (output.type === 'asset' || output.type === 'chunk') {
          const file = `/${output.fileName}`
          urls.add(file)
        }
      }

      // Optionally include common shell assets
      const extra = [
        '/',
        '/index.html',
        '/offline.html',
        '/favicon.svg',
        '/favicon.ico',
        '/masked-icon.svg',
        '/robots.txt',
        '/manifest.webmanifest',
      ]
      extra.forEach((u) => urls.add(u))

      // Read the TS service worker source
      const swSourcePath = resolve(process.cwd(), './src/lib/sw/sw.ts')
      const fs = await import('node:fs/promises')
      const tsSource = await fs.readFile(swSourcePath, 'utf8')

      // Transpile TS -> JS using Vite's built-in esbuild first
      const transformed = await transformWithEsbuild(tsSource, swSourcePath, {
        loader: 'ts',
        target: 'es2018',
        format: 'esm',
        minify: true,
      })

      // Now inject into the generated JS code by replacing the quoted placeholder
      const manifestJsonArray = JSON.stringify(Array.from(urls))
      const manifestStringLiteral = JSON.stringify(manifestJsonArray)
      let jsCode = transformed.code

      if (
        !jsCode.includes(placeholderSingle) &&
        !jsCode.includes(placeholderDouble)
      ) {
        this.warn(
          `inject-sw-precache: Quoted placeholder ('${placeholderBare}') not found in generated JS. ` +
            `Ensure your SW uses JSON.parse('__PRECACHE_MANIFEST__').`,
        )
      }
      jsCode = jsCode.replaceAll(placeholderSingle, manifestStringLiteral)
      jsCode = jsCode.replaceAll(placeholderDouble, manifestStringLiteral)

      // Emit sw.js to the root of the build output (no hashing)
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: jsCode,
      })
    },
  } satisfies Plugin
}
