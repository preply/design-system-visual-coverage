export type {
    Rect,
    Pixel,
    Bitmap,
    Logger,
    Warning,
    ChildData,
    PixelCounts,
    Milliseconds,
    ComponentColor,
    GetComponentData,
    GetContainerData,
    CoverageContainer,
    DsVisualCoverageResult,
    DsVisualCoverageRunResult,
    DsVisualCoverageDeNormalizedResult,
} from './types';

export { hasNoSize } from './core/hasNoSize';
export { countPixels } from './core/countPixels';
export { createBitmap } from './bitmap/createBitmap';
export { setBitmapPixel } from './bitmap/setBitmapPixel';
export { createPixelCounts } from './core/createPixelCounts';
export { createLogger, isActiveLogger } from './debug/createLogger';
export { DsVisualCoverageError } from './debug/DsVisualCoverageError';
export { doesNotContainChildren } from './core/doesNotContainChildren';
export { removeRedundantWarnings } from './core/removeRedundantWarnings';
export { DsVisualCoverageWarning } from './debug/DsVisualCoverageWarning';
export { addEmptyContainersWarnings } from './core/addEmptyContainersWarnings';
export { getDenormalizedCoverageResult } from './utils/getDenormalizedCoverageResult';
export { createRect, getRectCoordinate, getRectCoordinates } from './rect/rectProperties';
