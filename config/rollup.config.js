const glob = require('fast-glob');
const peerDepsExternal = require('rollup-plugin-peer-deps-external');
const renameNodeModules = require('@pixi/rollup-plugin-rename-node-modules');
const typescript = require('rollup-plugin-typescript2');
const resolve = require('@rollup/plugin-node-resolve').default;
const postcss = require('rollup-plugin-postcss');
const image = require('@rollup/plugin-image');
const svgr = require('@svgr/rollup');
const copy = require('rollup-plugin-copy');
const { preserveDirective } = require('rollup-preserve-directives');
const cssModules = require('./rollup/css-modules');

const sources = glob.sync(['src/**/*.{ts,tsx,less}', '!**/*.test.{ts,tsx}', '!**/docs/**']);

const isProd = process.env.NODE_ENV === 'production';
const generateScopedName = isProd ? '[hash:base64:6]' : '[local]__[hash:base64:5]';

const config = {
    input: sources,
    output: [
        {
            format: 'es',
            dir: './dist',
            sourcemap: 'inline',
            preserveModules: true,
            preserveModulesRoot: 'src/',
        },
    ],
    plugins: [
        preserveDirective(),
        peerDepsExternal(),
        renameNodeModules('external'),
        resolve({
            extensions: ['.js', '.jsx', '.ts', '.tsx', '.svg'],
        }),
        typescript({
            tsconfig: 'tsconfig.build.json',
        }),
        image({
            include: ['src/**/*.inline.svg', 'src/**/*.png'],
        }),
        svgr({
            include: ['src/**/*.comp.svg', 'src/**/*.svg'],
        }),
        postcss({
            modules: {
                generateScopedName,
            },
            minimize: isProd,
        }),
        cssModules(),
        copy({
            targets: [{ src: 'src/**/*.{less,scss,png}', dest: 'dist/' }],
            flatten: false,
        }),
    ],
};

module.exports = config;
