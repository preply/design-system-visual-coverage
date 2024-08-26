export { initDsVisualCoverageInProd } from './initDsVisualCoverageInProd';
export { isDsVisualCoverageSupported } from './compatibility/isDsVisualCoverageSupported';

export type {
    DsCoverageCount,
    DsCoverageAllContainersRuntimeInfo,
    DsCoverageSingleContainerRuntimeInfo,
} from './utils/convertDsCoverageToDwhEvent';

export {
    PageDsCoverage,
    DsCoverageContext,
    updateElementWithDsCoverageAttributes,
} from './utils/dsVisualCoverageContainerAttribute';
