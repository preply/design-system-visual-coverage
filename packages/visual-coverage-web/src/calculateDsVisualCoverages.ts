import {
    ColorByPixelType,
    DsVisualCoverageDeNormalizedResult,
    Logger,
    WeightByComponentName,
    filterOutEmptyContainers,
    getDenormalizedCoverageResult,
    getRectCoordinates,
    svgRendererAttributeName,
} from '@preply/ds-visual-coverage-core';

import { calculateDsVisualCoverage } from './calculateDsVisualCoverage';
import { getCoverageContainersData } from './coverageContainer/getCoverageContainersData';
import { DsVisualCoverageError } from './debug/DsVisualCoverageError';
import type { RequestIdleCallback } from './support/getRequestIdleCallback';
import type { OnComplete, OnError, ShouldIgnoreContainer } from './types';

type Params = {
    logger: Logger;
    onError: OnError;
    // TODO: this should become part of a `meta` object passed back to the callbacks, it should not be part of DS scope
    userType: string;
    onComplete: OnComplete;
    printAsciiArt: boolean;
    rootElement: Document | HTMLElement;
    colorByPixelType: ColorByPixelType;
    weightByComponentName: WeightByComponentName;
    shouldIgnoreContainer: ShouldIgnoreContainer;
    requestIdleCallbackFunc: RequestIdleCallback;
    stopVisualCoverageCalculation: () => boolean;
} & (
    | {
          drawAndAppendSvg: false;
      }
    | {
          drawAndAppendSvg: true;
          svgContainer: HTMLElement;
      }
);

export function calculateDsVisualCoverages(params: Params): void {
    const {
        logger,
        onError,
        userType,
        onComplete,
        rootElement,
        printAsciiArt,
        colorByPixelType,
        weightByComponentName,
        shouldIgnoreContainer,
        requestIdleCallbackFunc,
        stopVisualCoverageCalculation,
    } = params;

    const start = Date.now();

    const dsVisualCoverageContainersData = getCoverageContainersData({
        logger,
        rootElement,
        shouldIgnoreContainer,
    });

    if (dsVisualCoverageContainersData.length === 0) {
        onComplete({
            stopped: true,
            totalDuration: -1,
            dsVisualCoverageResults: [],
        });
        return;
    }

    logger('🎬 Calculation start');

    if (stopVisualCoverageCalculation()) {
        logger('❌ Is outdated (pre run)');
        onComplete({
            stopped: true,
            totalDuration: -1,
            dsVisualCoverageResults: [],
        });
        return;
    }

    const results: DsVisualCoverageDeNormalizedResult[] = [];
    dsVisualCoverageContainersData.forEach(dsVisualCoverageContainerData => {
        const { elementRect, domElement } = dsVisualCoverageContainerData;

        let svgRenderer: SVGSVGElement | undefined;
        if (params.drawAndAppendSvg) {
            const { top, left, width, height } = getRectCoordinates(elementRect);

            // By passing an svg, the element's rect will be added there and we can visualize them by adding the svg to the page
            svgRenderer = globalThis.document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svgRenderer.setAttribute('width', (left + width).toString());
            svgRenderer.setAttribute('height', (top + height).toString());
            svgRenderer.style.position = 'absolute';
            svgRenderer.style.zIndex = '2147483647'; // That's 32-bit integer max value, see https://stackoverflow.com/a/491105
            svgRenderer.style.top = '0';
            svgRenderer.style.left = '0';
            svgRenderer.style.pointerEvents = 'none';
            svgRenderer.setAttribute(
                svgRendererAttributeName,
                dsVisualCoverageContainerData.coverageContainerAttributeValue,
            );

            params.svgContainer.appendChild(svgRenderer);
        }

        logger('Container', domElement);

        calculateDsVisualCoverage({
            logger,
            userType,
            svgRenderer,
            printAsciiArt,
            colorByPixelType,
            weightByComponentName,
            requestIdleCallbackFunc,
            dsVisualCoverageContainerData,
            stopVisualCoverageCalculation,
        })
            .then(result => {
                results.push(
                    getDenormalizedCoverageResult({
                        result,
                        dsVisualCoverageContainerData,
                    }),
                );
                if (results.length !== dsVisualCoverageContainersData.length) return;

                logger('🏁 Calculation end');
                const meaningfulResults = filterOutEmptyContainers({ results, logger });
                meaningfulResults.forEach(r => {
                    const percentage = `${r.coverage.toFixed(2)} %`;
                    logger(`Component: ${r.component} - Team: ${r.team} - Coverage: ${percentage}`);
                });

                onComplete({
                    stopped: false,
                    totalDuration: Date.now() - start,
                    dsVisualCoverageResults: meaningfulResults,
                });
            })
            .catch((error: unknown) => {
                const { team, component } = dsVisualCoverageContainerData.coverageContainer;

                const newError = new DsVisualCoverageError(
                    {
                        team,
                        component,
                        userType,
                        stopReason: 'unknownStopReason',
                    },
                    error instanceof Error ? error.message : `${error}`,
                );

                // If you want to keep the original stack trace:
                newError.stack = error instanceof Error ? (error.stack ?? '') : '';
                onError(newError);
            });
    });
}
