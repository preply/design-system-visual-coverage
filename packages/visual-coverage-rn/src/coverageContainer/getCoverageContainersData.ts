import type {
    Rect,
    Logger,
    GetContainerData,
    CoverageContainer,
} from '@preply/ds-visual-coverage-core';
import { createRect } from '@preply/ds-visual-coverage-core';

import type {
    RootSwiftView,
    ViewMeasurement,
    ViewMeasurements,
    AccessibilityIdentifier,
} from '../types';

import { getCoverageContainers } from './getCoverageContainers';

type Params = {
    logger: Logger;
    mutableRootSwiftView: RootSwiftView;
    getContainerData: GetContainerData<ViewMeasurement>;
};

export type DsVisualCoverageContainerData = {
    elementRect: Rect;
    instanceOf: string;
    children: ViewMeasurements;
    accessibilityLabel: string;
    coverageContainer: CoverageContainer;
    coverageContainerAccessibilityIdentifier: AccessibilityIdentifier;
};

type Return = Array<DsVisualCoverageContainerData>;

export function getCoverageContainersData(params: Params): Return {
    const { logger, mutableRootSwiftView, getContainerData } = params;

    const coverageContainers = getCoverageContainers({
        logger,
        getContainerData,
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
            coverageContainerAccessibilityIdentifier,
            instanceOf: coverageContainer.instanceOf,
            accessibilityLabel: coverageContainer.accessibilityLabel,
            // TODO: is this duplicate useful for RN?
            coverageContainer: coverageContainerAccessibilityIdentifier,
        };
    });

    return result;
}
