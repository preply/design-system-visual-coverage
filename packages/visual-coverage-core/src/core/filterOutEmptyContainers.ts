import type { DsVisualCoverageDeNormalizedResult, Logger, PixelByPixelType } from '../types';

import { defaultPixelByPixelType } from './constants';

type Params = {
    results: DsVisualCoverageDeNormalizedResult[];
    pixelByPixelType?: PixelByPixelType;
    logger: Logger;
};
export function filterOutEmptyContainers({
    pixelByPixelType = defaultPixelByPixelType,
    results,
    logger,
}: Params): DsVisualCoverageDeNormalizedResult[] {
    return results.filter(result => {
        const totalPixels = result.pixelCounts.reduce((acc, val) => acc + val, 0);
        // It happens when a direct child of a DS visual coverage container... is another DS visual
        // coverage container! This makes the parent count stopping immediately, and the parent is
        // discarded here. The common use case is
        // 1. FE Squad added ds visual coverage containers to all the services' index pages
        // 2. Every single page also add containers to their root
        if (totalPixels === 0) {
            logger(
                `Component ${result.component} (belonging to ${result.team}) has been discarded because it's empty`,
            );
            return false;
        }

        const emptyPixels = result.pixelCounts[pixelByPixelType.emptyPixel];
        // Avoid returning a container which coverage is NaN because they do nto contain any meaningful pixel
        if (totalPixels === emptyPixels) {
            logger(
                `Component ${result.component} (belonging to ${result.team}) has been discarded because it's only contains empty pixels`,
            );
            return false;
        }

        return true;
    });
}
