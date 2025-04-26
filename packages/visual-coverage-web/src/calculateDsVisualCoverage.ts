import type {
    Logger,
    Warning,
    GetComponentData,
    DsVisualCoverageResult,
} from '@preply/ds-visual-coverage-core';
import {
    hasNoSize,
    createPixelCounts,
    DsVisualCoverageError,
    doesNotContainChildren,
} from '@preply/ds-visual-coverage-core';
import { nullAttributeValue } from './constants';

import { countPixels } from './core/countPixels';
import { loopOverDomChildren } from './core/loopOverDomChildren';
import type { RequestIdleCallback } from './support/getRequestIdleCallback';
import type { CoverageContainerData, CoverageContainerDataAttribute } from './types';

type Params = {
    logger: Logger;
    getComponentData: GetComponentData<Element>;
    stopVisualCoverageCalculation: () => boolean;
    requestIdleCallbackFunc: RequestIdleCallback;
    dsVisualCoverageContainerData: CoverageContainerData;
    coverageContainersDataAttribute: CoverageContainerDataAttribute | undefined;
};

type Return = DsVisualCoverageResult & {
    dsVisualCoverageContainerData: CoverageContainerData;
};

export async function calculateDsVisualCoverage(params: Params): Promise<Return> {
    const {
        logger,
        getComponentData,
        requestIdleCallbackFunc,
        stopVisualCoverageCalculation,
        dsVisualCoverageContainerData,
        coverageContainersDataAttribute,
    } = params;

    const { domElement, elementRect, attributeValue } = dsVisualCoverageContainerData;
    const warnings: Warning[] = [];

    // --------------------------------------------------
    // LOOP OVER DOM CHILDREN
    // --------------------------------------------------
    const getComponentDataResult = getComponentData({ component: domElement, parentsData: [] });

    if (getComponentDataResult.result === 'ignoreComponent') {
        const debugInfo = attributeValue ?? nullAttributeValue;
        throw new DsVisualCoverageError({
            platform: 'web',
            debugInfo,
            stopReason: 'coverageContainerIgnored',
            message: `The coverage container is an element that should be ignored (${debugInfo})`,
        });
    }

    const { weight, dsComponentName, debugInfo, debugColor } = getComponentDataResult;

    const loopOverDomChildrenResult = await loopOverDomChildren({
        logger,
        domElement,
        getComponentData,
        requestIdleCallbackFunc,
        stopVisualCoverageCalculation,
        coverageContainersDataAttribute,
        coverageContainerData: {
            rect: elementRect,
            weight,
            debugInfo,
            debugColor,
            dsComponentName,
        },
    });

    const { childrenData } = loopOverDomChildrenResult;

    const loopOverDomChildrenDuration = loopOverDomChildrenResult.stopped
        ? 0
        : loopOverDomChildrenResult.duration;
    const loopOverDomChildrenStopReason = loopOverDomChildrenResult.stopped
        ? loopOverDomChildrenResult.stopReason
        : undefined;

    if (loopOverDomChildrenStopReason !== undefined) {
        const coverageContainer = attributeValue ?? nullAttributeValue;

        throw new DsVisualCoverageError({
            platform: 'web',
            debugInfo: coverageContainer,
            stopReason: loopOverDomChildrenStopReason,
            message: `loopOverDomChildren stopped (${loopOverDomChildrenStopReason})`,
        });
    }

    let pixelCounts = createPixelCounts(0);
    let countPixelsDuration = 0;
    let pixelByComponentName = {};
    let nonDsComponentsPixel = 0;

    if (hasNoSize({ rect: elementRect })) warnings.push('hasNoSize');
    if (doesNotContainChildren({ childrenData })) warnings.push('doesNotContainChildren');

    if (warnings.length === 0) {
        // --------------------------------------------------
        // COUNT PIXELS
        // --------------------------------------------------
        const countPixelsResult = await countPixels({
            logger,
            elementRect,
            childrenData,
            returnBitmap: false,
        });
        pixelCounts = countPixelsResult.pixelCounts;
        pixelByComponentName = countPixelsResult.pixelByComponentName;
        nonDsComponentsPixel = countPixelsResult.nonDsComponentsPixel;
        countPixelsDuration = countPixelsResult.stopped ? 0 : countPixelsResult.duration;
        const countPixelsStopReason = countPixelsResult.stopped
            ? countPixelsResult.stopReason
            : undefined;
        if (countPixelsStopReason !== undefined) {
            const coverageContainer = attributeValue ?? nullAttributeValue;

            throw new DsVisualCoverageError({
                platform: 'web',
                debugInfo: coverageContainer,
                message: 'countPixels stopped',
                stopReason: countPixelsStopReason,
            });
        }
    }

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
