import {
    DsVisualCoverageDeNormalizedResult,
    Logger,
    addEmptyContainersWarnings,
    getDenormalizedCoverageResult,
    removeRedundantWarnings,
    DsVisualCoverageError,
    GetContainerData,
} from '@preply/ds-visual-coverage-core';

import type { GetComponentData } from '@preply/ds-visual-coverage-core';

import { calculateDsVisualCoverage } from './calculateDsVisualCoverage';
import { getCoverageContainersData } from './coverageContainer/getCoverageContainersData';
import type { RequestIdleCallback } from './support/getRequestIdleCallback';
import type { CoverageContainerDataAttribute, OnComplete, OnError } from './types';
import { getOpeningHtmlTag } from './utils/getOpeningHtmlTag';
import { nullAttributeValue } from './constants';

type Params = {
    logger: Logger;
    onError: OnError;
    onComplete: OnComplete;
    rootElement: HTMLElement;
    getComponentData: GetComponentData<Element>;
    requestIdleCallbackFunc: RequestIdleCallback;
    stopVisualCoverageCalculation: () => boolean;
    getContainerData: GetContainerData<Element> | undefined;
    coverageContainersDataAttribute: CoverageContainerDataAttribute | undefined;
};

export function calculateDsVisualCoverages(params: Params): void {
    const {
        logger,
        onError,
        onComplete,
        rootElement,
        getComponentData,
        getContainerData,
        requestIdleCallbackFunc,
        stopVisualCoverageCalculation,
        coverageContainersDataAttribute,
    } = params;

    const start = Date.now();

    const dsVisualCoverageContainersData = getCoverageContainersData({
        logger,
        rootElement,
        getContainerData,
        coverageContainersDataAttribute,
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

    if (stopVisualCoverageCalculation()) {
        logger.warn('Coverage calculation is outdated (pre run)');
        onComplete({
            stopped: true,
            totalDuration: -1,
            dsVisualCoverageResults: [],
        });
        return;
    }

    const results: DsVisualCoverageDeNormalizedResult[] = [];
    const analyzedContainers = new Set(dsVisualCoverageContainersData);
    dsVisualCoverageContainersData.forEach(dsVisualCoverageContainerData => {
        const { domElement, attributeValue } = dsVisualCoverageContainerData;
        const coverageContainer = getOpeningHtmlTag(domElement);

        calculateDsVisualCoverage({
            logger,
            getComponentData,
            requestIdleCallbackFunc,
            dsVisualCoverageContainerData,
            stopVisualCoverageCalculation,
            coverageContainersDataAttribute,
        })
            .then(result => {
                analyzedContainers.delete(dsVisualCoverageContainerData);

                results.push(
                    getDenormalizedCoverageResult({
                        result,
                        debugInfo: coverageContainer,
                        coverageContainerAttributeValue: attributeValue,
                    }),
                );

                if (analyzedContainers.size !== 0) return;

                logger.log('🏁 Calculation end');

                addEmptyContainersWarnings({ mutableResults: results });
                results.forEach(r => {
                    r.warnings = removeRedundantWarnings({ warnings: r.warnings });
                    if (r.warnings.length > 0) {
                        logger.warn(`Container: ${r.debugInfo} - Warnings: ${r.warnings}`);
                    } else {
                        const percentage = `${r.coverage.toFixed(2)} %`;
                        logger.log(`Container: ${r.debugInfo} - Coverage: ${percentage}`);
                    }
                });

                onComplete({
                    stopped: false,
                    totalDuration: Date.now() - start,
                    dsVisualCoverageResults: results,
                });
            })
            .catch((error: unknown) => {
                analyzedContainers.delete(dsVisualCoverageContainerData);

                const newError = new DsVisualCoverageError({
                    platform: 'web',
                    stopReason: 'unknownStopReason',
                    debugInfo: attributeValue ?? nullAttributeValue,
                    message: error instanceof Error ? error.message : `${error}`,
                });

                // If you want to keep the original stack trace:
                newError.stack = error instanceof Error ? (error.stack ?? '') : '';
                onError(newError);
            });
    });
}
