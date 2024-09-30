import type { Coverage, PixelCounts } from '../types';

import { getPixelCountByComponentType } from './getPixelCountByComponentType';

type Params = {
    pixelCounts: PixelCounts;
};

export function calculateCoverage({ pixelCounts }: Params): Coverage {
    const nonDsComponentPixels = getPixelCountByComponentType({
        pixelCounts,
        componentType: 'nonDsComponent',
    });
    const uiDsComponentPixels = getPixelCountByComponentType({
        pixelCounts,
        componentType: 'uiDsComponent',
    });
    const layoutDsComponentPixels = getPixelCountByComponentType({
        pixelCounts,
        componentType: 'layoutDsComponent',
    });
    const unknownDsComponentPixels = getPixelCountByComponentType({
        pixelCounts,
        componentType: 'unknownDsComponent',
    });
    const dsComponentPixels =
        uiDsComponentPixels + layoutDsComponentPixels + unknownDsComponentPixels;

    const coverage = (dsComponentPixels / (dsComponentPixels + nonDsComponentPixels)) * 100;

    return coverage;
}
