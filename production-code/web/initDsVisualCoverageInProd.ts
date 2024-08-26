import * as Sentry from '@sentry/browser';
import {
    createCalculateDsVisualCoverages,
    exposeGlobalDsVisualCoverageObject,
    isLogQueryParamSet,
} from '@preply/ds-visual-coverage-web';
import { createLogger, DsVisualCoverageRunResult } from '@preply/ds-visual-coverage-core';
import type { DWHEvent } from '../logging/dwh';
import { sendDWHEventInAsyncBatch } from '../logging/dwh';
import type { UserType } from './utils/convertDsCoverageToDwhEvent';

import { defaultCheckInterval, defaultIsTimeToRun } from './core/defaultIsTimeToRun';

import {
    generateDsCoverageError,
    convertDsCoverageToDwhEvent,
    generateDsCoverageAllContainersRuntimeInfo,
} from './utils/convertDsCoverageToDwhEvent';

type Params = {
    log?: boolean;
    userType: UserType;
    checkInterval?: number;
    isTimeToRun?: typeof defaultIsTimeToRun;
};

const noop = () => {};

export function initDsVisualCoverageInProd(params: Params) {
    const checkInterval = params.checkInterval ?? defaultCheckInterval;
    const isTimeToRun = params.isTimeToRun ?? defaultIsTimeToRun;

    let coverageIntervalId: ReturnType<typeof setInterval> | undefined;
    let logger: ReturnType<typeof createLogger> = () => {};
    let createCalculateDsVisualCoveragesResult:
        | ReturnType<typeof createCalculateDsVisualCoverages>
        | undefined;

    function trackError(error: unknown) {
        logger(error);

        sendDWHEventInAsyncBatch(generateDsCoverageError({ userType: params.userType, error }));

        Sentry.withScope(scope => {
            scope.setLevel(Sentry.Severity.Error);
            scope.setTag('dsVisualCoverage', 'web');
            Sentry.captureException(error);
        });
    }

    function start() {
        coverageIntervalId = setInterval(() => {
            try {
                if (!isTimeToRun(checkInterval)) {
                    logger('can not run now');
                    return;
                }

                createCalculateDsVisualCoveragesResult?.run({
                    onError: trackError,
                    onComplete: (result: DsVisualCoverageRunResult) => {
                        const resultConverter = convertDsCoverageToDwhEvent(params.userType);

                        result.dsVisualCoverageResults
                            .map(resultConverter)
                            .reduce<DWHEvent[]>((acc, event) => acc.concat(event), [])
                            .forEach(sendDWHEventInAsyncBatch);

                        sendDWHEventInAsyncBatch(
                            generateDsCoverageAllContainersRuntimeInfo(result.totalDuration),
                        );

                        result.dsVisualCoverageResults.forEach(r => {
                            logger(`${r.coverage.toFixed(2)} %`);
                        });

                        logger(result);
                    },
                });
            } catch (error) {
                trackError(error);
            }
        }, checkInterval);
        logger('Interval started');
    }

    function cancel() {
        createCalculateDsVisualCoveragesResult?.cancel();
        clearInterval(coverageIntervalId);
    }

    try {
        // Must not prevent the coverage to run if it fails
        try {
            logger = createLogger(
                (params.log || isLogQueryParamSet(globalThis.location.search)) ?? false,
            );
            exposeGlobalDsVisualCoverageObject();
        } catch (error) {
            trackError(error);
        }

        createCalculateDsVisualCoveragesResult = createCalculateDsVisualCoverages({
            log: false,
            printAsciiArt: false,
            drawAndAppendSvg: false,
            userType: params.userType,
            coverageMode: 'countPerimeters',
        });

        return {
            start,
            cancel,
        };
    } catch (error) {
        trackError(error);
        return {
            start: noop,
            cancel: noop,
        };
    }
}
