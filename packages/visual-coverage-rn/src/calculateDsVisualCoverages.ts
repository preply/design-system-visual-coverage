import {
    DsVisualCoverageError,
    removeRedundantWarnings,
    addEmptyContainersWarnings,
    getDenormalizedCoverageResult,
} from '@preply/ds-visual-coverage-core';

import type {
    Logger,
    GetContainerData,
    GetComponentData,
    DsVisualCoverageDeNormalizedResult,
} from '@preply/ds-visual-coverage-core';

import { calculateDsVisualCoverage } from './calculateDsVisualCoverage';
import { getCoverageContainersData } from './coverageContainer/getCoverageContainersData';
import type { OnError, OnComplete, RootSwiftView, ViewMeasurement } from './types';

export type Params = {
    logger: Logger;

    // The async nature of this function is meant for
    // 1. avoid future refactors in case we will move to async calculations
    // 2. align it more with the web version
    onError: OnError;
    onComplete: OnComplete;

    rootSwiftView: RootSwiftView;
    getContainerData: GetContainerData<ViewMeasurement>;
    stopVisualCoverageCalculation: () => boolean;
    getComponentData: GetComponentData<ViewMeasurement>;
};

export function calculateDsVisualCoverages(params: Params): void {
    const {
        logger,
        onError,
        onComplete,
        rootSwiftView,
        getComponentData,
        getContainerData,
        stopVisualCoverageCalculation,
    } = params;

    const start = Date.now();

    const dsVisualCoverageContainersData = getCoverageContainersData({
        logger,
        getContainerData,
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

    logger.log('🎬 Calculation start');

    const results: DsVisualCoverageDeNormalizedResult[] = [];
    const analyzedContainers = new Set(dsVisualCoverageContainersData);
    dsVisualCoverageContainersData.forEach(dsVisualCoverageContainerData => {
        try {
            const result = calculateDsVisualCoverage({
                logger,
                getContainerData,
                getComponentData,
                dsVisualCoverageContainerData,
            });

            analyzedContainers.delete(dsVisualCoverageContainerData);
            results.push(
                getDenormalizedCoverageResult({
                    result,
                    debugInfo:
                        dsVisualCoverageContainerData.coverageContainerAccessibilityIdentifier,
                    coverageContainerAttributeValue:
                        dsVisualCoverageContainerData.coverageContainerAccessibilityIdentifier,
                }),
            );
            if (analyzedContainers.size !== 0) return;

            logger.log('🏁 Calculation end');
            addEmptyContainersWarnings({
                mutableResults: results,
            });
            results.forEach(r => {
                r.warnings = removeRedundantWarnings({ warnings: r.warnings });
                if (r.warnings.length > 0) {
                    logger.warn(`Container: ${r.debugInfo} - Warnings: ${r.warnings}`);
                } else {
                    const percentage = `${r.coverage.toFixed(2)} %`;
                    logger.log(`Container: ${r.debugInfo} - Coverage: ${percentage}`);
                }
            });

            if (stopVisualCoverageCalculation()) {
                logger.log('calculateDsVisualCoverages stopped');
                return;
            }

            onComplete({
                stopped: false,
                totalDuration: Date.now() - start,
                dsVisualCoverageResults: results,
            });
        } catch (error: unknown) {
            analyzedContainers.delete(dsVisualCoverageContainerData);

            const newError = new DsVisualCoverageError({
                platform: 'rn',
                stopReason: 'unknownStopReason',
                debugInfo: dsVisualCoverageContainerData.coverageContainer,
                message: error instanceof Error ? error.message : `${error}`,
            });

            // If you want to keep the original stack trace:
            newError.stack = error instanceof Error ? (error.stack ?? '') : '';
            onError(newError);
        }
    });
}
