import type {
    ColorByPixelType,
    DsVisualCoverageResult,
    Logger,
    WeightByComponentName,
} from '@preply/ds-visual-coverage-core';
import {
    addSvgRectangles,
    createPixelCounts,
    isEmptyCoverageContainer,
} from '@preply/ds-visual-coverage-core';

import { countPixels } from './core/countPixels';
import { loopOverDomChildren } from './core/loopOverDomChildren';
import { DsVisualCoverageError } from './debug/DsVisualCoverageError';
import type { RequestIdleCallback } from './support/getRequestIdleCallback';
import type { CoverageContainerData } from './types';

type Params = {
    logger: Logger;
    userType: string;
    printAsciiArt: boolean;
    colorByPixelType: ColorByPixelType;
    weightByComponentName: WeightByComponentName;
    svgRenderer?: SVGSVGElement | undefined;
    stopVisualCoverageCalculation: () => boolean;
    requestIdleCallbackFunc: RequestIdleCallback;
    dsVisualCoverageContainerData: CoverageContainerData;
};

type Return = DsVisualCoverageResult & {
    dsVisualCoverageContainerData: CoverageContainerData;
};

export async function calculateDsVisualCoverage(params: Params): Promise<Return> {
    const {
        logger,
        userType,
        svgRenderer,
        printAsciiArt,
        colorByPixelType,
        weightByComponentName,
        requestIdleCallbackFunc,
        stopVisualCoverageCalculation,
        dsVisualCoverageContainerData,
    } = params;

    const { domElement, elementRect } = dsVisualCoverageContainerData;

    // --------------------------------------------------
    // LOOP OVER DOM CHILDREN
    // --------------------------------------------------
    const loopOverDomChildrenResult = await loopOverDomChildren({
        domElement,
        logger,
        requestIdleCallbackFunc,
        stopVisualCoverageCalculation,
    });

    const { childrenData } = loopOverDomChildrenResult;
    const loopOverDomChildrenDuration = loopOverDomChildrenResult.stopped
        ? 0
        : loopOverDomChildrenResult.duration;
    const loopOverDomChildrenStopReason = loopOverDomChildrenResult.stopped
        ? loopOverDomChildrenResult.stopReason
        : undefined;

    if (loopOverDomChildrenStopReason !== undefined) {
        throw new DsVisualCoverageError(
            {
                userType,
                stopReason: loopOverDomChildrenStopReason,
                team: params.dsVisualCoverageContainerData.coverageContainer.team,
                component: params.dsVisualCoverageContainerData.coverageContainer.component,
            },
            `loopOverDomChildren stopped (${loopOverDomChildrenStopReason})`,
        );
    }

    let pixelCounts = createPixelCounts();
    let countPixelsDuration = 0;

    if (!isEmptyCoverageContainer({ childrenData })) {
        // --------------------------------------------------
        // COUNT PIXELS
        // --------------------------------------------------
        const countPixelsResult = await countPixels({
            logger,
            elementRect,
            childrenData,
            printAsciiArt,
            weightByComponentName,
        });
        pixelCounts = countPixelsResult.pixelCounts;
        countPixelsDuration = countPixelsResult.stopped ? 0 : countPixelsResult.duration;
        const countPixelsStopReason = countPixelsResult.stopped
            ? countPixelsResult.stopReason
            : undefined;
        if (countPixelsStopReason !== undefined) {
            throw new DsVisualCoverageError(
                {
                    userType,
                    stopReason: countPixelsStopReason,
                    team: params.dsVisualCoverageContainerData.coverageContainer.team,
                    component: params.dsVisualCoverageContainerData.coverageContainer.component,
                },
                'countPixels stopped',
            );
        }
    }

    // --------------------------------------------------
    // VISUALIZE COVERAGE
    // --------------------------------------------------
    if (svgRenderer) {
        addSvgRectangles({
            svgRenderer,
            childrenData,
            colorByPixelType,
            weightByComponentName,
        });
    }

    return {
        pixelCounts,
        stopped: false,
        elementRect,
        dsVisualCoverageContainerData,

        duration: {
            countPixelsDuration,
            loopOverDomChildrenDuration,

            blockingDuration: 0,
            nonBlockingDuration: countPixelsDuration + loopOverDomChildrenDuration,
        },
    };
}
