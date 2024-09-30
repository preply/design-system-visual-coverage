import * as Sentry from '@sentry/browser';
import {
    createCalculateDsVisualCoverages,
    exposeGlobalDsVisualCoverageObject,
    isLogQueryParamSet,
    DsVisualCoverageWarning
} from '@preply/ds-visual-coverage-web';
import { createLogger, DsVisualCoverageRunResult, DsVisualCoverageDeNormalizedResult } from '@preply/ds-visual-coverage-core';
import type { DWHEvent, UserType } from './utils/convertDsCoverageToDwhEvent';

import { defaultCheckInterval, defaultIsTimeToRun } from './core/defaultIsTimeToRun';

import {
    generateDsCoverageError,
    convertDsCoverageToDwhEvent,
    generateDsCoverageAllContainersRuntimeInfo,
    generateDsCoverageWarning,
} from './utils/convertDsCoverageToDwhEvent';

type Params = {
    log?: boolean;
    userType: UserType;
    checkInterval?: number;
    isTimeToRun?: typeof defaultIsTimeToRun;
};

const noop = () => {};

function sendDWHEventInAsyncBatch(_events:DWHEvent|DWHEvent[]){
    // custom implementation to send the events to the custom DataDog endpoint
}

export function initDsVisualCoverageInProd(params: Params) {
    const checkInterval = params.checkInterval ?? defaultCheckInterval;
    const isTimeToRun = params.isTimeToRun ?? defaultIsTimeToRun;

    let coverageIntervalId: ReturnType<typeof setInterval> | undefined;
    let logger: ReturnType<typeof createLogger> = { log: noop, error: noop, warn: noop };
    let createCalculateDsVisualCoveragesResult:
        | ReturnType<typeof createCalculateDsVisualCoverages>
        | undefined;

    function trackError(error: unknown) {
        logger.error(error);

        sendDWHEventInAsyncBatch(generateDsCoverageError({ userType: params.userType, error }));

        Sentry.withScope(scope => {
            scope.setLevel(Sentry.Severity.Error);
            scope.setTag('dsVisualCoverage', 'web');
            Sentry.captureException(error);
        });
    }

    function trackWarning(result: DsVisualCoverageDeNormalizedResult) {
        logger.warn(result);

        const warningEvent = generateDsCoverageWarning({ userType: params.userType, result });
        sendDWHEventInAsyncBatch(warningEvent);

        Sentry.withScope(scope => {
            scope.setLevel(Sentry.Severity.Warning);
            scope.setTag('dsVisualCoverage', 'web');
            const warning = new DsVisualCoverageWarning(
                {
                    userType: params.userType,
                    warning: result.warnings.join(','),
                    team: result.team,
                    component: result.component,
                },
                `${result.warnings.join(',')}-web-${result.component}-${result.team}`,
            );
            Sentry.captureException(warning);
        });
    }

    function start() {
        coverageIntervalId = setInterval(() => {
            try {
                if (!isTimeToRun(checkInterval)) {
                    logger.warn('can not run now');
                    return;
                }

                createCalculateDsVisualCoveragesResult?.run({
                    onError: trackError,
                    onComplete: (result: DsVisualCoverageRunResult) => {
                        const resultConverter = convertDsCoverageToDwhEvent(params.userType);

                        const resultWithoutWarnings = result.dsVisualCoverageResults.filter(
                            r => r.warnings.length === 0,
                        );
                        resultWithoutWarnings
                            .map(resultConverter)
                            .reduce<DWHEvent[]>((acc, event) => acc.concat(event), [])
                            .forEach(sendDWHEventInAsyncBatch);

                        sendDWHEventInAsyncBatch(
                            generateDsCoverageAllContainersRuntimeInfo(result.totalDuration),
                        );

                        resultWithoutWarnings.forEach(r => {
                            logger.log(`${r.coverage.toFixed(2)} %`);
                        });

                        const resultWithWarnings = result.dsVisualCoverageResults.filter(
                            r => r.warnings.length > 0,
                        );
                        resultWithWarnings.forEach(trackWarning);

                        logger.log(result);
                    },
                });
            } catch (error) {
                trackError(error);
            }
        }, checkInterval);
        logger.log('Interval started');
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
