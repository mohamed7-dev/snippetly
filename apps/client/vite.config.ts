import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        tanstackRouter({ autoCodeSplitting: true }),
        viteReact(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            strategies: 'injectManifest',
            manifest: false,
            srcDir: 'src',
            filename: 'sw.ts',
            injectManifest: {
                globPatterns: ['**/*'],
                maximumFileSizeToCacheInBytes: 50 * 1024 * 1024,
            },
        }),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    const normalizedId = id.replaceAll('\\', '/');
                    if (normalizedId.includes('/node_modules/@tanstack/')) {
                        return 'vendor-tanstack';
                    }
                    if (
                        normalizedId.includes('/node_modules/react/') ||
                        normalizedId.includes('/node_modules/react-dom/') ||
                        normalizedId.includes('/node_modules/scheduler/')
                    ) {
                        return 'vendor-react';
                    }
                },
            },
        },
    },
});
