import type {
    CoverageContainer,
    CoverageContainerDomAttributeValue,
    DsVisualCoverageRunResult,
    Rect,
} from '@preply/ds-visual-coverage-core';

import type { DsVisualCoverageError } from './debug/DsVisualCoverageError';

export type OnError = (error: DsVisualCoverageError) => void;
export type OnComplete = (dsVisualCoverageResult: DsVisualCoverageRunResult) => void;
export type ShouldIgnoreContainer = (
    dsVisualCoverageContainerAttribute: CoverageContainer,
) => boolean;

export type CoverageContainerData = {
    domElement: Element;
    elementRect: Rect;
    coverageContainer: CoverageContainer;
    coverageContainerAttributeValue: CoverageContainerDomAttributeValue;
};
