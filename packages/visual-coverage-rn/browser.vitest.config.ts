import { defineConfig } from 'vitest/config';

import vitestConfig, { browserTestGlob } from '../../vitest.config';

export default defineConfig({
    ...vitestConfig,
    test: {
        ...vitestConfig.test,

        // Default Vite config excludes browser tests, let's avoid it...
        exclude: vitestConfig.test?.exclude?.filter(glob => glob !== browserTestGlob),
        // ... and include just them
        include: [browserTestGlob],

        browser: {
            provider: 'playwright', // or 'webdriverio'
            enabled: true,
            name: 'chromium', // browser name is required
            // https://playwright.dev
            providerOptions: {},
        },
        coverage: {
            provider: 'istanbul',
        },
    },
});
