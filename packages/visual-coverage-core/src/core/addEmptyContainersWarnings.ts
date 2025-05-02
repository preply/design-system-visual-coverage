import type { DsVisualCoverageDeNormalizedResult } from '../types';

import { emptyPixel } from './constants';

type Params = {
    mutableResults: DsVisualCoverageDeNormalizedResult[];
};
export function addEmptyContainersWarnings({ mutableResults }: Params) {
    for (const mutableResult of mutableResults) {
        const totalPixels = mutableResult.pixelCounts.reduce((acc, val) => acc + val, 0);

        // It happens when a direct child of a DS visual coverage container... is another DS visual
        // coverage container! This makes the parent count stopping immediately, and the parent is
        // discarded here. The common use case is
        // 1. FE Squad added ds visual coverage containers to all the services' index pages
        // 2. Every single page also add containers to their root
        if (totalPixels === 0) {
            mutableResult.warnings.push('zeroTotalPixels');
        }

        const emptyPixels = mutableResult.pixelCounts[emptyPixel];
        // Avoid returning a container which coverage is NaN because they do not contain any meaningful pixel
        if (totalPixels === emptyPixels) {
            mutableResult.warnings.push('onlyEmptyPixels');
        }
    }
}
