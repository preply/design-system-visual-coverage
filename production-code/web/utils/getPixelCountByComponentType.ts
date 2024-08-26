import { defaultPixelByPixelType } from '@preply/ds-visual-coverage-core';
import type { ComponentType, PixelCounts } from '@preply/ds-visual-coverage-core';

export function getPixelCountByComponentType({
    componentType,
    pixelCounts,
}: {
    componentType: ComponentType;
    pixelCounts: PixelCounts;
}) {
    return pixelCounts[defaultPixelByPixelType[componentType]];
}
