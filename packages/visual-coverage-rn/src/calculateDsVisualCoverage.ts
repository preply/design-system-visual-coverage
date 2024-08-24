import type {
    ColorByPixelType,
    DsVisualCoverageResult,
    Logger,
    PixelByPixelType,
    WeightByComponentName,
} from '@preply/ds-visual-coverage-core';
import {
    addSvgRectangles,
    countPixels,
    createPixelCounts,
    getRectCoordinate,
    isEmptyCoverageContainer,
} from '@preply/ds-visual-coverage-core';

import { filterOutIntermediateChildren } from './core/filterOutIntermediateChildren';
import { loopOverContainerChildren } from './core/loopOverContainerChildren';
import type { DsVisualCoverageContainerData } from './coverageContainer/getCoverageContainersData';

type Params = {
    logger: Logger;
    printAsciiArt: boolean;
    colorByPixelType: ColorByPixelType;
    pixelByPixelType: PixelByPixelType;
    svgRenderer?: SVGSVGElement | undefined;
    weightByComponentName: WeightByComponentName;
    dsVisualCoverageContainerData: DsVisualCoverageContainerData;
};

type Return = DsVisualCoverageResult & {
    dsVisualCoverageContainerData: DsVisualCoverageContainerData;
};

export function calculateDsVisualCoverage(params: Params): Return {
    const {
        logger,
        svgRenderer,
        printAsciiArt,
        colorByPixelType,
        pixelByPixelType,
        weightByComponentName,
        dsVisualCoverageContainerData,
    } = params;

    const { children, elementRect } = dsVisualCoverageContainerData;

    // --------------------------------------------------
    // LOOP OVER DOM CHILDREN
    // --------------------------------------------------
    const loopOverDomChildrenResult = loopOverContainerChildren({
        children,
        logger,
    });
    const loopOverDomChildrenDuration = loopOverDomChildrenResult.duration;

    const { childrenData } = filterOutIntermediateChildren({
        childrenData: loopOverDomChildrenResult.childrenData,
        logger,
    });

    // --------------------------------------------------
    // COUNT PIXELS
    // --------------------------------------------------
    let pixelCounts = createPixelCounts();
    let countPixelsDuration = 0;

    if (!isEmptyCoverageContainer({ childrenData })) {
        const countPixelsResult = countPixels({
            logger,
            elementRect,
            childrenData,
            printAsciiArt,
            pixelByPixelType,
            weightByComponentName,
            offset: {
                top: getRectCoordinate(elementRect, 'top'),
                left: getRectCoordinate(elementRect, 'left'),
            },
        });
        pixelCounts = countPixelsResult.pixelCounts;
        countPixelsDuration = countPixelsResult.duration;
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
