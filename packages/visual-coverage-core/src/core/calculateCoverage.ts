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
    const utilDsComponentPixels = getPixelCountByComponentType({
        pixelCounts,
        componentType: 'utilDsComponent',
    });
    const rebrandComponentPixels = getPixelCountByComponentType({
        pixelCounts,
        componentType: 'rebrandComponent',
    });
    const layoutDsComponentPixels = getPixelCountByComponentType({
        pixelCounts,
        componentType: 'layoutDsComponent',
    });
    const unknownDsComponentPixels = getPixelCountByComponentType({
        pixelCounts,
        componentType: 'unknownDsComponent',
    });
    const outdatedDsComponentPixels = getPixelCountByComponentType({
        pixelCounts,
        componentType: 'outdatedDsComponent',
    });
    const dsCandidateComponentPixels = getPixelCountByComponentType({
        pixelCounts,
        componentType: 'dsCandidateComponent',
    });

    const dsComponentPixels =
        uiDsComponentPixels +
        layoutDsComponentPixels +
        utilDsComponentPixels +
        unknownDsComponentPixels +
        outdatedDsComponentPixels +
        rebrandComponentPixels +
        dsCandidateComponentPixels;

    const coverage = (dsComponentPixels / (dsComponentPixels + nonDsComponentPixels)) * 100;

    return coverage;
}
