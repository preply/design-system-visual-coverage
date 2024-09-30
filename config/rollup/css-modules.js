const { readFile, writeFile } = require('fs/promises');
const { resolve } = require('path');

/**
 * this custom rollup plugin serves 3 purposes:
 * - removes the unnecessary duplication of CSS source code emitted by https://github.com/egoist/rollup-plugin-postcss
 * - includes the filename in the export so that we can deduplicate styles collected during SSR (see @preply/ds-web-root/ssr/classes/ServerStylesheet.tsx)
 */

const BROKEN_SOURCE_MAP_REGEXP =
    /\/\/# sourceMappingURL=data:application\/json;charset=utf-8;base64.*/;

const isCSSModule = filename => {
    return filename.match(/module.less$/);
};

const isCompiledCSSModule = filename => {
    return filename.match(/module.less.js$/);
};

const getVarName = code => {
    return code.match(/var ([\w]+)/i)[1];
};

const stripBrokenSourceMap = async filename => {
    const contents = (await readFile(filename)).toString();
    const stripped = contents.replace(BROKEN_SOURCE_MAP_REGEXP, '');
    return writeFile(filename, stripped);
};

const transform = (code, filename) => {
    if (!isCSSModule(filename)) {
        return null;
    }

    const item = { code, filename };
    const varName = getVarName(code);

    const replace = (pattern, replacement) => {
        item.code = item.code.replace(pattern, replacement);
    };

    const dedupeCSSSourceCode = () => {
        const stylesheetDeclarationRegexp = /export var stylesheet=".*";/;
        replace(stylesheetDeclarationRegexp, `export var stylesheet=${varName};`);
    };

    const exportMeta = () => {
        const id = filename.replace(new RegExp(`.*ds/packages`), '');
        const stylesDeclaration = 'export default {';
        const stylesDeclarationRegexp = new RegExp('export default {');
        const stylesExtended = `${stylesDeclaration}__id:"${id}",__css:${varName},`;
        replace(stylesDeclarationRegexp, stylesExtended);
    };

    dedupeCSSSourceCode();
    exportMeta();

    return {
        code: item.code,
        map: null,
    };
};

module.exports = function cssModules() {
    return {
        name: 'css-modules',
        transform,
        writeBundle: async (options, bundle) => {
            const promises = Object.keys(bundle)
                .filter(isCompiledCSSModule)
                .map(name => resolve(options.dir, name))
                .map(stripBrokenSourceMap);
            return Promise.all(promises);
        },
    };
};
