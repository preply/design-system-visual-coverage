import {
    hasNoSize,
    countPixels,
    createPixelCounts,
    getRectCoordinate,
    getRectCoordinates,
    doesNotContainChildren,
    DsVisualCoverageError,
} from '@preply/ds-visual-coverage-core';

import type {
    Logger,
    Warning,
    GetComponentData,
    GetContainerData,
    DsVisualCoverageResult,
} from '@preply/ds-visual-coverage-core';

import { filterOutIntermediateChildren } from './core/filterOutIntermediateChildren';
import { loopOverContainerChildren } from './core/loopOverContainerChildren';
import type { DsVisualCoverageContainerData } from './coverageContainer/getCoverageContainersData';
import type { ViewMeasurement } from './types';

type Params = {
    logger: Logger;
    getContainerData: GetContainerData<ViewMeasurement>;
    svgRenderer?: SVGSVGElement | undefined;
    getComponentData: GetComponentData<ViewMeasurement>;
    dsVisualCoverageContainerData: DsVisualCoverageContainerData;
};

type Return = DsVisualCoverageResult & {
    dsVisualCoverageContainerData: DsVisualCoverageContainerData;
};

export function calculateDsVisualCoverage(params: Params): Return {
    const { logger, getComponentData, dsVisualCoverageContainerData, getContainerData } = params;

    const { children, elementRect } = dsVisualCoverageContainerData;
    const warnings: Warning[] = [];

    // --------------------------------------------------
    // LOOP OVER DOM CHILDREN
    // --------------------------------------------------
    const coverageContainerDataResult = getComponentData({
        component: {
            ...getRectCoordinates(elementRect),
            // Swift's class
            children,
            instanceOf: dsVisualCoverageContainerData.instanceOf,
            accessibilityLabel: dsVisualCoverageContainerData.accessibilityLabel,
            accessibilityIdentifier:
                dsVisualCoverageContainerData.coverageContainerAccessibilityIdentifier,
        },
        parentsData: [],
    });

    if (coverageContainerDataResult.result === 'ignoreComponent') {
        const debugInfo = dsVisualCoverageContainerData.coverageContainerAccessibilityIdentifier;
        throw new DsVisualCoverageError({
            platform: 'app',
            debugInfo,
            stopReason: 'coverageContainerIgnored',
            message: `The coverage container is an element that should be ignored (${debugInfo})`,
        });
    }

    const { weight, dsComponentName, debugInfo, debugColor } = coverageContainerDataResult;

    const loopOverDomChildrenResult = loopOverContainerChildren({
        logger,
        children,
        getContainerData,
        getComponentData,
        coverageContainerData: {
            rect: elementRect,
            weight,
            debugInfo,
            debugColor,
            dsComponentName,
        },
    });
    const loopOverDomChildrenDuration = loopOverDomChildrenResult.duration;

    const { childrenData } = filterOutIntermediateChildren({
        childrenData: loopOverDomChildrenResult.childrenData,
        logger,
    });

    // --------------------------------------------------
    // COUNT PIXELS
    // --------------------------------------------------
    let pixelCounts = createPixelCounts(0);
    let countPixelsDuration = 0;
    let pixelByComponentName = {};
    let nonDsComponentsPixel = 0;

    if (hasNoSize({ rect: elementRect })) warnings.push('hasNoSize');
    if (doesNotContainChildren({ childrenData })) warnings.push('doesNotContainChildren');

    if (warnings.length === 0) {
        const countPixelsResult = countPixels({
            elementRect,
            childrenData,
            offset: {
                top: getRectCoordinate(elementRect, 'top'),
                left: getRectCoordinate(elementRect, 'left'),
            },
        });
        pixelCounts = countPixelsResult.pixelCounts;
        countPixelsDuration = countPixelsResult.duration;
        pixelCounts = countPixelsResult.pixelCounts;
        pixelByComponentName = countPixelsResult.pixelByComponentName;
        nonDsComponentsPixel = countPixelsResult.nonDsComponentsPixel;
    }

    // --------------------------------------------------
    // VISUALIZE COVERAGE
    // --------------------------------------------------
    return {
        warnings,

        pixelCounts,
        pixelByComponentName,
        nonDsComponentsPixel,

        elementRect,
        childrenData,
        dsVisualCoverageContainerData,

        duration: {
            countPixelsDuration,
            loopOverDomChildrenDuration,

            blockingDuration: 0,
            nonBlockingDuration: countPixelsDuration + loopOverDomChildrenDuration,
        },
    };
}
