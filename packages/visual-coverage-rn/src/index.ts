export type { ViewMeasurement, RootSwiftView } from './types';
export type { StopReason } from './debug/DsVisualCoverageError';
export { useDsComponentTestId } from './hooks/useDsComponentTestId';
export { DsVisualCoverageError } from './debug/DsVisualCoverageError';
export { serializeCoverageContainer } from './core/serializeCoverageContainer';
export { useCoverageContainerTestId } from './hooks/useCoverageContainerTestId';
export { createCalculateDsVisualCoverages } from './createCalculateDsVisualCoverages';
export {
    CoverageSetupProvider,
    useIsCoverageEnabled,
} from './contextProviders/CoverageSetupProvider';
