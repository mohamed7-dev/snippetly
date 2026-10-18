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
                // Improve chunking to keep vendor libs separate
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('react')) return 'vendor-react';
                        if (id.includes('@tanstack')) return 'vendor-tanstack';
                        if (id.includes('lucide-react')) return 'vendor-icons';
                        if (id.includes('/prettier/')) return 'vendor-prettier';
                        return 'vendor';
                    }
                },
            },
        },
    },
});
