import type { ComponentType, PixelCounts } from '../types';

import { defaultPixelByPixelType } from './constants';

type Params = {
    componentType: ComponentType;
    pixelCounts: PixelCounts;
};

export function getPixelCountByComponentType({ componentType, pixelCounts }: Params): number {
    const index = defaultPixelByPixelType[componentType];
    if (index === undefined) {
        throw new Error(`No index for ${componentType} (this should be a TS-only protection)`);
    }

    const pixelCount = pixelCounts[index];
    if (pixelCount === undefined) {
        throw new Error(`No pixelCount at ${index} (this should be a TS-only protection)`);
    }

    return pixelCount;
}
