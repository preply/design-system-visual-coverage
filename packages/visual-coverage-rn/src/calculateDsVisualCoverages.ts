import {
    ColorByPixelType,
    DsVisualCoverageDeNormalizedResult,
    Logger,
    PixelByPixelType,
    WeightByComponentName,
    filterOutEmptyContainers,
    getDenormalizedCoverageResult,
} from '@preply/ds-visual-coverage-core';

import { calculateDsVisualCoverage } from './calculateDsVisualCoverage';
import { getCoverageContainersData } from './coverageContainer/getCoverageContainersData';
import { DsVisualCoverageError } from './debug/DsVisualCoverageError';
import type { OnComplete, OnError, RootSwiftView, ShouldIgnoreContainer } from './types';

export type Params = {
    logger: Logger;

    // The async nature of this function is meant for
    // 1. avoid future refactors in case we will move to async calculations
    // 2. align it more with the web version
    onError: OnError;
    onComplete: OnComplete;

    printAsciiArt: boolean;
    rootSwiftView: RootSwiftView;
    colorByPixelType: ColorByPixelType;
    pixelByPixelType: PixelByPixelType;
    weightByComponentName: WeightByComponentName;
    shouldIgnoreContainer: ShouldIgnoreContainer;
    stopVisualCoverageCalculation: () => boolean;
};

export function calculateDsVisualCoverages(params: Params): void {
    const {
        logger,
        onError,
        onComplete,
        printAsciiArt,
        rootSwiftView,
        pixelByPixelType,
        colorByPixelType,
        weightByComponentName,
        shouldIgnoreContainer,
        stopVisualCoverageCalculation,
    } = params;

    const start = Date.now();

    const dsVisualCoverageContainersData = getCoverageContainersData({
        logger,
        shouldIgnoreContainer,
        mutableRootSwiftView: rootSwiftView,
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

    const results: DsVisualCoverageDeNormalizedResult[] = [];
    dsVisualCoverageContainersData.forEach(dsVisualCoverageContainerData => {
        try {
            const result = calculateDsVisualCoverage({
                logger,
                printAsciiArt,
                colorByPixelType,
                pixelByPixelType,
                weightByComponentName,
                dsVisualCoverageContainerData,
            });

            results.push(
                getDenormalizedCoverageResult({
                    result,
                    dsVisualCoverageContainerData,
                }),
            );
            if (results.length !== dsVisualCoverageContainersData.length) return;

            logger('🏁 Calculation end');
            const meaningfulResults = filterOutEmptyContainers({
                results,
                logger,
                pixelByPixelType,
            });
            meaningfulResults.forEach(r => {
                logger(`Component: ${r.component} - Team: ${r.team} - Coverage: ${r.coverage}`);
            });

            if (stopVisualCoverageCalculation()) {
                logger('calculateDsVisualCoverages stopped');
                return;
            }

            onComplete({
                stopped: false,
                totalDuration: Date.now() - start,
                dsVisualCoverageResults: meaningfulResults,
            });
        } catch (error: unknown) {
            const { team, component } = dsVisualCoverageContainerData.coverageContainer;

            const newError = new DsVisualCoverageError(
                {
                    team,
                    component,
                    stopReason: 'unknownStopReason',
                },
                error instanceof Error ? error.message : `${error}`,
            );

            // If you want to keep the original stack trace:
            newError.stack = error instanceof Error ? (error.stack ?? '') : '';
            onError(newError);
        }
    });
}
