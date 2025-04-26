const { FlatCompat } = require('@eslint/eslintrc');

const globals = require('globals');
const js = require('@eslint/js');
const ts = require('typescript-eslint');
const react = require('eslint-plugin-react');
const hooks = require('eslint-plugin-react-hooks');
const security = require('eslint-plugin-security');
const prettierRecommended = require('eslint-plugin-prettier/recommended');
const mdx = require('eslint-plugin-mdx');
const jsxA11y = require('eslint-plugin-jsx-a11y');
const importPlugin = require('eslint-plugin-import');
const { fixupPluginRules } = require('@eslint/compat');
const tsParser = require('@typescript-eslint/parser');
const vitest = require('eslint-plugin-vitest');
const serverComponents = require('eslint-plugin-react-server-components');

const compat = new FlatCompat();

module.exports = ts.config(
    /* Globals */

    { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
    {
        ignores: [
            '**/dist/**/*',
            '**/coverage/**/*',
            'examples/**/*',
            '**/generated/**/*',
            '*.d.ts',
            'eslint.config.cjs',
            'packages/*/coverage',
        ],
    },
    {
        languageOptions: {
            globals: globals.browser,
            parser: tsParser,
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },

    /* Recommended configs */

    js.configs.recommended,
    ...ts.configs.recommended,
    react.configs.flat.recommended,
    security.configs.recommended,
    mdx.flat,
    mdx.flatCodeBlocks,
    jsxA11y.flatConfigs.recommended,
    {
        files: ['**/*.{jsx,tsx}'],
        plugins: {
            'react-hooks': fixupPluginRules(hooks),
        },
        rules: hooks.configs.recommended.rules,
    },
    {
        files: ['**/*.{ts,tsx,js,jsx}'],
        plugins: {
            import: fixupPluginRules(importPlugin),
        },
        settings: {
            'import/parsers': {
                '@typescript-eslint/parser': ['.ts', '.tsx'],
            },
            'import/resolver': {
                typescript: true,
                node: true,
            },
        },
        rules: importPlugin.configs.recommended.rules,
    },

    /* Overrides */
    {
        files: [
            'packages/web-core/**/*.{ts,tsx,js,jsx}',
            'packages/web-lib/**/*.{ts,tsx,js,jsx}',
            'packages/web-root/**/*.{ts,tsx,js,jsx}',
        ],
        ignores: ['**/*.test.{ts,tsx,js,jsx}', '**/docs/**', '*.stories.tsx'],
        plugins: {
            'react-server-components': fixupPluginRules(serverComponents),
        },
        rules: {
            ...serverComponents.configs.recommended.rules,
        },
    },
    {
        files: ['**/*.{ts,tsx,js,jsx}'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: [
                                '@preply/ds-core/src',
                                '@preply/ds-core/dist',
                                '@preply/ds-web-core/src',
                                '@preply/ds-web-core/dist/*',
                                '!@preply/ds-web-core/dist/global-style/',
                                '@preply/ds-web/src',
                                '@preply/ds-web/dist',
                            ],
                            message:
                                'Do not import modules directly. Import from `@preply/ds-***` root only',
                        },
                    ],
                },
            ],
            // TODO: Enable when issue is resolved: https://github.com/import-js/eslint-plugin-import/issues/2556
            'import/namespace': 'off',
            // Disable errors, handled by typescript
            'import/no-unresolved': 'off',
            'import/no-named-as-default': 'off',
            'import/default': 'off',
            'import/named': 'off',
        },
    },
    {
        files: ['**/*.{tsx,jsx}'],
        rules: {
            'react/prop-types': 'off',
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'error',
        },
    },
    {
        files: [
            'config/**/*',
            '**/rollup.config.{js,cjs}',
            '**/postcss.config.js',
            '**/svgo.config.js',
            '**/eslint.config.mjs',
            '**/jest.config.js',
            '**/scripts/*',
            'support/docs/config/**/*',
            'packages/rn-lib/test/**',
            '**/*.cjs',
        ],
        languageOptions: { globals: globals.node, sourceType: 'commonjs' },
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
            'import/no-named-as-default': 'off',
        },
    },
    {
        files: ['*.test.{ts,tsx}'],
        ignores: ['packages/rn-*/**/*'],
        plugins: {
            vitest,
        },
        rules: {
            ...vitest.configs.recommended.rules,
        },
    },
    {
        files: ['packages/rn-*/**/*'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
    {
        rules: {
            'security/detect-object-injection': 'off',
        },
    },

    prettierRecommended,
);
