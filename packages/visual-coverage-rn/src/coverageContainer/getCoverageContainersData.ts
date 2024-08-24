import type { CoverageContainer, Logger, Rect } from '@preply/ds-visual-coverage-core';
import { createRect } from '@preply/ds-visual-coverage-core';

import type {
    AccessibilityIdentifier,
    RootSwiftView,
    ShouldIgnoreContainer,
    ViewMeasurements,
} from '../types';

import { getCoverageContainers } from './getCoverageContainers';
import { parseCoverageContainerAccessibilityIdentifier } from './parseCoverageContainerAccessibilityIdentifier';

type Params = {
    logger: Logger;
    mutableRootSwiftView: RootSwiftView;
    shouldIgnoreContainer: ShouldIgnoreContainer;
};

export type DsVisualCoverageContainerData = {
    elementRect: Rect;
    children: ViewMeasurements;
    coverageContainer: CoverageContainer;
    coverageContainerAccessibilityIdentifier: AccessibilityIdentifier;
};

type Return = Array<DsVisualCoverageContainerData>;

export function getCoverageContainersData(params: Params): Return {
    const { logger, mutableRootSwiftView, shouldIgnoreContainer } = params;

    const coverageContainers = getCoverageContainers({
        logger,
        shouldIgnoreContainer,
        viewMeasurements: mutableRootSwiftView.children,
    });

    const result: Return = coverageContainers.map(coverageContainer => {
        const elementRect = createRect({
            top: coverageContainer.top,
            left: coverageContainer.left,
            width: coverageContainer.width,
            height: coverageContainer.height,
        });

        const coverageContainerAccessibilityIdentifier = coverageContainer.accessibilityIdentifier;

        return {
            children: coverageContainer.children,
            elementRect,
            coverageContainer: parseCoverageContainerAccessibilityIdentifier(
                coverageContainerAccessibilityIdentifier,
            ),
            coverageContainerAccessibilityIdentifier,
        };
    });

    return result;
}
