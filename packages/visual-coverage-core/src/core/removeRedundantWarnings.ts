import type { Warning } from '../types';

type Params = {
    warnings: Warning[];
};
export function removeRedundantWarnings({ warnings }: Params): Warning[] {
    let result: Warning[] = [...warnings];

    if (result.includes('doesNotContainChildren') || result.includes('hasNoSize')) {
        result = result.filter(
            warning => warning !== 'zeroTotalPixels' && warning !== 'onlyEmptyPixels',
        );
    }

    return result;
}
