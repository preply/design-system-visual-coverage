/// <reference types="vitest" />

import path from 'path';

import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';

export const browserTestGlob = '**/*.browser.test.?(c|m)[jt]s?(x)';

export default defineConfig({
    plugins: [
        svgr({
            svgrOptions: {
                exportType: 'default',
                ref: true,
                svgo: false,
                titleProp: true,
            },
            include: '**/*.svg',
        }),
    ],
    test: {
        // Browser tests must be run in a browser environment, not the default jsdom.
        exclude: [browserTestGlob],
        environment: 'jsdom',
        globals: true,
        setupFiles: [path.join(__dirname, './vitest.setup.ts')],
        coverage: {
            exclude: ['**/*.test.ts', '**/*.test.tsx'],
        },
    },
});
