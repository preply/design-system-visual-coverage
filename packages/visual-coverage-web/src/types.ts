import type {
    Rect,
    CoverageContainer,
    DsVisualCoverageError,
    DsVisualCoverageRunResult,
} from '@preply/ds-visual-coverage-core';

export type OnError = (error: DsVisualCoverageError) => void;

export type OnComplete = (dsVisualCoverageResult: DsVisualCoverageRunResult) => void;

export type CoverageContainerDataAttribute = CoverageContainer & `data-${string}`;

export type CoverageContainerData = {
    elementRect: Rect;
    domElement: Element;
    attributeValue: string | null;
};
