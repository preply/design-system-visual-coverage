export type {
    Rect,
    Pixel,
    Bitmap,
    Logger,
    ChildData,
    PixelCounts,
    Milliseconds,
    ComponentType,
    HighestNumber,
    ColorByPixelType,
    PixelByPixelType,
    CoverageContainer,
    ReadableCharByPixel,
    WeightByComponentName,
    DsVisualCoverageResult,
    DsVisualCoverageRunResult,
    CoverageContainerDomAttributeValue,
    DsVisualCoverageDeNormalizedResult,
} from './types';

export { logBitmap } from './bitmap/logBitmap';
export { countPixels } from './core/countPixels';
export { createBitmap } from './bitmap/createBitmap';
export { setBitmapPixel } from './bitmap/setBitmapPixel';
export { getComponentType } from './core/getComponentType';
export { addSvgRectangles } from './debug/addSvgRectangles';
export { calculateCoverage } from './core/calculateCoverage';
export { createPixelCounts } from './core/createPixelCounts';
export { createLogger, isActiveLogger } from './utils/createLogger';
export { filterOutEmptyContainers } from './core/filterOutEmptyContainers';
export { isEmptyCoverageContainer } from './core/isEmptyCoverageContainer';
export { getPixelCountByComponentType } from './core/getPixelCountByComponentType';
export { getDenormalizedCoverageResult } from './utils/getDenormalizedCoverageResult';
export { createRect, getRectCoordinate, getRectCoordinates } from './rect/rectProperties';
export {
    defaultPixelByPixelType,
    defaultColorByPixelType,
    svgRendererAttributeName,
    defaultWeightByComponentName,
    coverageContainerDomAttributeName,
} from './core/constants';
